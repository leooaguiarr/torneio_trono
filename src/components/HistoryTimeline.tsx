import React from 'react';
import { Clock, Trash2, Edit3, Plus } from 'lucide-react';
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
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-['Outfit',sans-serif] font-black text-base text-stone-900 flex items-center gap-2">
            <span>📜</span> Histórico de Idas
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            {entries.length} {entries.length === 1 ? 'registro gravado' : 'registros gravados'}
          </p>
        </div>

        <button
          onClick={onOpenNewEntry}
          className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Nova Ida</span>
        </button>
      </div>

      {/* Entries List */}
      {sortedEntries.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2 shadow-xs">
          <span className="text-3xl">🚽</span>
          <h4 className="font-bold text-stone-900 text-sm">Nenhuma ida registrada</h4>
          <p className="text-xs text-stone-500 font-medium">
            Clique em "Nova Ida" ou use o botão "+1 Ida" no placar!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedEntries.map((entry) => {
            const p = getParticipant(entry.participantId);
            const { relative, exactTime } = formatFriendlyDate(entry.timestamp);
            const effortInfo = EFFORT_LEVELS[entry.effortLevel] || EFFORT_LEVELS[3];

            return (
              <div
                key={entry.id}
                className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3 hover:border-stone-300 transition-colors"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg shrink-0">
                    {p?.avatar || '🚽'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-stone-900">
                        {p?.name || 'Amigo'}
                      </span>
                      <span className="text-[10px] font-bold bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                        {effortInfo.label}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <span>{relative} às {exactTime}</span>
                      {entry.location && <span>• 📍 {entry.location}</span>}
                      {entry.notes && (
                        <span className="italic text-stone-400 truncate max-w-[130px] sm:max-w-xs">
                          • "{entry.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic(20);
                      if (window.confirm('Excluir este registro?')) {
                        onDeleteEntry(entry.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
