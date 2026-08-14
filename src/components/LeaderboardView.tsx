import React from 'react';
import { Trophy, Plus, Flame, Clock, Sparkles, MessageCircle, MoreHorizontal } from 'lucide-react';
import { ParticipantRankingStats, Timeframe } from '../types';
import { getTimeframeLabel } from '../utils/dateUtils';
import { triggerHaptic } from '../utils/soundEffects';

interface LeaderboardViewProps {
  rankings: ParticipantRankingStats[];
  timeframe: Timeframe;
  onChangeTimeframe: (tf: Timeframe) => void;
  onQuickAddPoint: (participantId: string) => void;
  onOpenDetailedLog: (participantId?: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  rankings,
  timeframe,
  onChangeTimeframe,
  onQuickAddPoint,
  onOpenDetailedLog,
}) => {
  const timeframeLabel = getTimeframeLabel(timeframe);
  const leader = rankings[0];

  const maxCount = Math.max(...rankings.map((r) => r.totalCount), 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Timeframe & Summary Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-black tracking-wider uppercase text-stone-950 bg-[#FFD93D] px-2.5 py-0.5 rounded-full border-2 border-stone-900 inline-block mb-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            🏆 Placar do Campeonato
          </span>
          <h2 className="font-['Outfit',sans-serif] text-xl sm:text-2xl font-black text-stone-950">
            {timeframeLabel.title}
          </h2>
        </div>

        {/* Simplified Period Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border-2 border-stone-900 self-start sm:self-auto">
          <button
            onClick={() => {
              triggerHaptic(10);
              onChangeTimeframe('this_week');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              timeframe === 'this_week'
                ? 'bg-[#FFD93D] text-stone-950 border-2 border-stone-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            ⚡ Esta Semana
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              onChangeTimeframe('this_month');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              timeframe === 'this_month'
                ? 'bg-[#FFD93D] text-stone-950 border-2 border-stone-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            📆 Este Mês
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              onChangeTimeframe('all_time');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              timeframe === 'all_time'
                ? 'bg-[#FFD93D] text-stone-950 border-2 border-stone-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            👑 Geral
          </button>
        </div>
      </div>

      {/* Leader Spotlight Banner */}
      {leader && leader.totalCount > 0 && (
        <div className="bg-[#FFD93D] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl animate-bounce">👑</span>
            <div>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-stone-900">
                Líder do Trono Atual
              </p>
              <h3 className="font-['Outfit',sans-serif] text-base sm:text-lg font-black text-stone-950">
                {leader.participant.avatar} {leader.participant.name}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-stone-950 block">
              {leader.totalCount} {leader.totalCount === 1 ? 'ida' : 'idas'}
            </span>
            <span className="text-[10px] text-stone-800 font-extrabold">no período</span>
          </div>
        </div>
      )}

      {/* Simplified Ranking Cards List with Direct 1-Tap "+1" */}
      <div className="space-y-2.5 sm:space-y-3">
        {rankings.map((rank, index) => {
          const position = index + 1;
          const isFirst = position === 1;
          const isSecond = position === 2;
          const isThird = position === 3;

          const progressPercent = Math.max(8, Math.round((rank.totalCount / maxCount) * 100));

          return (
            <div
              key={rank.participant.id}
              className={`p-3 sm:p-4 rounded-2xl border-2 border-stone-900 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isFirst
                  ? 'bg-amber-50/90 border-amber-950 ring-2 ring-[#FFD93D]'
                  : 'bg-white'
              }`}
            >
              {/* Participant Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Position Badge */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base border-2 border-stone-900 shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                    isFirst
                      ? 'bg-[#FFD93D] text-stone-950'
                      : isSecond
                      ? 'bg-stone-200 text-stone-900'
                      : isThird
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `${position}º`}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-100 border-2 border-stone-900 flex items-center justify-center text-xl shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  {rank.participant.avatar}
                </div>

                {/* Name & Progress */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm sm:text-base text-stone-950 truncate">
                      {rank.participant.name}
                    </h4>
                    {rank.participant.nickname && (
                      <span className="text-[11px] text-stone-500 font-bold hidden md:inline truncate">
                        "{rank.participant.nickname}"
                      </span>
                    )}
                  </div>

                  {/* Visual Bar */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-stone-200 h-2 rounded-full overflow-hidden border border-stone-900/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFirst
                            ? 'bg-[#FFD93D]'
                            : isSecond
                            ? 'bg-[#4D96FF]'
                            : isThird
                            ? 'bg-[#6BCB77]'
                            : 'bg-stone-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-stone-950 shrink-0">
                      {rank.totalCount} {rank.totalCount === 1 ? 'ida' : 'idas'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: 1-Tap "+1" and "Detalhes" */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <button
                  onClick={() => onQuickAddPoint(rank.participant.id)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#FF6B6B] hover:bg-[#ff5252] text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
                  title={`Adicionar +1 ida para ${rank.participant.name}`}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+1 Ida</span>
                </button>

                <button
                  onClick={() => onOpenDetailedLog(rank.participant.id)}
                  className="px-2.5 py-2.5 rounded-xl text-xs font-black bg-stone-100 hover:bg-stone-200 text-stone-800 border-2 border-stone-900 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer min-h-[42px]"
                  title="Registro detalhado (horário, esforço, notas)"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
