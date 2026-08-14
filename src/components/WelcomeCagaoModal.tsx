import React, { useEffect } from 'react';
import { Sparkles, Trophy, Flame, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant } from '../types';
import { triggerHaptic } from '../utils/soundEffects';

interface WelcomeCagaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
  nickname: string;
}

export const WelcomeCagaoModal: React.FC<WelcomeCagaoModalProps> = ({
  isOpen,
  onClose,
  participant,
  nickname,
}) => {
  useEffect(() => {
    if (isOpen) {
      triggerHaptic([30, 50, 80]);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen || !participant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-4 border-stone-900 overflow-hidden text-center p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Animated Poop / Crown Icon */}
        <div className="relative mx-auto w-20 h-20 bg-amber-100 rounded-3xl border-2 border-stone-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-4xl animate-bounce">💩</span>
          <span className="absolute -top-3 -right-2 text-2xl animate-pulse">👑</span>
        </div>

        {/* Humorous Welcome Title */}
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-black uppercase tracking-wider">
            🚨 Alerta de Novo Competidor 🚨
          </span>
          <h2 className="text-2xl font-black text-stone-900 font-['Outfit',sans-serif] tracking-tight">
            BEM-VINDO, CAGÃO!
          </h2>
          <p className="text-xs text-stone-600 font-medium">
            Você acabou de entrar na arena sagrada do <strong className="text-stone-900">Torneio do Trono</strong>!
          </p>
        </div>

        {/* Assigned Nickname Box */}
        <div className="bg-amber-50 border-2 border-dashed border-amber-400 rounded-2xl p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
            Seu Título Oficial no Torneio:
          </span>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xl">{participant.avatar}</span>
            <h3 className="text-base font-black text-amber-950 font-['Outfit',sans-serif]">
              "{nickname}"
            </h3>
          </div>
          <p className="text-[11px] text-amber-900 font-semibold">
            {participant.name}
          </p>
        </div>

        {/* Quick funny rules */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-left space-y-1.5 text-xs text-stone-700 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-base shrink-0">🚽</span>
            <span>Foi ao banheiro? Registre na hora com <strong>+1 Ida</strong>!</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base shrink-0">💸</span>
            <span>Cagada no trabalho dá moral em dobro (remunerada!).</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base shrink-0">🏆</span>
            <span>Lidere o placar e humilhe seus amigos!</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            triggerHaptic(20);
            onClose();
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-sm border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>BORA CAGAR E PONTUAR! 🚀</span>
        </button>
      </div>
    </div>
  );
};
