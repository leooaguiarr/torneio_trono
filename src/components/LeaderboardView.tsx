import React from 'react';
import { Plus, Edit3, Undo2 } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Participant, ParticipantRankingStats, Timeframe } from '../types';
import { getTimeframeLabel } from '../utils/dateUtils';
import { getLocationRoast, getDynamicFunnyNickname } from '../utils/funnyTitles';
import { triggerHaptic } from '../utils/soundEffects';

interface LeaderboardViewProps {
  rankings: ParticipantRankingStats[];
  timeframe: Timeframe;
  onChangeTimeframe: (tf: Timeframe) => void;
  onOpenNewEntry: () => void;
  onOpenEditRecent?: () => void;
  currentUser: FirebaseUser | null;
  currentParticipant: Participant | null;
  onSignInWithGoogle: () => void;
  onShowChampionModal?: () => void;
  championParticipant?: Participant | null;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  rankings,
  timeframe,
  onChangeTimeframe,
  onOpenNewEntry,
  onOpenEditRecent,
  currentUser,
  currentParticipant,
  onSignInWithGoogle,
  onShowChampionModal,
  championParticipant,
}) => {
  const timeframeLabel = getTimeframeLabel(timeframe);
  const maxCount = Math.max(...rankings.map((r) => r.totalCount), 1);
  const leader = rankings.length > 0 && rankings[0].totalCount > 0 ? rankings[0] : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Primary Action Button */}
      {currentUser ? (
        <div className="space-y-2">
          <button
            onClick={onOpenNewEntry}
            className="w-full py-3.5 sm:py-4 px-4 sm:px-5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-sm sm:text-base border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <span className="text-xl sm:text-2xl shrink-0">🚽</span>
            <span className="truncate">REGISTRAR MINHA IDA AO BANHEIRO</span>
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] shrink-0" />
          </button>

          {onOpenEditRecent && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onOpenEditRecent();
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:text-stone-950"
                title="Corrigir local, esforço ou apagar última ida registrada"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Corrigir ida (Corrigir a cagada)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onSignInWithGoogle}
          className="w-full py-3.5 sm:py-4 px-4 sm:px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs sm:text-base border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(245,158,11,1)] sm:shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="truncate">ENTRAR COM GOOGLE PARA PONTUAR</span>
        </button>
      )}

      {/* Reigning Champion Banner if exists */}
      {championParticipant && (
        <div
          onClick={onShowChampionModal}
          className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-stone-900 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:opacity-95 transition-all"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-stone-950 text-white flex items-center justify-center text-xl shrink-0 shadow-inner">
              🏆
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-950 bg-white/70 px-1.5 py-0.2 rounded">
                  Último Campeão do Mês
                </span>
                {championParticipant.championMonth && (
                  <span className="text-[10px] font-bold text-stone-900 hidden sm:inline">
                    ({championParticipant.championMonth})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-xs sm:text-sm font-black text-stone-950 truncate">
                  {championParticipant.name}
                </span>
                <span className="text-[11px] font-black bg-stone-950 text-amber-300 px-1.5 py-0.5 rounded shadow-2xs">
                  🏆 Campeão da Cagada
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[11px] font-black text-stone-950 bg-white/80 px-2 py-1 rounded-lg border border-stone-900/20 block">
              Ver Detalhes ✨
            </span>
          </div>
        </div>
      )}

      {/* Period Selector Tabs */}
      <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-2">
        <span className="text-xs font-black text-stone-700 pl-2 hidden sm:inline">
          Período:
        </span>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => {
              triggerHaptic(10);
              onChangeTimeframe('this_week');
            }}
            className={`flex-1 sm:flex-none px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
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
            className={`flex-1 sm:flex-none px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
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
            className={`flex-1 sm:flex-none px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
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
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0 animate-bounce">👑</span>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                Atual Dono do Trono ({timeframeLabel.title})
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black bg-amber-300/80 text-stone-950 px-1.5 py-0.5 rounded truncate max-w-[180px] sm:max-w-xs">
                  "{getDynamicFunnyNickname(leader.locationBreakdown, leader.totalCount, leader.participant.id)}"
                </span>
                <span className="text-xs sm:text-sm font-black text-stone-900 truncate">
                  {leader.participant.avatar} {leader.participant.name}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-base sm:text-xl font-black text-amber-950 block whitespace-nowrap">
              {leader.totalCount} {leader.totalCount === 1 ? 'ida' : 'idas'}
            </span>
          </div>
        </div>
      )}

      {/* Empty State: No participants */}
      {rankings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 text-2xl sm:text-3xl rounded-2xl flex items-center justify-center mx-auto border border-amber-300">
            🚽
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-stone-900 font-['Outfit',sans-serif]">
              O Trono está Vazio!
            </h3>
            <p className="text-xs text-stone-600 font-medium max-w-sm mx-auto">
              Ninguém pontuou ainda. Conecte com sua Conta Google para receber seu apelido oficial e entrar no ranking!
            </p>
          </div>
          {!currentUser && (
            <button
              onClick={onSignInWithGoogle}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs border border-stone-900 shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Entrar com Google</span>
            </button>
          )}
        </div>
      ) : (
        /* Participants Ranking List */
        <div className="space-y-3">
          {rankings.map((rank, index) => {
            const position = index + 1;
            const isFirst = position === 1 && rank.totalCount > 0;
            const isSecond = position === 2 && rank.totalCount > 0;
            const isThird = position === 3 && rank.totalCount > 0;

            const isCurrentUserParticipant =
              currentUser &&
              (rank.participant.userId === currentUser.uid ||
                (rank.participant.email &&
                  currentUser.email &&
                  rank.participant.email.toLowerCase() === currentUser.email.toLowerCase()));

            // Dynamic funny nickname based on participant's actual top location and idas
            const funnyNickname = getDynamicFunnyNickname(
              rank.locationBreakdown,
              rank.totalCount,
              rank.participant.id || rank.participant.name
            );

            // Compute Top Location and Funny Roast
            const locationRoast = getLocationRoast(rank.locationBreakdown, rank.totalCount);

            return (
              <div
                key={rank.participant.id}
                className={`bg-white rounded-2xl border transition-all p-3 sm:p-4 shadow-xs flex flex-col gap-2.5 ${
                  isCurrentUserParticipant
                    ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-50/20'
                    : isFirst
                    ? 'border-amber-400'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Top Row: Rank Badge, Photo/Avatar, Name with Nickname, and Action Button */}
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  {/* Left: Position & Avatar & Name */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {/* Position Badge */}
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
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

                    {/* Avatar Emoji or Photo */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-lg sm:text-xl shrink-0 overflow-hidden shadow-2xs relative">
                      {rank.participant.photoURL ? (
                        <img
                          src={rank.participant.photoURL}
                          alt={rank.participant.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        rank.participant.avatar
                      )}
                      {rank.participant.isCurrentChampion && (
                        <span className="absolute -bottom-1 -right-1 text-xs bg-amber-400 rounded-full px-0.5 border border-stone-900 shadow-xs">
                          🏆
                        </span>
                      )}
                    </div>

                    {/* Name & Nickname */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Dynamic Funny Nickname Badge */}
                        <span className="text-[10px] font-black bg-stone-900 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 max-w-full truncate">
                          {funnyNickname}
                        </span>

                        {rank.participant.isCurrentChampion && (
                          <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5 shadow-2xs">
                            🏆 Campeão da Cagada
                          </span>
                        )}

                        {isCurrentUserParticipant && (
                          <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.5 rounded shrink-0">
                            Você
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs sm:text-base text-stone-900 truncate mt-0.5">
                        {rank.participant.name}
                      </h4>
                    </div>
                  </div>

                  {/* Right: Total Idas Counter Badge */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-100/70 border border-amber-300/80 text-center">
                      <span className="text-sm sm:text-base font-black text-amber-950 block leading-tight whitespace-nowrap">
                        {rank.totalCount} {rank.totalCount === 1 ? 'ida' : 'idas'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Funny Roast & Most Visited Location Breakdown */}
                <div className="bg-stone-50 rounded-xl p-2 sm:p-3 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs">
                  {/* Funny Roast Text */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base sm:text-lg shrink-0">{locationRoast.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-stone-800 font-semibold leading-snug text-[11px] sm:text-xs">
                        {locationRoast.roast}
                      </p>
                    </div>
                  </div>

                  {/* Most Visited Location Tag */}
                  {rank.totalCount > 0 && (
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                      <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 font-bold text-[10px] sm:text-[11px] whitespace-nowrap">
                        {locationRoast.topLocationLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
