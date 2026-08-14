import React, { useEffect } from 'react';
import { Trophy, Sparkles, Award, PartyPopper } from 'lucide-react';
import { ParticipantRankingStats } from '../types';
import confetti from 'canvas-confetti';
import { triggerHaptic, playSuccessSound } from '../utils/soundEffects';

interface MonthlyChampionModalProps {
  isOpen: boolean;
  onClose: () => void;
  champion: {
    participantId: string;
    participantName: string;
    participantAvatar: string;
    participantPhotoURL?: string;
    nickname: string;
    totalCount: number;
    monthName: string;
  } | null;
  currentUserId?: string;
  currentUserParticipantId?: string;
}

export const MonthlyChampionModal: React.FC<MonthlyChampionModalProps> = ({
  isOpen,
  onClose,
  champion,
  currentUserId,
  currentUserParticipantId,
}) => {
  useEffect(() => {
    if (isOpen && champion) {
      triggerHaptic(40);
      playSuccessSound(false);
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FBBF24', '#F43F5E', '#10B981'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen, champion]);

  if (!isOpen || !champion) return null;

  const isCurrentWinner =
    (currentUserParticipantId && currentUserParticipantId === champion.participantId) ||
    (currentUserId && champion.participantId.includes(currentUserId.substring(0, 8)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-stone-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 text-center space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Decorative Top Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

        {/* Big Trophy and Badge */}
        <div className="relative pt-2">
          <div className="w-20 h-20 bg-amber-100 border-2 border-amber-400 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xs relative">
            🏆
            <span className="absolute -top-2 -right-2 text-2xl animate-bounce">👑</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Fim de Mês • Resultado Oficial</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-950 font-['Outfit',sans-serif] leading-tight">
            Temos um Campeão do Mês!
          </h2>
          <p className="text-xs font-bold text-stone-500">
            Mês de <span className="text-stone-800">{champion.monthName}</span>
          </p>
        </div>

        {/* Champion Winner Box */}
        <div className="bg-gradient-to-b from-amber-50 to-yellow-50/50 border-2 border-amber-300 rounded-2xl p-4 text-center space-y-2.5 shadow-inner">
          {/* Avatar / Photo */}
          <div className="w-16 h-16 rounded-2xl bg-amber-200/60 border-2 border-amber-400 mx-auto flex items-center justify-center text-3xl overflow-hidden shadow-xs">
            {champion.participantPhotoURL ? (
              <img
                src={champion.participantPhotoURL}
                alt={champion.participantName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              champion.participantAvatar || '💩'
            )}
          </div>

          {/* Winner Titles & Name */}
          <div className="space-y-0.5">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-stone-900 text-amber-400 text-[11px] font-black uppercase tracking-wider shadow-xs">
              👑 Campeão da Cagada 🏆
            </span>
            <h3 className="text-base sm:text-lg font-black text-stone-900 truncate">
              {champion.participantName}
            </h3>
            <p className="text-xs text-amber-800 font-bold italic">
              "{champion.nickname}"
            </p>
          </div>

          {/* Stat Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-stone-950 rounded-xl font-black text-xs border border-amber-500">
            <span>🔥 {champion.totalCount} idas registradas</span>
          </div>

          {isCurrentWinner && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black p-2 rounded-xl">
              🎉 VOCÊ FOI O GRANDE VENCEDOR! Seu perfil agora tem o troféu de Campeão da Cagada!
            </div>
          )}
        </div>

        <p className="text-[11px] text-stone-500 font-medium">
          O placar foi reiniciado para o novo mês, mas o campeão reinará com o troféu até a próxima virada! 🚽
        </p>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs sm:text-sm border border-stone-900 shadow-md active:translate-y-0.5 cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <PartyPopper className="w-4 h-4 text-amber-400" />
          <span>REVERENCIAR O CAMPEÃO & JOGAR</span>
        </button>
      </div>
    </div>
  );
};
