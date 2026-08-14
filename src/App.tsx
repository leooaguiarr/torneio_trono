import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, History, BarChart3, Plus, Sparkles, RefreshCw, Trash2, Users } from 'lucide-react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { Header } from './components/Header';
import { LeaderboardView } from './components/LeaderboardView';
import { HistoryTimeline } from './components/HistoryTimeline';
import { StatsDashboard } from './components/StatsDashboard';
import { QuickLogModal } from './components/QuickLogModal';
import { ParticipantsModal } from './components/ParticipantsModal';
import { ShareRankingModal } from './components/ShareRankingModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { Participant, PoopEntry, Timeframe } from './types';
import { INITIAL_PARTICIPANTS, generateSeedEntries } from './data/initialData';
import { computeRankings } from './utils/rankingCalculations';
import { triggerHaptic } from './utils/soundEffects';
import { auth, googleProvider, testConnection } from './lib/firebase';
import {
  subscribeToParticipants,
  subscribeToEntries,
  saveParticipantToFirestore,
  deleteParticipantFromFirestore,
  saveEntryToFirestore,
  deleteEntryFromFirestore,
  resetFirestoreToSample,
  clearAllEntriesFromFirestore,
  seedInitialFirestoreData,
} from './services/firestoreService';

const STORAGE_KEY_SOUND = 'torneio_trono_sound_muted';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Firestore Real-Time Data State
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [entries, setEntries] = useState<PoopEntry[]>([]);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(true);

  // UI States
  const [activeTab, setActiveTab] = useState<'ranking' | 'feed' | 'stats'>('ranking');
  const [timeframe, setTimeframe] = useState<Timeframe>('this_week');

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogParticipantId, setQuickLogParticipantId] = useState<string | undefined>(undefined);
  const [editingEntry, setEditingEntry] = useState<PoopEntry | null>(null);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message?: string, emoji?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, emoji }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sound State
  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SOUND) === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSound = () => {
    triggerHaptic(10);
    setSoundMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_SOUND, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // 1. Initialize Firebase connection and Listeners on Mount
  useEffect(() => {
    // Validate connection to Firestore
    testConnection();

    // Listen to Firebase Auth
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Check & seed initial sample data if empty
    seedInitialFirestoreData(INITIAL_PARTICIPANTS, generateSeedEntries()).catch((err) => {
      console.error('Error seeding initial Firestore data:', err);
    });

    // Real-time Participants Listener
    const unsubParticipants = subscribeToParticipants(
      (updatedParticipants) => {
        if (updatedParticipants.length > 0) {
          setParticipants(updatedParticipants);
        }
        setIsCloudSyncing(true);
      },
      (err) => {
        console.error('Participants subscription error:', err);
        setIsCloudSyncing(false);
      }
    );

    // Real-time Entries Listener
    const unsubEntries = subscribeToEntries(
      (updatedEntries) => {
        setEntries(updatedEntries);
        setIsCloudSyncing(true);
      },
      (err) => {
        console.error('Entries subscription error:', err);
        setIsCloudSyncing(false);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubParticipants();
      unsubEntries();
    };
  }, []);

  // Google Login / Logout
  const handleLoginGoogle = async () => {
    triggerHaptic(15);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      addToast('Conectado!', `Bem-vindo, ${res.user.displayName || 'Competidor'}!`, '🎉');
    } catch (err: unknown) {
      console.error('Google Sign In error:', err);
      addToast('Aviso', 'Não foi possível conectar com o Google.', '⚠️');
    }
  };

  const handleLogout = async () => {
    triggerHaptic(10);
    try {
      await signOut(auth);
      addToast('Desconectado', 'Sua sessão foi encerrada.', '👋');
    } catch (err) {
      console.error('Sign Out error:', err);
    }
  };

  // Compute rankings reactively
  const rankings = useMemo(() => {
    return computeRankings(participants, entries, timeframe);
  }, [participants, entries, timeframe]);

  // Entry Actions (Synced directly to Firestore)
  const handleSaveEntry = async (entryData: Omit<PoopEntry, 'id'>, existingId?: string) => {
    const person = participants.find((p) => p.id === entryData.participantId);
    const personName = person ? person.name : 'Participante';

    try {
      if (existingId) {
        const updatedEntry: PoopEntry = {
          ...entryData,
          id: existingId,
          createdBy: currentUser?.uid || undefined,
        };
        await saveEntryToFirestore(updatedEntry);
        addToast('Entrada Atualizada!', `Registro de ${personName} salvo na nuvem.`, '✏️');
      } else {
        const newId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newEntry: PoopEntry = {
          ...entryData,
          id: newId,
          createdBy: currentUser?.uid || undefined,
        };
        await saveEntryToFirestore(newEntry);
        addToast('Novo Ponto no Ranking!', `${personName} pontuou no Torneio do Trono!`, '🚽');
      }
    } catch (err) {
      console.error('Error saving entry:', err);
      addToast('Erro ao salvar', 'Não foi possível gravar na nuvem.', '❌');
    }
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (id: string) => {
    triggerHaptic(20);
    try {
      await deleteEntryFromFirestore(id);
      addToast('Registro Excluído', 'A ida ao banheiro foi removida do placar.', '🗑️');
    } catch (err) {
      console.error('Error deleting entry:', err);
      addToast('Erro ao excluir', 'Não foi possível remover da nuvem.', '❌');
    }
  };

  const handleEditEntry = (entry: PoopEntry) => {
    setEditingEntry(entry);
    setIsQuickLogOpen(true);
  };

  const handleQuickLogForUser = (pId: string) => {
    setQuickLogParticipantId(pId);
    setEditingEntry(null);
    setIsQuickLogOpen(true);
  };

  const handleOpenNewEntryModal = () => {
    setQuickLogParticipantId(participants[0]?.id);
    setEditingEntry(null);
    setIsQuickLogOpen(true);
  };

  // Participant Actions (Synced to Firestore)
  const handleAddParticipant = async (pData: Omit<Participant, 'id' | 'createdAt'>) => {
    const newParticipant: Participant = {
      ...pData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      await saveParticipantToFirestore(newParticipant);
      addToast('Amigo Adicionado!', `${newParticipant.name} entrou na disputa do trono!`, newParticipant.avatar);
    } catch (err) {
      console.error('Error adding participant:', err);
      addToast('Erro', 'Não foi possível salvar o amigo no banco.', '❌');
    }
  };

  const handleUpdateParticipant = async (updated: Participant) => {
    try {
      await saveParticipantToFirestore(updated);
      addToast('Perfil Atualizado!', `Dados de ${updated.name} foram salvos.`, updated.avatar);
    } catch (err) {
      console.error('Error updating participant:', err);
      addToast('Erro', 'Não foi possível atualizar o participante.', '❌');
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    try {
      await deleteParticipantFromFirestore(id);
      addToast('Competidor Removido', 'Participante excluído da liga.', '👋');
    } catch (err) {
      console.error('Error deleting participant:', err);
      addToast('Erro', 'Não foi possível excluir o participante.', '❌');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Deseja recarregar os dados de exemplo da Liga do Trono na nuvem Firebase?')) {
      try {
        await resetFirestoreToSample();
        addToast('Dados Recarregados', 'Campeonato restaurado com dados de exemplo.', '✨');
      } catch (err) {
        console.error('Error resetting data:', err);
        addToast('Erro', 'Falha ao restaurar dados de exemplo.', '❌');
      }
    }
  };

  const handleClearAllData = async () => {
    if (
      window.confirm(
        'ATENÇÃO: Deseja zerar todos os registros de idas ao banheiro na nuvem? Essa ação não pode ser desfeita.'
      )
    ) {
      try {
        await clearAllEntriesFromFirestore();
        addToast('Placar Zerado', 'Todos os registros foram limpos para novo campeonato.', '🧹');
      } catch (err) {
        console.error('Error clearing entries:', err);
        addToast('Erro', 'Falha ao zerar registros.', '❌');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] text-[#1E1E24] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#FFD93D]">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />

      {/* Navigation Header */}
      <Header
        participants={participants}
        onOpenNewEntry={handleOpenNewEntryModal}
        onOpenParticipants={() => setIsParticipantsModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        totalEntriesCount={entries.length}
        isCloudSyncing={isCloudSyncing}
        currentUser={currentUser}
        onLoginGoogle={handleLoginGoogle}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-28 md:pb-12">
        {/* Navigation Tabs (Desktop & Tablet) */}
        <div className="flex items-center justify-between border-b-2 border-stone-900/10 pb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-200/80 p-1.5 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button
              id="tab-ranking"
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('ranking');
              }}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ranking'
                  ? 'bg-[#FFD93D] text-stone-950 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60 border-2 border-transparent'
              }`}
            >
              <Trophy className="w-4 h-4 text-stone-900" />
              <span>Campeonato</span>
            </button>

            <button
              id="tab-feed"
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('feed');
              }}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-[#4D96FF] text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60 border-2 border-transparent'
              }`}
            >
              <History className="w-4 h-4 text-current" />
              <span>Histórico ({entries.length})</span>
            </button>

            <button
              id="tab-stats"
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('stats');
              }}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-[#6BCB77] text-stone-950 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60 border-2 border-transparent'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-stone-900" />
              <span>Estatísticas</span>
            </button>
          </div>

          {/* Quick Friend 1-Tap Log Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-stone-700 font-bold flex-wrap">
            <span className="hidden sm:inline">1-Clique:</span>
            {participants.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => handleQuickLogForUser(p.id)}
                title={`Registrar ida para ${p.name}`}
                className="px-2.5 py-1.5 rounded-xl bg-white border-2 border-stone-900 hover:bg-[#FFD93D] text-stone-900 font-black transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[36px]"
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
                <span className="text-[#FF6B6B] font-black">+1</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'ranking' && (
          <LeaderboardView
            rankings={rankings}
            timeframe={timeframe}
            onChangeTimeframe={setTimeframe}
            onQuickLogForUser={handleQuickLogForUser}
          />
        )}

        {activeTab === 'feed' && (
          <HistoryTimeline
            entries={entries}
            participants={participants}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onOpenNewEntry={handleOpenNewEntryModal}
          />
        )}

        {activeTab === 'stats' && (
          <StatsDashboard
            entries={entries}
            participants={participants}
            timeframe={timeframe}
          />
        )}

        {/* Bottom Utility Bar (Reset & Clear) */}
        <div className="pt-6 pb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-700 font-bold border-t-2 border-stone-900/10">
          <div className="flex items-center gap-2">
            <span>🚽 <strong>Torneio do Trono</strong> • Conectado ao Firebase Firestore</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="hover:text-stone-950 hover:underline transition-colors flex items-center gap-1 cursor-pointer font-extrabold"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Recarregar Exemplo na Nuvem</span>
            </button>
            <span>•</span>
            <button
              onClick={handleClearAllData}
              className="hover:text-rose-600 hover:underline transition-colors flex items-center gap-1 cursor-pointer font-extrabold"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Zerar Placar na Nuvem</span>
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Dock Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenNewEntry={handleOpenNewEntryModal}
        onOpenParticipants={() => setIsParticipantsModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        soundMuted={soundMuted}
        entriesCount={entries.length}
      />

      {/* Modals */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => {
          setIsQuickLogOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        participants={participants}
        initialParticipantId={quickLogParticipantId}
        editingEntry={editingEntry}
        soundMuted={soundMuted}
      />

      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        participants={participants}
        onAddParticipant={handleAddParticipant}
        onUpdateParticipant={handleUpdateParticipant}
        onDeleteParticipant={handleDeleteParticipant}
        soundMuted={soundMuted}
      />

      <ShareRankingModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        rankings={rankings}
        timeframe={timeframe}
        soundMuted={soundMuted}
      />
    </div>
  );
}
