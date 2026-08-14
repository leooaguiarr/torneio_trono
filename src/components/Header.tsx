import React from 'react';
import { Users, Share2, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  onOpenParticipants: () => void;
  onOpenShare: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  totalEntriesCount: number;
  onClearAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenParticipants,
  onOpenShare,
  soundMuted,
  onToggleSound,
  totalEntriesCount,
  onClearAll,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 border border-stone-900/15 flex items-center justify-center text-xl shadow-xs shrink-0">
            🚽
          </div>
          <div>
            <h1 className="font-['Outfit',sans-serif] text-base sm:text-lg font-black text-stone-900 leading-tight">
              Torneio do Trono
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-semibold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Nuvem Ativa</span>
              <span>•</span>
              <span>{totalEntriesCount} {totalEntriesCount === 1 ? 'ida' : 'idas'}</span>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            id="btn-sound"
            onClick={onToggleSound}
            title={soundMuted ? 'Ativar som' : 'Silenciar som'}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-950 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Manage Friends */}
          <button
            id="btn-friends"
            onClick={onOpenParticipants}
            title="Adicionar ou gerenciar amigos"
            className="px-3 py-2 rounded-xl text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4 text-stone-700" />
            <span className="hidden sm:inline">Amigos</span>
          </button>

          {/* Share WhatsApp */}
          <button
            id="btn-share"
            onClick={onOpenShare}
            title="Compartilhar no WhatsApp"
            className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Clear Button */}
          <button
            id="btn-clear"
            onClick={onClearAll}
            title="Zerar banco de dados"
            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
