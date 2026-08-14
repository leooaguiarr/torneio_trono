import React from 'react';
import { Trophy, Flame, Zap, Award, Calendar, ChevronRight, Plus, Activity, Clock } from 'lucide-react';
import { EFFORT_LEVELS, ParticipantRankingStats, Timeframe } from '../types';
import { getTimeframeLabel } from '../utils/dateUtils';

interface LeaderboardViewProps {
  rankings: ParticipantRankingStats[];
  timeframe: Timeframe;
  onChangeTimeframe: (tf: Timeframe) => void;
  onQuickLogForUser: (participantId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  rankings,
  timeframe,
  onChangeTimeframe,
  onQuickLogForUser,
}) => {
  const timeframeLabel = getTimeframeLabel(timeframe);
  const leader = rankings[0];
  const runnerUp = rankings[1];
  const thirdPlace = rankings[2];

  const timeframesList: { id: Timeframe; label: string; icon: string }[] = [
    { id: 'this_week', label: 'Esta Semana', icon: '⚡' },
    { id: 'last_week', label: 'Semana Passada', icon: '⏳' },
    { id: 'this_month', label: 'Este Mês', icon: '📆' },
    { id: 'last_month', label: 'Mês Passado', icon: '🗓️' },
    { id: 'all_time', label: 'Geral', icon: '🏆' },
  ];

  return (
    <div className="space-y-6">
      {/* Timeframe selector header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black tracking-wider uppercase text-stone-950 bg-[#FFD93D] px-3 py-1 rounded-full border-2 border-stone-900 inline-block mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Classificação do Campeonato
            </span>
            <h2 className="font-['Outfit',sans-serif] text-2xl font-black text-stone-950 flex items-center gap-2">
              {timeframeLabel.title}
            </h2>
            <p className="text-xs text-stone-700 font-bold">{timeframeLabel.subtitle}</p>
          </div>

          {/* Timeframe pill tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border-2 border-stone-900 overflow-x-auto no-scrollbar shadow-inner">
            {timeframesList.map((tf) => {
              const isActive = timeframe === tf.id;
              return (
                <button
                  key={tf.id}
                  onClick={() => onChangeTimeframe(tf.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFD93D] text-stone-950 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/80 border-2 border-transparent'
                  }`}
                >
                  <span>{tf.icon}</span>
                  <span>{tf.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top 3 Visual Podium */}
      {rankings.length >= 2 && (
        <div className="bg-[#1E1E24] p-6 sm:p-8 rounded-3xl text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden border-2 border-stone-900">
          {/* Subtle glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFD93D]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FFD93D]" />
              <h3 className="font-['Outfit',sans-serif] font-black text-lg text-[#FFD93D]">
                Pódio dos Campeões
              </h3>
            </div>
            <span className="text-xs text-stone-300 font-bold bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
              Disputa acirrada pelo trono
            </span>
          </div>

          {/* Podium columns */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
            {/* 2nd Place */}
            {runnerUp ? (
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-800 border-2 border-stone-300 flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                    {runnerUp.participant.avatar}
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-stone-200 text-stone-950 border-2 border-stone-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    2º
                  </span>
                </div>
                <p className="font-black text-xs sm:text-sm text-stone-100 truncate max-w-full">
                  {runnerUp.participant.name}
                </p>
                <p className="text-[11px] text-stone-300 font-bold">{runnerUp.totalCount} idas</p>

                <div className="w-full bg-stone-800 border-2 border-stone-600 rounded-t-2xl mt-3 pt-4 pb-3 px-2 flex flex-col items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                  <span className="text-xs font-black text-stone-200">🥈 2º Lugar</span>
                  <span className="text-[10px] text-stone-300 font-bold mt-1">
                    Esforço: {runnerUp.avgEffort}/5
                  </span>
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* 1st Place (Winner) */}
            {leader ? (
              <div className="flex flex-col items-center text-center -translate-y-2">
                <div className="relative mb-2">
                  {/* Crown */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                    👑
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFD93D] border-3 border-white flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-[#FFD93D]/30">
                    {leader.participant.avatar}
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF6B6B] text-white border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    1º
                  </span>
                </div>
                <p className="font-black text-sm sm:text-base text-[#FFD93D] truncate max-w-full">
                  {leader.participant.name}
                </p>
                <p className="text-xs text-white font-black">{leader.totalCount} idas ao trono</p>

                <div className="w-full bg-[#FFD93D] text-stone-950 border-2 border-stone-900 rounded-t-2xl mt-3 pt-6 pb-4 px-2 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-sm font-black text-stone-950 flex items-center gap-1">
                    🥇 Campeão
                  </span>
                  <span className="text-[11px] text-stone-900 font-extrabold mt-1">
                    {leader.dailyAverage}x / dia
                  </span>
                  <span className="mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-stone-900 text-white border border-stone-900 shadow-xs">
                    Rei da Porcelana 👑
                  </span>
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* 3rd Place */}
            {thirdPlace ? (
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-800 border-2 border-[#FF6B6B]/60 flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                    {thirdPlace.participant.avatar}
                  </div>
                  <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-[#FF6B6B] text-white border-2 border-stone-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    3º
                  </span>
                </div>
                <p className="font-black text-xs sm:text-sm text-stone-100 truncate max-w-full">
                  {thirdPlace.participant.name}
                </p>
                <p className="text-[11px] text-stone-300 font-bold">{thirdPlace.totalCount} idas</p>

                <div className="w-full bg-stone-800 border-2 border-stone-600 rounded-t-2xl mt-3 pt-2 pb-3 px-2 flex flex-col items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                  <span className="text-xs font-black text-[#FF6B6B]">🥉 3º Lugar</span>
                  <span className="text-[10px] text-stone-300 font-bold mt-1">
                    Esforço: {thirdPlace.avgEffort}/5
                  </span>
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* Highlights & Special Accolades */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* King of Count */}
          <div className="bg-white p-4 rounded-2xl border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FFD93D] border-2 border-stone-900 text-stone-950 flex items-center justify-center text-xl shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              👑
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black text-stone-600 uppercase tracking-wider block">
                Mais Frequente
              </span>
              <p className="font-black text-sm text-stone-950 truncate">
                {leader ? `${leader.participant.name} (${leader.totalCount} idas)` : 'Sem registros'}
              </p>
            </div>
          </div>

          {/* Hardest Effort / Survivor */}
          {(() => {
            const hardest = [...rankings].sort((a, b) => b.totalEffortScore - a.totalEffortScore)[0];
            return (
              <div className="bg-white p-4 rounded-2xl border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FF6B6B] border-2 border-stone-900 text-white flex items-center justify-center text-xl shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  🌋
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-stone-600 uppercase tracking-wider block">
                    Maior Esforço Total
                  </span>
                  <p className="font-black text-sm text-stone-950 truncate">
                    {hardest && hardest.totalEffortScore > 0
                      ? `${hardest.participant.name} (${hardest.totalEffortScore} pts)`
                      : 'Sem registros'}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Flash / Lowest Effort Speedster */}
          {(() => {
            const speedster = [...rankings].sort((a, b) => b.fastestEntryCount - a.fastestEntryCount)[0];
            return (
              <div className="bg-white p-4 rounded-2xl border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#6BCB77] border-2 border-stone-900 text-stone-950 flex items-center justify-center text-xl shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  ⚡
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black text-stone-600 uppercase tracking-wider block">
                    Mestre da Agilidade
                  </span>
                  <p className="font-black text-sm text-stone-950 truncate">
                    {speedster && speedster.fastestEntryCount > 0
                      ? `${speedster.participant.name} (${speedster.fastestEntryCount}x suaves)`
                      : 'Equilibrado'}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Complete Table Ranking */}
      <div className="bg-white rounded-3xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b-2 border-stone-900 bg-stone-50 flex items-center justify-between">
          <div>
            <h3 className="font-['Outfit',sans-serif] text-lg font-black text-stone-950">
              Tabela de Classificação Completa
            </h3>
            <p className="text-xs text-stone-700 font-bold">
              Contagem total de idas, médias e índice de esforço
            </p>
          </div>
          <span className="text-xs font-black text-stone-950 bg-[#FFD93D] px-3 py-1 rounded-full border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {rankings.length} participantes
          </span>
        </div>

        <div className="divide-y-2 divide-stone-100">
          {rankings.map((stat) => {
            const isLeader = stat.rank === 1 && stat.totalCount > 0;
            const effortColor =
              stat.avgEffort >= 4
                ? 'bg-[#FF6B6B]'
                : stat.avgEffort >= 3
                ? 'bg-[#FFD93D]'
                : 'bg-[#6BCB77]';

            return (
              <div
                key={stat.participant.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-stone-50 ${
                  isLeader ? 'bg-[#FFF9E6]' : ''
                }`}
              >
                {/* User info & Rank */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank number badge */}
                  <div
                    className={`w-9 h-9 rounded-xl font-['Outfit',sans-serif] font-black text-sm flex items-center justify-center shrink-0 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      stat.rank === 1
                        ? 'bg-[#FFD93D] text-stone-950'
                        : stat.rank === 2
                        ? 'bg-stone-200 text-stone-950'
                        : stat.rank === 3
                        ? 'bg-[#FF6B6B] text-white'
                        : 'bg-white text-stone-700'
                    }`}
                  >
                    {stat.rank}º
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-stone-900 flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {stat.participant.avatar}
                  </div>

                  {/* Name and Tags */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-stone-950 text-base">{stat.participant.name}</h4>
                      {stat.participant.nickname && (
                        <span className="text-xs text-stone-600 font-bold italic">
                          "{stat.participant.nickname}"
                        </span>
                      )}
                      {stat.titles.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#FFD93D] text-stone-950 border border-stone-900 shadow-2xs inline-flex items-center gap-1"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-stone-700 font-bold flex-wrap">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-stone-900" />
                        Esforço médio: <strong className="text-stone-950">{stat.avgEffort > 0 ? `${stat.avgEffort}/5` : '-'}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Média diária: <strong className="text-stone-950">{stat.dailyAverage}x</strong>
                      </span>
                      {stat.avgDuration > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-900" />
                            ~{stat.avgDuration} min
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Quick Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-11 sm:pl-0">
                  {/* Total count badge */}
                  <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-black text-stone-950">
                        {stat.totalCount}
                      </span>
                      <span className="text-xs font-black text-stone-700 uppercase">
                        {stat.totalCount === 1 ? 'ida' : 'idas'}
                      </span>
                    </div>

                    {/* Effort Progress Bar */}
                    <div className="w-24 sm:w-28 h-2.5 bg-stone-100 rounded-full overflow-hidden mt-1 border-2 border-stone-900">
                      <div
                        className={`h-full rounded-full ${effortColor}`}
                        style={{ width: `${Math.min(100, (stat.avgEffort / 5) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={() => onQuickLogForUser(stat.participant.id)}
                    title={`Registrar ida para ${stat.participant.name}`}
                    className="p-2.5 rounded-xl bg-[#FFD93D] hover:bg-[#ffe270] text-stone-950 border-2 border-stone-900 transition-all flex items-center gap-1 font-black text-xs cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span className="hidden sm:inline">+1 Ida</span>
                  </button>
                </div>
              </div>
            );
          })}

          {rankings.length === 0 && (
            <div className="p-12 text-center text-stone-500">
              <span className="text-4xl block mb-2">🚽</span>
              <p className="font-bold text-stone-700">Nenhum participante encontrado.</p>
              <p className="text-xs text-stone-500 mt-1">
                Adicione amigos para começar o campeonato!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
