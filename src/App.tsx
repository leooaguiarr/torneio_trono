import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, History, Plus, RefreshCw, Trash2, Users, Sparkles, Share2 } from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { Header } from './components/Header';
import { LeaderboardView } from './components/LeaderboardView';
import { HistoryTimeline } from './components/HistoryTimeline';
import { QuickLogModal } from './components/QuickLogModal';
import { ParticipantsModal } from './components/ParticipantsModal';
import { ShareRankingModal } from './components/ShareRankingModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { GoogleAuthBanner } from './components/GoogleAuthBanner';
import { Participant, PoopEntry, Timeframe } from './types';
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
  clearAllFirestoreData,
} from './services/firestoreService';

const STORAGE_KEY_SOUND = 'torneio_trono_sound_muted';

const AVATAR_OPTIONS = ['👑', '⚡', '🦁', '🦖', '🤠', '🥷', '🚀', '🔥', '🧘', '🍕', '💩', '🥑', '🌮', '☕', '👾', '🎯'];

export default function App() {
  // Real Firestore Data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [entries, setEntries] = useState<PoopEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

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

  // Sound
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

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Auto register / match participant profile if user signs in
        try {
          const existingParticipant = participants.find(
            (p) => p.userId === user.uid || (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
          );

          if (!existingParticipant) {
            // Pick a random avatar
            const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
            const newParticipant: Participant = {
              id: `p-${user.uid.substring(0, 10)}`,
              name: user.displayName || user.email?.split('@')[0] || 'Guerreiro(a)',
              avatar: randomAvatar,
              color: 'amber',
              createdAt: new Date().toISOString(),
              userId: user.uid,
              email: user.email || undefined,
              photoURL: user.photoURL || undefined,
            };
            await saveParticipantToFirestore(newParticipant);
            addToast('Bem-vindo(a) ao Torneio!', `${newParticipant.name} entrou no ranking!`, randomAvatar);
          } else if (!existingParticipant.userId) {
            // Link existing participant with userId
            await saveParticipantToFirestore({
              ...existingParticipant,
              userId: user.uid,
              email: user.email || existingParticipant.email,
              photoURL: user.photoURL || existingParticipant.photoURL,
            });
          }
        } catch (err) {
          console.error('Error auto-syncing Google participant:', err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [participants]);

  // 2. Firebase Listeners (Live Sync for Data)
  useEffect(() => {
    testConnection();

    const unsubParticipants = subscribeToParticipants(
      (updatedParticipants) => {
        setParticipants(updatedParticipants);
        setIsLoading(false);
      },
      (err) => {
        console.error('Participants subscription error:', err);
        setIsLoading(false);
      }
    );

    const unsubEntries = subscribeToEntries(
      (updatedEntries) => {
        setEntries(updatedEntries);
      },
      (err) => {
        console.error('Entries subscription error:', err);
      }
    );

    return () => {
      unsubParticipants();
      unsubEntries();
    };
  }, []);

  // Compute matched current participant
  const currentParticipant = useMemo(() => {
    if (!currentUser) return null;
    return participants.find(
      (p) =>
        p.userId === currentUser.uid ||
        (p.email && currentUser.email && p.email.toLowerCase() === currentUser.email.toLowerCase())
    ) || null;
  }, [currentUser, participants]);

  const rankings = useMemo(() => {
    return computeRankings(participants, entries, timeframe);
  }, [participants, entries, timeframe]);

  // Sign In with Google
  const handleSignInWithGoogle = async () => {
    triggerHaptic(20);
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if already in participants
      const exists = participants.some(
        (p) => p.userId === user.uid || (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );

      if (!exists) {
        const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
        const newParticipant: Participant = {
          id: `p-${user.uid.substring(0, 10)}`,
          name: user.displayName || user.email?.split('@')[0] || 'Guerreiro(a)',
          avatar: randomAvatar,
          color: 'amber',
          createdAt: new Date().toISOString(),
          userId: user.uid,
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
        };
        await saveParticipantToFirestore(newParticipant);
      }

      addToast('Conectado com sucesso!', `Olá, ${user.displayName || 'Guerreiro'}!`, '🎉');
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        addToast('Erro ao entrar', 'Não foi possível conectar com o Google.', '⚠️');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    triggerHaptic(15);
    try {
      await signOut(auth);
      addToast('Desconectado', 'Você saiu da sua conta Google.', '👋');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

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
      createdBy: currentUser?.uid,
    };

    try {
      await saveEntryToFirestore(newEntry);
      addToast('+1 Ida Registrada!', `${personName} pontuou no Torneio!`, person?.avatar || '🚽');
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
        };
        await saveEntryToFirestore(updatedEntry);
        addToast('Registro Atualizado!', `Dados de ${personName} foram alterados.`, '✏️');
      } else {
        const newId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newEntry: PoopEntry = {
          ...entryData,
          id: newId,
          createdBy: currentUser?.uid,
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
    const targetId = participantId || currentParticipant?.id || participants[0]?.id;
    setQuickLogParticipantId(targetId);
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
      addToast('Amigo Adicionado!', `${newParticipant.name} entrou no torneio!`, newParticipant.avatar);
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
      addToast('Amigo Removido', 'Participante excluído.', '👋');
    } catch (err) {
      console.error('Error deleting participant:', err);
    }
  };

  // Zero database completely
  const handleClearAll = async () => {
    triggerHaptic(20);
    if (window.confirm('Deseja realmente ZERAR todo o banco de dados (remover participantes e todas as idas)?')) {
      try {
        await clearAllFirestoreData();
        setParticipants([]);
        setEntries([]);
        addToast('Banco Zerado!', 'Todos os dados foram excluídos.', '🧹');
      } catch (err) {
        console.error('Error clearing data:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header */}
      <Header
        onOpenParticipants={() => setIsParticipantsModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        totalEntriesCount={entries.length}
        onClearAll={handleClearAll}
        currentUser={currentUser}
        currentParticipant={currentParticipant}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4 pb-20">
        {/* Google Sign-in Banner (if not signed in or signed in) */}
        <GoogleAuthBanner
          currentUser={currentUser}
          currentParticipant={currentParticipant}
          onSignInWithGoogle={handleSignInWithGoogle}
          onSignOut={handleSignOut}
          isSigningIn={isSigningIn}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('ranking');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ranking'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Placar do Trono</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('history');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <History className="w-3.5 h-3.5 text-stone-500" />
              <span>Histórico ({entries.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsParticipantsModalOpen(true)}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Amigo</span>
          </button>
        </div>

        {/* Tab 1: Leaderboard */}
        {activeTab === 'ranking' && (
          <LeaderboardView
            rankings={rankings}
            timeframe={timeframe}
            onChangeTimeframe={setTimeframe}
            onQuickAddPoint={handleQuickAddPoint}
            onOpenNewEntry={() => handleOpenDetailedLog(currentParticipant?.id)}
            onOpenDetailedLog={handleOpenDetailedLog}
            onOpenAddParticipant={() => setIsParticipantsModalOpen(true)}
          />
        )}

        {/* Tab 2: History */}
        {activeTab === 'history' && (
          <HistoryTimeline
            entries={entries}
            participants={participants}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onOpenNewEntry={() => handleOpenDetailedLog(currentParticipant?.id)}
          />
        )}
      </main>

      {/* Modals */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => {
          setIsQuickLogOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        participants={participants}
        initialParticipantId={quickLogParticipantId || currentParticipant?.id}
        editingEntry={editingEntry}
        soundMuted={soundMuted}
        onOpenAddParticipant={() => setIsParticipantsModalOpen(true)}
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
