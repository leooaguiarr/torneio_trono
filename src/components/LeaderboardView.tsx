import React from 'react';
import { Plus, Trophy, Sparkles, UserPlus, MoreHorizontal, LogIn } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Participant, ParticipantRankingStats, Timeframe } from '../types';
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
  currentUser: FirebaseUser | null;
  currentParticipant: Participant | null;
  onSignInWithGoogle: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  rankings,
  timeframe,
  onChangeTimeframe,
  onQuickAddPoint,
  onOpenNewEntry,
  onOpenDetailedLog,
  onOpenAddParticipant,
  currentUser,
  currentParticipant,
  onSignInWithGoogle,
}) => {
  const timeframeLabel = getTimeframeLabel(timeframe);
  const maxCount = Math.max(...rankings.map((r) => r.totalCount), 1);
  const leader = rankings.length > 0 && rankings[0].totalCount > 0 ? rankings[0] : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Primary Action Button: If logged in, register bathroom visit; if logged out, prompt Google login */}
      {currentUser ? (
        <button
          onClick={onOpenNewEntry}
          className="w-full py-4 px-5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-base sm:text-lg border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <span className="text-2xl">🚽</span>
          <span>REGISTRAR MINHA IDA AO BANHEIRO</span>
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>
      ) : (
        <button
          onClick={onSignInWithGoogle}
          className="w-full py-4 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-black text-sm sm:text-base border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
          <span>ENTRAR COM GOOGLE PARA REGISTRAR</span>
        </button>
      )}

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
              Ninguém pontuou ainda. Conecte com o Google para começar o campeonato!
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
        <div className="space-y-2.5">
          {rankings.map((rank, index) => {
            const position = index + 1;
            const isFirst = position === 1 && rank.totalCount > 0;
            const isSecond = position === 2 && rank.totalCount > 0;
            const isThird = position === 3 && rank.totalCount > 0;

            const isCurrentUserParticipant =
              currentUser &&
              (rank.participant.userId === currentUser.uid ||
                (rank.participant.email && currentUser.email && rank.participant.email.toLowerCase() === currentUser.email.toLowerCase()));

            const progress = Math.max(5, Math.round((rank.totalCount / maxCount) * 100));

            return (
              <div
                key={rank.participant.id}
                className={`bg-white rounded-2xl border transition-all p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3 ${
                  isCurrentUserParticipant
                    ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-50/30'
                    : isFirst
                    ? 'border-amber-400'
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

                  {/* Avatar Emoji or Photo */}
                  <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xl shrink-0 overflow-hidden">
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
                  </div>

                  {/* Name & Visits count */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                        {rank.participant.name}
                      </h4>
                      {isCurrentUserParticipant && (
                        <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.5 rounded-md shrink-0">
                          Você
                        </span>
                      )}
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

                {/* Right: +1 Button only if logged in or shows Google login */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {currentUser ? (
                    <>
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
                    </>
                  ) : (
                    <button
                      onClick={onSignInWithGoogle}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                      title="Faça login para pontuar"
                    >
                      Login
                    </button>
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
