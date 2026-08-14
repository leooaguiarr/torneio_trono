import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, History } from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { Header } from './components/Header';
import { LeaderboardView } from './components/LeaderboardView';
import { HistoryTimeline } from './components/HistoryTimeline';
import { QuickLogModal } from './components/QuickLogModal';
import { QuickLocationModal } from './components/QuickLocationModal';
import { WelcomeCagaoModal } from './components/WelcomeCagaoModal';
import { MonthlyChampionModal } from './components/MonthlyChampionModal';
import { ShareRankingModal } from './components/ShareRankingModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { GoogleAuthBanner } from './components/GoogleAuthBanner';
import { Participant, PoopEntry, Timeframe, LocationType, EffortLevel, MonthWinnerRecord } from './types';
import { computeRankings } from './utils/rankingCalculations';
import { getRandomFunnyNickname, getDeterministicFunnyNickname } from './utils/funnyTitles';
import { triggerHaptic } from './utils/soundEffects';
import { auth, googleProvider, testConnection } from './lib/firebase';
import {
  subscribeToParticipants,
  subscribeToEntries,
  subscribeToLatestChampion,
  saveParticipantToFirestore,
  saveEntryToFirestore,
  deleteEntryFromFirestore,
  crownMonthlyChampion,
} from './services/firestoreService';

const STORAGE_KEY_SOUND = 'torneio_trono_sound_muted';
const STORAGE_KEY_SEEN_WELCOME = 'torneio_trono_seen_welcome_';
const STORAGE_KEY_SEEN_CHAMPION_POPUP = 'torneio_trono_seen_champion_';

const AVATAR_OPTIONS = ['👑', '⚡', '🦁', '🦖', '🤠', '🥷', '🚀', '🔥', '🧘', '🍕', '💩', '🥑', '🌮', '☕', '👾', '🎯'];

export default function App() {
  // Real Firestore Data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [entries, setEntries] = useState<PoopEntry[]>([]);
  const [latestChampionRecord, setLatestChampionRecord] = useState<MonthWinnerRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Tab: 'ranking' or 'history'
  const [activeTab, setActiveTab] = useState<'ranking' | 'history'>('ranking');
  const [timeframe, setTimeframe] = useState<Timeframe>('this_month');

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogParticipantId, setQuickLogParticipantId] = useState<string | undefined>(undefined);
  const [editingEntry, setEditingEntry] = useState<PoopEntry | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Quick Location Modal for "+1 Ida"
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [locationTargetParticipant, setLocationTargetParticipant] = useState<Participant | null>(null);

  // "Bem-vindo Cagão!" Popup Modal
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [welcomeParticipant, setWelcomeParticipant] = useState<Participant | null>(null);
  const [welcomeNickname, setWelcomeNickname] = useState<string>('');

  // Monthly Champion Modal
  const [isChampionModalOpen, setIsChampionModalOpen] = useState<boolean>(false);

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
            const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
            const assignedNickname = getRandomFunnyNickname();
            const newParticipant: Participant = {
              id: `p-${user.uid.substring(0, 10)}`,
              name: user.displayName || user.email?.split('@')[0] || 'Guerreiro(a)',
              nickname: assignedNickname,
              avatar: randomAvatar,
              color: 'amber',
              createdAt: new Date().toISOString(),
              userId: user.uid,
              email: user.email || undefined,
              photoURL: user.photoURL || undefined,
            };
            await saveParticipantToFirestore(newParticipant);

            // Trigger "Bem-vindo Cagão!" popup
            setWelcomeParticipant(newParticipant);
            setWelcomeNickname(assignedNickname);
            setIsWelcomeModalOpen(true);
          } else {
            const nickname = existingParticipant.nickname || getDeterministicFunnyNickname(user.uid);
            if (!existingParticipant.nickname || !existingParticipant.userId) {
              await saveParticipantToFirestore({
                ...existingParticipant,
                nickname,
                userId: user.uid,
                email: user.email || existingParticipant.email,
                photoURL: user.photoURL || existingParticipant.photoURL,
              });
            }

            // Check if user should see welcome popup this session
            const seenKey = STORAGE_KEY_SEEN_WELCOME + user.uid;
            if (!sessionStorage.getItem(seenKey)) {
              sessionStorage.setItem(seenKey, 'true');
              setWelcomeParticipant({
                ...existingParticipant,
                nickname,
              });
              setWelcomeNickname(nickname);
              setIsWelcomeModalOpen(true);
            }
          }
        } catch (err) {
          console.error('Error auto-syncing Google participant:', err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [participants]);

  // 2. Firebase Listeners (Live Sync for Data & Champions)
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

    const unsubChampion = subscribeToLatestChampion(
      (champion) => {
        setLatestChampionRecord(champion);
        if (champion) {
          // Check if this user has already seen this month's champion popup
          const seenKey = STORAGE_KEY_SEEN_CHAMPION_POPUP + champion.monthKey;
          if (!localStorage.getItem(seenKey)) {
            localStorage.setItem(seenKey, 'true');
            setIsChampionModalOpen(true);
          }
        }
      },
      (err) => {
        console.error('Champion subscription error:', err);
      }
    );

    return () => {
      unsubParticipants();
      unsubEntries();
      unsubChampion();
    };
  }, []);

  // 3. Automatic End-of-Month Calculation and Reset Detection
  useEffect(() => {
    if (participants.length === 0 || entries.length === 0) return;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Filter past month entries if any exist from a previous month that needs archiving
    const entriesFromPastMonths = entries.filter((e) => {
      const entryDate = new Date(e.timestamp);
      const entryMonthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
      return entryMonthKey < currentMonthKey;
    });

    if (entriesFromPastMonths.length > 0) {
      // Find the most recent past month that had entries
      const pastMonths: string[] = Array.from(
        new Set<string>(
          entriesFromPastMonths.map((e) => {
            const d = new Date(e.timestamp);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          })
        )
      ).sort();

      const lastPastMonthKey: string = pastMonths[pastMonths.length - 1];

      // If we haven't crowned for this past month yet, compute winner and crown!
      if (!latestChampionRecord || latestChampionRecord.monthKey < lastPastMonthKey) {
        const [year, month] = lastPastMonthKey.split('-').map(Number);
        const monthDate = new Date(year, month - 1, 1);
        const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        const pastMonthEntries = entries.filter((e) => {
          const d = new Date(e.timestamp);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        });

        const stats = computeRankings(participants, pastMonthEntries, 'all_time');
        const winnerStat = stats.find((s) => s.totalCount > 0);

        if (winnerStat) {
          const championRecord: MonthWinnerRecord = {
            monthKey: lastPastMonthKey,
            monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            participantId: winnerStat.participant.id,
            participantName: winnerStat.participant.name,
            participantAvatar: winnerStat.participant.avatar,
            participantPhotoURL: winnerStat.participant.photoURL,
            nickname: winnerStat.participant.nickname || 'Campeão da Cagada',
            totalCount: winnerStat.totalCount,
            timestamp: new Date().toISOString(),
          };

          crownMonthlyChampion(championRecord, participants).catch((err) => {
            console.error('Error auto crowning monthly champion:', err);
          });
        }
      }
    }
  }, [entries, participants, latestChampionRecord]);

  // Compute matched current participant
  const currentParticipant = useMemo(() => {
    if (!currentUser) return null;
    return (
      participants.find(
        (p) =>
          p.userId === currentUser.uid ||
          (p.email && currentUser.email && p.email.toLowerCase() === currentUser.email.toLowerCase())
      ) || null
    );
  }, [currentUser, participants]);

  // Reigning champion participant object
  const championParticipant = useMemo(() => {
    return participants.find((p) => p.isCurrentChampion) || null;
  }, [participants]);

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
      const existing = participants.find(
        (p) => p.userId === user.uid || (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );

      const assignedNickname = existing?.nickname || getRandomFunnyNickname();

      if (!existing) {
        const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
        const newParticipant: Participant = {
          id: `p-${user.uid.substring(0, 10)}`,
          name: user.displayName || user.email?.split('@')[0] || 'Guerreiro(a)',
          nickname: assignedNickname,
          avatar: randomAvatar,
          color: 'amber',
          createdAt: new Date().toISOString(),
          userId: user.uid,
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
        };
        await saveParticipantToFirestore(newParticipant);
        setWelcomeParticipant(newParticipant);
      } else {
        setWelcomeParticipant(existing);
      }

      setWelcomeNickname(assignedNickname);
      setIsWelcomeModalOpen(true);
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

  // Trigger Location Question Modal on "+1 Ida" click
  const handleOpenLocationQuestion = (participantId?: string) => {
    if (!currentUser) {
      handleSignInWithGoogle();
      return;
    }

    const targetId = participantId || currentParticipant?.id || participants[0]?.id;
    const targetPerson = participants.find((p) => p.id === targetId) || currentParticipant;

    if (!targetPerson) {
      handleSignInWithGoogle();
      return;
    }

    triggerHaptic(15);
    setLocationTargetParticipant(targetPerson);
    setIsLocationModalOpen(true);
  };

  // Confirm +1 Ida from QuickLocationModal
  const handleConfirmLocationPoint = async (location: LocationType, effortLevel: EffortLevel) => {
    if (!currentUser || !locationTargetParticipant) return;

    const person = locationTargetParticipant;
    const newId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEntry: PoopEntry = {
      id: newId,
      participantId: person.id,
      timestamp: new Date().toISOString(),
      effortLevel,
      location,
      createdBy: currentUser.uid,
    };

    try {
      await saveEntryToFirestore(newEntry);

      // Funny toast feedback based on location
      switch (location) {
        case 'trabalho':
          addToast('+1 no Trabalho! 💼', 'Cagada Remunerada computada com louvor! 💸', '🤑');
          break;
        case 'casa':
          addToast('+1 em Casa! 🏠', 'No trono sagrado e climatizado!', '👑');
          break;
        case 'role':
          addToast('+1 no Rolê! 🍻', 'Guerreiro de banheiro de boteco!', '🛡️');
          break;
        case 'publico':
          addToast('+1 no Shopping / Público! 🏢', 'Sem frescura com a porcelana alheia!', '🛒');
          break;
        case 'academia':
          addToast('+1 na Academia! 💪', 'O pré-treino foi direto pro ralo!', '⚡');
          break;
        case 'viagem':
          addToast('+1 em Viagem! ✈️', 'Território internacional devidamente colonizado!', '🗺️');
          break;
        default:
          addToast('+1 Ida Registrada! 🚽', `${person.name} pontuou no Torneio!`, person.avatar || '💩');
      }
    } catch (err) {
      console.error('Error saving quick point:', err);
      addToast('Erro ao salvar', 'Não foi possível gravar na nuvem.', '❌');
    }
  };

  const handleSaveEntry = async (entryData: Omit<PoopEntry, 'id'>, existingId?: string) => {
    if (!currentUser) {
      handleSignInWithGoogle();
      return;
    }

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
    if (!currentUser) {
      handleSignInWithGoogle();
      return;
    }
    const targetId = participantId || currentParticipant?.id || participants[0]?.id;
    setQuickLogParticipantId(targetId);
    setEditingEntry(null);
    setIsQuickLogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header (No clear button, shows reigning status) */}
      <Header
        onOpenShare={() => setIsShareModalOpen(true)}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        totalEntriesCount={entries.length}
        currentUser={currentUser}
        currentParticipant={currentParticipant}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4 pb-20">
        {/* Google Sign-in Banner */}
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
        </div>

        {/* Tab 1: Leaderboard */}
        {activeTab === 'ranking' && (
          <LeaderboardView
            rankings={rankings}
            timeframe={timeframe}
            onChangeTimeframe={setTimeframe}
            onQuickAddPoint={handleOpenLocationQuestion}
            onOpenNewEntry={() => handleOpenLocationQuestion(currentParticipant?.id)}
            onOpenDetailedLog={handleOpenDetailedLog}
            currentUser={currentUser}
            currentParticipant={currentParticipant}
            onSignInWithGoogle={handleSignInWithGoogle}
            onShowChampionModal={() => setIsChampionModalOpen(true)}
            championParticipant={championParticipant}
          />
        )}

        {/* Tab 2: History */}
        {activeTab === 'history' && (
          <HistoryTimeline
            entries={entries}
            participants={participants}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onOpenNewEntry={() => handleOpenLocationQuestion(currentParticipant?.id)}
          />
        )}
      </main>

      {/* Quick Location Selection Modal (Always pops up on "+1 Ida") */}
      <QuickLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        participant={locationTargetParticipant}
        onConfirm={handleConfirmLocationPoint}
        soundMuted={soundMuted}
      />

      {/* "Bem-vindo Cagão!" Popup Modal */}
      <WelcomeCagaoModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        participant={welcomeParticipant}
        nickname={welcomeNickname}
      />

      {/* Monthly Champion Celebration Popup Modal */}
      <MonthlyChampionModal
        isOpen={isChampionModalOpen}
        onClose={() => setIsChampionModalOpen(false)}
        champion={latestChampionRecord}
        currentUserId={currentUser?.uid}
        currentUserParticipantId={currentParticipant?.id}
      />

      {/* Detailed Log Modal (For manual date/time edits & custom notes) */}
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
      />

      {/* WhatsApp Share Ranking Modal */}
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
