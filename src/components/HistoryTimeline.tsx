import React from 'react';
import { Clock, Trash2, Edit3, Plus, Sparkles } from 'lucide-react';
import { EFFORT_LEVELS, Participant, PoopEntry } from '../types';
import { formatFriendlyDate } from '../utils/dateUtils';
import { triggerHaptic } from '../utils/soundEffects';

interface HistoryTimelineProps {
  entries: PoopEntry[];
  participants: Participant[];
  onEditEntry: (entry: PoopEntry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenNewEntry: () => void;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  entries,
  participants,
  onEditEntry,
  onDeleteEntry,
  onOpenNewEntry,
}) => {
  const getParticipant = (id: string) => participants.find((p) => p.id === id);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
        <div>
          <h3 className="font-['Outfit',sans-serif] font-black text-lg sm:text-xl text-stone-950 flex items-center gap-2">
            <span>📜</span> Últimas Idas ao Banheiro
          </h3>
          <p className="text-xs text-stone-600 font-bold">
            Total de {entries.length} {entries.length === 1 ? 'registro' : 'registros'} no histórico
          </p>
        </div>

        <button
          onClick={onOpenNewEntry}
          className="px-3 py-2 rounded-xl text-xs font-black bg-[#FF6B6B] hover:bg-[#ff5252] text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Nova Ida</span>
        </button>
      </div>

      {/* Entries List */}
      {sortedEntries.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border-2 border-stone-900 text-center space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-4xl">🚽</span>
          <h4 className="font-black text-stone-900 text-base">Nenhuma ida registrada ainda</h4>
          <p className="text-xs text-stone-600 font-bold">
            Clique no botão "+1 Ida" de qualquer amigo no placar para começar!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedEntries.map((entry) => {
            const p = getParticipant(entry.participantId);
            const { relative, exactTime } = formatFriendlyDate(entry.timestamp);
            const effortInfo = EFFORT_LEVELS[entry.effortLevel] || EFFORT_LEVELS[3];

            return (
              <div
                key={entry.id}
                className="bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] border-2 border-stone-900 flex items-center justify-center text-xl shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    {p?.avatar || '🚽'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-xs sm:text-sm text-stone-950">
                        {p?.name || 'Amigo'}
                      </span>
                      <span className="text-[10px] font-black bg-stone-100 px-2 py-0.5 rounded-md border border-stone-900/30 text-stone-700">
                        {effortInfo.label}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 font-bold flex items-center gap-2 mt-0.5">
                      <span>{relative} ({exactTime})</span>
                      {entry.location && (
                        <span>• 📍 {entry.location}</span>
                      )}
                      {entry.notes && (
                        <span className="italic text-stone-500 truncate max-w-[140px] sm:max-w-xs">
                          • "{entry.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="p-2 text-stone-600 hover:text-stone-950 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Editar registro"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic(20);
                      if (window.confirm('Excluir este registro?')) {
                        onDeleteEntry(entry.id);
                      }
                    }}
                    className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
