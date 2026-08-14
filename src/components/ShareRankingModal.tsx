import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Share2 } from 'lucide-react';
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
      // ignore
    }
  };

  const handleOpenWhatsApp = () => {
    triggerHaptic(20);
    playPopSound(soundMuted);
    const encoded = encodeURIComponent(formattedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-0 sm:my-6 max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <h2 className="font-['Outfit',sans-serif] text-base sm:text-lg font-black text-stone-900">
              Compartilhar Placar
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600">
            <span>Mensagem Formatada:</span>
            <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full font-black">
              {timeframeLabel.title}
            </span>
          </div>

          <div className="bg-stone-900 text-stone-100 p-3.5 rounded-xl font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto border border-stone-800 leading-relaxed select-all">
            {formattedText}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="py-3 px-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-900 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Abrir WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
