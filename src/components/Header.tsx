import React from 'react';
import { Share2, Volume2, VolumeX, Trash2, LogIn, LogOut } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Participant } from '../types';
import { getDeterministicFunnyNickname } from '../utils/funnyTitles';

interface HeaderProps {
  onOpenShare: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  totalEntriesCount: number;
  onClearAll: () => void;
  currentUser: FirebaseUser | null;
  currentParticipant: Participant | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenShare,
  soundMuted,
  onToggleSound,
  totalEntriesCount,
  onClearAll,
  currentUser,
  currentParticipant,
  onSignInWithGoogle,
  onSignOut,
}) => {
  const nickname = currentParticipant?.nickname || (currentUser ? getDeterministicFunnyNickname(currentUser.uid) : '');

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3">
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
              <span>Nuvem</span>
              <span>•</span>
              <span>{totalEntriesCount} {totalEntriesCount === 1 ? 'ida' : 'idas'}</span>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Google Auth Quick Pill / Button */}
          {currentUser ? (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-rose-50 border border-amber-300 hover:border-rose-300 text-stone-900 hover:text-rose-700 transition-colors cursor-pointer group shadow-2xs"
              title="Clique para sair da conta Google"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="w-5 h-5 rounded-full object-cover border border-amber-400"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs">{currentParticipant?.avatar || '👤'}</span>
              )}
              <div className="text-left max-w-[100px] sm:max-w-[130px] truncate leading-tight">
                <span className="text-[9px] text-amber-800 font-black block truncate">
                  {nickname}
                </span>
                <span className="text-xs font-bold text-stone-900 block truncate">
                  {currentParticipant?.name || currentUser.displayName?.split(' ')[0] || 'Eu'}
                </span>
              </div>
              <LogOut className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity ml-0.5" />
            </button>
          ) : (
            <button
              onClick={onSignInWithGoogle}
              className="px-3 py-2 rounded-xl text-xs font-black text-stone-900 bg-amber-400 hover:bg-amber-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Entrar com Google"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              <span>Entrar</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            id="btn-sound"
            onClick={onToggleSound}
            title={soundMuted ? 'Ativar som' : 'Silenciar som'}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-950 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Share WhatsApp */}
          <button
            id="btn-share"
            onClick={onOpenShare}
            title="Compartilhar no WhatsApp"
            className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
