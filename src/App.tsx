import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, History, BarChart3, Plus, Sparkles, RefreshCw, Trash2, Users } from 'lucide-react';
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

const STORAGE_KEY_PARTICIPANTS = 'torneio_trono_participants_v2';
const STORAGE_KEY_ENTRIES = 'torneio_trono_entries_v2';
const STORAGE_KEY_SOUND = 'torneio_trono_sound_muted';

export default function App() {
  // Participants State
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PARTICIPANTS;
  });

  // Entries State
  const [entries, setEntries] = useState<PoopEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return generateSeedEntries();
  });

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

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
    } catch {
      // ignore
    }
  }, [participants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, [entries]);

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

  // Compute rankings
  const rankings = useMemo(() => {
    return computeRankings(participants, entries, timeframe);
  }, [participants, entries, timeframe]);

  // Entry Actions
  const handleSaveEntry = (entryData: Omit<PoopEntry, 'id'>, existingId?: string) => {
    const person = participants.find((p) => p.id === entryData.participantId);
    const personName = person ? person.name : 'Participante';

    if (existingId) {
      setEntries((prev) =>
        prev.map((e) => (e.id === existingId ? { ...entryData, id: existingId } : e))
      );
      addToast('Entrada Atualizada!', `Registro de ${personName} foi modificado.`, '✏️');
    } else {
      const newEntry: PoopEntry = {
        ...entryData,
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      setEntries((prev) => [newEntry, ...prev]);
      addToast('Novo Ponto no Ranking!', `${personName} pontuou no Torneio do Trono!`, '🚽');
    }
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    triggerHaptic(20);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    addToast('Registro Excluído', 'A ida ao banheiro foi removida do placar.', '🗑️');
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

  // Participant Actions
  const handleAddParticipant = (pData: Omit<Participant, 'id' | 'createdAt'>) => {
    const newParticipant: Participant = {
      ...pData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setParticipants((prev) => [...prev, newParticipant]);
    addToast('Amigo Adicionado!', `${newParticipant.name} entrou na disputa do trono!`, newParticipant.avatar);
  };

  const handleUpdateParticipant = (updated: Participant) => {
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addToast('Perfil Atualizado!', `Dados de ${updated.name} foram salvos.`, updated.avatar);
  };

  const handleDeleteParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setEntries((prev) => prev.filter((e) => e.participantId !== id));
    addToast('Competidor Removido', 'Participante e suas entradas foram excluídos.', '👋');
  };

  const handleResetData = () => {
    if (window.confirm('Deseja recarregar os dados de exemplo da Liga do Trono?')) {
      setParticipants(INITIAL_PARTICIPANTS);
      setEntries(generateSeedEntries());
      addToast('Dados Recarregados', 'Campeonato restaurado com dados de exemplo.', '✨');
    }
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        'ATENÇÃO: Deseja zerar todos os registros de idas ao banheiro? Essa ação não pode ser desfeita.'
      )
    ) {
      setEntries([]);
      addToast('Placar Zerado', 'Todos os registros foram limpos para novo campeonato.', '🧹');
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
            <span>🚽 <strong>Torneio do Trono</strong> • Liga dos Amigos</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="hover:text-stone-950 hover:underline transition-colors flex items-center gap-1 cursor-pointer font-extrabold"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Recarregar Exemplo</span>
            </button>
            <span>•</span>
            <button
              onClick={handleClearAllData}
              className="hover:text-rose-600 hover:underline transition-colors flex items-center gap-1 cursor-pointer font-extrabold"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Zerar Registros</span>
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
