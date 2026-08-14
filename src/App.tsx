import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, History, Plus, RefreshCw, Trash2, Users, Sparkles, Share2 } from 'lucide-react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { Header } from './components/Header';
import { LeaderboardView } from './components/LeaderboardView';
import { HistoryTimeline } from './components/HistoryTimeline';
import { QuickLogModal } from './components/QuickLogModal';
import { ParticipantsModal } from './components/ParticipantsModal';
import { ShareRankingModal } from './components/ShareRankingModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { Participant, PoopEntry, Timeframe } from './types';
import { INITIAL_PARTICIPANTS, generateSeedEntries } from './data/initialData';
import { computeRankings } from './utils/rankingCalculations';
import { triggerHaptic, playSuccessSound, playPopSound } from './utils/soundEffects';
import confetti from 'canvas-confetti';
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data State
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [entries, setEntries] = useState<PoopEntry[]>([]);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(true);

  // Tab: 'ranking' or 'history'
  const [activeTab, setActiveTab] = useState<'ranking' | 'history'>('ranking');
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
    }, 2800);
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

  // 1. Firebase Listeners
  useEffect(() => {
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Seed if empty
    seedInitialFirestoreData(INITIAL_PARTICIPANTS, generateSeedEntries()).catch((err) => {
      console.error('Error seeding initial Firestore data:', err);
    });

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

  const handleLoginGoogle = async () => {
    triggerHaptic(15);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      addToast('Conectado!', `Bem-vindo, ${res.user.displayName || 'Competidor'}!`, '🎉');
    } catch {
      addToast('Aviso', 'Não foi possível conectar com o Google.', '⚠️');
    }
  };

  const handleLogout = async () => {
    triggerHaptic(10);
    try {
      await signOut(auth);
      addToast('Desconectado', 'Sua sessão foi encerrada.', '👋');
    } catch {
      // ignore
    }
  };

  const rankings = useMemo(() => {
    return computeRankings(participants, entries, timeframe);
  }, [participants, entries, timeframe]);

  // 1-Tap Quick Point directly from Ranking Card!
  const handleQuickAddPoint = async (participantId: string) => {
    triggerHaptic([20, 30, 40]);
    if (!soundMuted) {
      playSuccessSound(false);
    }
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    const person = participants.find((p) => p.id === participantId);
    const personName = person ? person.name : 'Participante';

    const newId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEntry: PoopEntry = {
      id: newId,
      participantId,
      timestamp: new Date().toISOString(),
      effortLevel: 3,
      location: 'casa',
      createdBy: currentUser?.uid || undefined,
    };

    try {
      await saveEntryToFirestore(newEntry);
      addToast('+1 Ponto no Placar!', `${personName} pontuou no Trono!`, person?.avatar || '🚽');
    } catch (err) {
      console.error('Error saving quick point:', err);
      addToast('Erro ao salvar', 'Não foi possível gravar na nuvem.', '❌');
    }
  };

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
        addToast('Registro Atualizado!', `Dados de ${personName} foram alterados.`, '✏️');
      } else {
        const newId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newEntry: PoopEntry = {
          ...entryData,
          id: newId,
          createdBy: currentUser?.uid || undefined,
        };
        await saveEntryToFirestore(newEntry);
        addToast('Ida Registrada!', `${personName} pontuou no Torneio!`, person?.avatar || '🚽');
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
      addToast('Registro Excluído', 'A ida foi removida do placar.', '🗑️');
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  const handleEditEntry = (entry: PoopEntry) => {
    setEditingEntry(entry);
    setIsQuickLogOpen(true);
  };

  const handleOpenDetailedLog = (participantId?: string) => {
    setQuickLogParticipantId(participantId || participants[0]?.id);
    setEditingEntry(null);
    setIsQuickLogOpen(true);
  };

  // Participant Actions
  const handleAddParticipant = async (pData: Omit<Participant, 'id' | 'createdAt'>) => {
    const newParticipant: Participant = {
      ...pData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      await saveParticipantToFirestore(newParticipant);
      addToast('Amigo Adicionado!', `${newParticipant.name} entrou na disputa!`, newParticipant.avatar);
    } catch (err) {
      console.error('Error adding participant:', err);
    }
  };

  const handleUpdateParticipant = async (updated: Participant) => {
    try {
      await saveParticipantToFirestore(updated);
      addToast('Amigo Atualizado!', `Dados de ${updated.name} foram salvos.`, updated.avatar);
    } catch (err) {
      console.error('Error updating participant:', err);
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    try {
      await deleteParticipantFromFirestore(id);
      addToast('Amigo Removido', 'Participante excluído da liga.', '👋');
    } catch (err) {
      console.error('Error deleting participant:', err);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Deseja recarregar os dados de exemplo da Liga do Trono na nuvem?')) {
      try {
        await resetFirestoreToSample();
        addToast('Dados Restaurados', 'Campeonato restaurado com dados de exemplo.', '✨');
      } catch (err) {
        console.error('Error resetting data:', err);
      }
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('ATENÇÃO: Deseja zerar todas as idas ao banheiro na nuvem?')) {
      try {
        await clearAllEntriesFromFirestore();
        addToast('Placar Zerado', 'Todas as idas foram zeradas.', '🧹');
      } catch (err) {
        console.error('Error clearing entries:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] text-[#1E1E24] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#FFD93D]">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header */}
      <Header
        participants={participants}
        onOpenNewEntry={() => handleOpenDetailedLog()}
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
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 pb-24">
        {/* Simple Tab Switcher */}
        <div className="flex items-center justify-between gap-2 border-b-2 border-stone-900/10 pb-3">
          <div className="flex items-center gap-2 bg-stone-200/90 p-1 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('ranking');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ranking'
                  ? 'bg-[#FFD93D] text-stone-950 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <Trophy className="w-4 h-4 text-stone-900" />
              <span>Placar & 1-Toque</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('history');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#4D96FF] text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <History className="w-4 h-4 text-current" />
              <span>Histórico ({entries.length})</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenDetailedLog()}
            className="hidden sm:flex px-3.5 py-2 rounded-xl text-xs font-black bg-[#FF6B6B] hover:bg-[#ff5252] text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Registro Detalhado</span>
          </button>
        </div>

        {/* Tab 1: Leaderboard with Instant 1-Tap */}
        {activeTab === 'ranking' && (
          <LeaderboardView
            rankings={rankings}
            timeframe={timeframe}
            onChangeTimeframe={setTimeframe}
            onQuickAddPoint={handleQuickAddPoint}
            onOpenDetailedLog={handleOpenDetailedLog}
          />
        )}

        {/* Tab 2: History */}
        {activeTab === 'history' && (
          <HistoryTimeline
            entries={entries}
            participants={participants}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onOpenNewEntry={() => handleOpenDetailedLog()}
          />
        )}

        {/* Quick Footer Utilities */}
        <div className="pt-6 border-t-2 border-stone-900/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 font-bold">
          <div className="flex items-center gap-2">
            <span>🚽 <strong>Torneio do Trono</strong> • Liga dos Amigos</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="hover:text-stone-950 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restaurar Exemplo</span>
            </button>
            <span>•</span>
            <button
              onClick={handleClearAllData}
              className="hover:text-rose-600 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Zerar Placar</span>
            </button>
          </div>
        </div>
      </main>

      {/* Floating Action Button on Mobile */}
      <div className="fixed bottom-4 right-4 sm:hidden z-40">
        <button
          onClick={() => handleOpenDetailedLog()}
          className="px-4 py-3 rounded-2xl font-black text-xs bg-[#FF6B6B] text-white border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Registrar Ida</span>
        </button>
      </div>

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
