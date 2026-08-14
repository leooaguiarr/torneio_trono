import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Trophy, Share2, Send } from 'lucide-react';
import { ParticipantRankingStats, Timeframe } from '../types';
import { getTimeframeLabel } from '../utils/dateUtils';
import { generateWhatsAppSummary } from '../utils/rankingCalculations';
import { triggerHaptic, playPopSound } from '../utils/soundEffects';

interface ShareRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: ParticipantRankingStats[];
  timeframe: Timeframe;
  soundMuted?: boolean;
}

export const ShareRankingModal: React.FC<ShareRankingModalProps> = ({
  isOpen,
  onClose,
  rankings,
  timeframe,
  soundMuted = false,
}) => {
  const [copied, setCopied] = useState(false);
  const timeframeLabel = getTimeframeLabel(timeframe);
  const formattedText = generateWhatsAppSummary(rankings, timeframeLabel);

  if (!isOpen) return null;

  const handleCopy = async () => {
    triggerHaptic(15);
    playPopSound(soundMuted);
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    triggerHaptic(20);
    playPopSound(soundMuted);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Torneio do Trono 🏆 - ${timeframeLabel.title}`,
          text: formattedText,
        });
        return;
      } catch {
        // user cancelled or share failed, fallback to whatsapp url
      }
    }
    const encoded = encodeURIComponent(formattedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleOpenWhatsApp = () => {
    triggerHaptic(20);
    playPopSound(soundMuted);
    const encoded = encodeURIComponent(formattedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-t-3 border-x-3 sm:border-3 border-stone-900 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col">
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="bg-[#6BCB77] p-4 sm:p-5 text-stone-950 flex items-center justify-between border-b-3 border-stone-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">📱</span>
            <div>
              <h2 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-black text-stone-950">
                Compartilhar no WhatsApp
              </h2>
              <p className="text-stone-900 text-xs font-bold">
                Envie o ranking oficial para o grupo dos amigos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white border-2 border-stone-900 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
              Mensagem Pronta para Envio:
            </span>
            <span className="text-xs text-stone-950 font-black bg-[#FFD93D] px-2.5 py-0.5 rounded-full border-2 border-stone-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {timeframeLabel.title}
            </span>
          </div>

          {/* Formatted Text Box */}
          <div className="p-4 rounded-2xl bg-[#1E1E24] text-stone-100 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-56 sm:max-h-64 overflow-y-auto border-2 border-stone-900 selection:bg-[#FFD93D] selection:text-black shadow-inner">
            {formattedText}
          </div>

          <div className="pt-2 pb-safe flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleCopy}
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[48px] ${
                copied
                  ? 'bg-[#6BCB77] text-stone-950'
                  : 'bg-[#FFD93D] hover:bg-[#ffe270] text-stone-950'
              }`}
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
              <span>{copied ? 'Copiado para a Área de Transferência!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-black bg-[#25D366] hover:bg-[#20b858] text-white border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              <span>Enviar via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
