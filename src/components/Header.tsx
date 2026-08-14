import React from 'react';
import { Trophy, Plus, Users, Share2, Volume2, VolumeX, Sparkles, Cloud, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { Participant } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  participants: Participant[];
  onOpenNewEntry: () => void;
  onOpenParticipants: () => void;
  onOpenShare: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  totalEntriesCount: number;
  isCloudSyncing?: boolean;
  currentUser?: User | null;
  onLoginGoogle?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewEntry,
  onOpenParticipants,
  onOpenShare,
  soundMuted,
  onToggleSound,
  totalEntriesCount,
  isCloudSyncing = true,
  currentUser,
  onLoginGoogle,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-stone-900 shadow-[0_4px_0_0_rgba(0,0,0,0.05)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFD93D] border-2 border-stone-900 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-2xl select-none transform hover:rotate-3 transition-transform shrink-0">
            🚽
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-['Outfit',sans-serif] text-lg sm:text-2xl font-black text-stone-950 tracking-tight flex items-center gap-1.5 sm:gap-2">
                Torneio do Trono
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-[#FF6B6B] text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Trophy className="w-3 h-3 text-amber-200" />
                  Liga Oficial
                </span>
              </h1>
            </div>
            <div className="text-[11px] sm:text-xs text-stone-700 font-bold flex items-center gap-2 flex-wrap mt-0.5">
              <span className="hidden sm:inline">Contabilidade & Ranking entre Amigos</span>
              <span className="text-stone-950 font-black bg-[#FFD93D]/80 px-1.5 py-0.2 rounded-md border border-stone-900/30">
                {totalEntriesCount} idas
              </span>
              {/* Cloud Sync Status */}
              <span
                title={isCloudSyncing ? 'Sincronizado em tempo real no Firebase' : 'Conectando ao Firebase...'}
                className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-500/40 shadow-xs"
              >
                <Cloud className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>Nuvem Ativa</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* User Auth Info or Login button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-stone-100 px-2 py-1 rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Usuário'}
                  className="w-5 h-5 rounded-full border border-stone-900 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs">👤</span>
              )}
              <span className="text-xs font-black text-stone-950 hidden md:inline truncate max-w-[90px]">
                {currentUser.displayName?.split(' ')[0] || 'Logado'}
              </span>
              <button
                onClick={onLogout}
                title="Sair da conta Google"
                className="p-1 text-stone-500 hover:text-stone-950 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            onLoginGoogle && (
              <button
                id="btn-login-google"
                onClick={onLoginGoogle}
                title="Conectar com conta Google"
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-black bg-white hover:bg-stone-50 text-stone-900 border-2 border-stone-900 transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-stone-900" />
                <span className="hidden sm:inline">Google</span>
              </button>
            )
          )}

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            title={soundMuted ? 'Ativar efeitos sonoros' : 'Silenciar efeitos sonoros'}
            className={`p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-black border-2 border-stone-900 transition-all flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              soundMuted
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'bg-[#FFD93D] text-stone-950 hover:bg-[#ffe169]'
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden lg:inline">{soundMuted ? 'Mudo' : 'Som'}</span>
          </button>

          {/* Manage Participants */}
          <button
            id="btn-manage-participants"
            onClick={onOpenParticipants}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-[#4D96FF] hover:bg-[#68a5ff] text-white border-2 border-stone-900 transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <Users className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Amigos</span>
          </button>

          {/* Share Ranking */}
          <button
            id="btn-share-ranking"
            onClick={onOpenShare}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-[#6BCB77] hover:bg-[#7dd488] text-stone-950 border-2 border-stone-900 transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Primary CTA: Log Poop */}
          <button
            id="btn-primary-new-entry"
            onClick={onOpenNewEntry}
            className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-[#FF6B6B] hover:bg-[#ff5252] text-white border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Ida</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-200 hidden sm:inline" />
          </button>
        </div>
      </div>
    </header>
  );
};
