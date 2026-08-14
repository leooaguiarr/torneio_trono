import React from 'react';
import { Plus, Trophy, Sparkles, UserPlus, MoreHorizontal } from 'lucide-react';
import { ParticipantRankingStats, Timeframe } from '../types';
import { getTimeframeLabel } from '../utils/dateUtils';
import { triggerHaptic } from '../utils/soundEffects';

interface LeaderboardViewProps {
  rankings: ParticipantRankingStats[];
  timeframe: Timeframe;
  onChangeTimeframe: (tf: Timeframe) => void;
  onQuickAddPoint: (participantId: string) => void;
  onOpenNewEntry: () => void;
  onOpenDetailedLog: (participantId?: string) => void;
  onOpenAddParticipant: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  rankings,
  timeframe,
  onChangeTimeframe,
  onQuickAddPoint,
  onOpenNewEntry,
  onOpenDetailedLog,
  onOpenAddParticipant,
}) => {
  const timeframeLabel = getTimeframeLabel(timeframe);
  const maxCount = Math.max(...rankings.map((r) => r.totalCount), 1);
  const leader = rankings.length > 0 && rankings[0].totalCount > 0 ? rankings[0] : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Primary Action Button: Large, high contrast, prominent */}
      <button
        onClick={onOpenNewEntry}
        className="w-full py-4 px-5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-base sm:text-lg border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <span className="text-2xl">🚽</span>
        <span>REGISTRAR MINHA IDA AO BANHEIRO</span>
        <Plus className="w-5 h-5 stroke-[3]" />
      </button>

      {/* Period Selector Tabs */}
      <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-2">
        <span className="text-xs font-black text-stone-700 pl-2 hidden sm:inline">
          Período:
        </span>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => {
              triggerHaptic(10);
              onChangeTimeframe('this_week');
            }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              timeframe === 'this_week'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              onChangeTimeframe('this_month');
            }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              timeframe === 'this_month'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              onChangeTimeframe('all_time');
            }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              timeframe === 'all_time'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            Geral
          </button>
        </div>
      </div>

      {/* Leader Callout if someone has points */}
      {leader && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                Líder do Trono
              </span>
              <span className="text-base font-black text-stone-900">
                {leader.participant.avatar} {leader.participant.name}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-amber-950 block">
              {leader.totalCount} {leader.totalCount === 1 ? 'ida' : 'idas'}
            </span>
          </div>
        </div>
      )}

      {/* Empty State: No participants */}
      {rankings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-amber-100 text-3xl rounded-2xl flex items-center justify-center mx-auto border border-amber-300">
            🚽
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-stone-900 font-['Outfit',sans-serif]">
              O Trono está Vazio!
            </h3>
            <p className="text-xs text-stone-600 font-medium max-w-sm mx-auto">
              Ninguém pontuou ainda. Adicione o seu nome e de seus amigos para começar o campeonato!
            </p>
          </div>
          <button
            onClick={onOpenAddParticipant}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs border border-stone-900/20 shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar Participante</span>
          </button>
        </div>
      ) : (
        /* Participants Ranking List */
        <div className="space-y-2.5">
          {rankings.map((rank, index) => {
            const position = index + 1;
            const isFirst = position === 1 && rank.totalCount > 0;
            const isSecond = position === 2 && rank.totalCount > 0;
            const isThird = position === 3 && rank.totalCount > 0;

            const progress = Math.max(5, Math.round((rank.totalCount / maxCount) * 100));

            return (
              <div
                key={rank.participant.id}
                className={`bg-white rounded-2xl border transition-all p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3 ${
                  isFirst
                    ? 'border-amber-400 ring-2 ring-amber-400/30'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Position Badge */}
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                      isFirst
                        ? 'bg-amber-400 text-stone-950 border-amber-500 font-black'
                        : isSecond
                        ? 'bg-stone-200 text-stone-900 border-stone-300'
                        : isThird
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `${position}º`}
                  </div>

                  {/* Avatar Emoji */}
                  <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xl shrink-0">
                    {rank.participant.avatar}
                  </div>

                  {/* Name & Visits count */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                        {rank.participant.name}
                      </h4>
                      {rank.participant.nickname && (
                        <span className="text-[11px] text-stone-400 font-medium hidden sm:inline truncate">
                          ({rank.participant.nickname})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 max-w-[120px] sm:max-w-[180px] bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFirst ? 'bg-amber-400' : 'bg-stone-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-stone-800">
                        {rank.totalCount} {rank.totalCount === 1 ? 'ida' : 'idas'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick +1 Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onQuickAddPoint(rank.participant.id)}
                    className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                    title={`Adicionar +1 para ${rank.participant.name}`}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+1 Ida</span>
                  </button>

                  <button
                    onClick={() => onOpenDetailedLog(rank.participant.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Detalhes da ida"
                  >
                    <MoreHorizontal className="w-4 h-4" />
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
