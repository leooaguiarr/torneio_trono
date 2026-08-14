import React, { useState } from 'react';
import { Clock, Filter, Trash2, Edit3, MapPin, Timer, MessageSquare, Plus } from 'lucide-react';
import { EFFORT_LEVELS, LOCATIONS, Participant, PoopEntry } from '../types';
import { formatFriendlyDate } from '../utils/dateUtils';

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
  const [selectedParticipantFilter, setSelectedParticipantFilter] = useState<string>('all');
  const [selectedEffortFilter, setSelectedEffortFilter] = useState<string>('all');

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    if (selectedParticipantFilter !== 'all' && e.participantId !== selectedParticipantFilter) {
      return false;
    }
    if (selectedEffortFilter !== 'all' && e.effortLevel.toString() !== selectedEffortFilter) {
      return false;
    }
    return true;
  });

  // Sort descending by timestamp
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Group by relative day
  const groupedByDay: { [key: string]: PoopEntry[] } = {};
  sortedEntries.forEach((entry) => {
    const { relative, fullDate } = formatFriendlyDate(entry.timestamp);
    const key = `${relative} • ${fullDate}`;
    if (!groupedByDay[key]) {
      groupedByDay[key] = [];
    }
    groupedByDay[key].push(entry);
  });

  const getParticipant = (id: string) => participants.find((p) => p.id === id);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-900 stroke-[2.5]" />
            <h3 className="font-['Outfit',sans-serif] font-black text-stone-950 text-base">
              Histórico & Feed de Entradas
            </h3>
            <span className="text-xs font-black text-stone-950 bg-[#FFD93D] px-2.5 py-0.5 rounded-full border-2 border-stone-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Friend */}
            <select
              value={selectedParticipantFilter}
              onChange={(e) => setSelectedParticipantFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-black text-stone-950 bg-white border-2 border-stone-900 rounded-xl focus:ring-2 focus:ring-[#FFD93D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <option value="all">👥 Todos os Amigos</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name}
                </option>
              ))}
            </select>

            {/* Filter by Effort */}
            <select
              value={selectedEffortFilter}
              onChange={(e) => setSelectedEffortFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-black text-stone-950 bg-white border-2 border-stone-900 rounded-xl focus:ring-2 focus:ring-[#FFD93D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <option value="all">⚡ Todos os Esforços</option>
              <option value="1">⚡ Nível 1 - Suave</option>
              <option value="2">🍃 Nível 2 - Tranquilo</option>
              <option value="3">🧘 Nível 3 - Moderado</option>
              <option value="4">🥵 Nível 4 - Intenso</option>
              <option value="5">🌋 Nível 5 - Lendário</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline Entries Grouped by Day */}
      {Object.keys(groupedByDay).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByDay).map(([dayLabel, dayEntries]) => (
            <div key={dayLabel} className="space-y-3">
              {/* Day Header Badge */}
              <div className="sticky top-16 z-20 flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-stone-950 text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {dayLabel}
                </span>
                <div className="h-0.5 bg-stone-900/20 flex-1"></div>
              </div>

              {/* Day's Entries Cards */}
              <div className="grid grid-cols-1 gap-3">
                {dayEntries.map((entry) => {
                  const participant = getParticipant(entry.participantId);
                  const effortInfo = EFFORT_LEVELS[entry.effortLevel];
                  const { exactTime } = formatFriendlyDate(entry.timestamp);
                  const locInfo = entry.location ? LOCATIONS[entry.location] : null;

                  return (
                    <div
                      key={entry.id}
                      className="bg-white p-4 rounded-2xl border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      {/* Left: User & Main Meta */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-2xl bg-stone-50 border-2 border-stone-900 flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {participant?.avatar || '👤'}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-stone-950 text-sm sm:text-base">
                              {participant?.name || 'Desconhecido'}
                            </span>
                            <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-stone-900" />
                              {exactTime}
                            </span>
                          </div>

                          {/* Pills row */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {/* Effort Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-xs font-black border-2 inline-flex items-center gap-1 shadow-2xs ${effortInfo.color}`}
                            >
                              <span>{effortInfo.emoji}</span>
                              <span>
                                Nvl {effortInfo.level} ({effortInfo.shortLabel})
                              </span>
                            </span>

                            {/* Location Badge */}
                            {locInfo && (
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#4D96FF]/15 text-[#1a5bb8] border-2 border-[#4D96FF]/40 inline-flex items-center gap-1 shadow-2xs">
                                <span>{locInfo.emoji}</span>
                                <span>{locInfo.label}</span>
                              </span>
                            )}

                            {/* Duration Badge */}
                            {entry.durationMinutes && entry.durationMinutes > 0 && (
                              <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-stone-100 text-stone-800 border-2 border-stone-300 inline-flex items-center gap-1 shadow-2xs">
                                <Timer className="w-3 h-3 text-stone-700" />
                                <span>{entry.durationMinutes} min</span>
                              </span>
                            )}
                          </div>

                          {/* Notes */}
                          {entry.notes && (
                            <p className="mt-2 text-xs text-stone-900 bg-[#FFF9E6] p-2.5 rounded-xl border-2 border-stone-900/40 flex items-start gap-1.5 font-semibold">
                              <MessageSquare className="w-3.5 h-3.5 text-[#FF6B6B] shrink-0 mt-0.5 stroke-[2.5]" />
                              <span className="italic">"{entry.notes}"</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                        <button
                          onClick={() => onEditEntry(entry)}
                          title="Editar este registro"
                          className="p-2 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-100 border border-transparent hover:border-stone-900 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja apagar este registro do campeonato?')) {
                              onDeleteEntry(entry.id);
                            }
                          }}
                          title="Excluir este registro"
                          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-100 border border-transparent hover:border-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border-2 border-stone-900 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-16 h-16 rounded-2xl bg-[#FFD93D] border-2 border-stone-900 text-stone-950 mx-auto flex items-center justify-center text-3xl mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            🚽
          </div>
          <h4 className="font-['Outfit',sans-serif] font-black text-xl text-stone-950">
            Nenhuma ida ao trono registrada
          </h4>
          <p className="text-xs text-stone-700 font-bold max-w-sm mx-auto mt-1 mb-5">
            {selectedParticipantFilter !== 'all' || selectedEffortFilter !== 'all'
              ? 'Tente remover os filtros para ver outros registros.'
              : 'Registre a primeira ida ao banheiro e inicie a contagem do campeonato!'}
          </p>
          <button
            onClick={onOpenNewEntry}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#FF6B6B] hover:bg-[#ff5252] text-white border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Agora</span>
          </button>
        </div>
      )}
    </div>
  );
};
