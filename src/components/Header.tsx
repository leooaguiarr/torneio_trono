import React from 'react';
import { Trophy, Plus, Users, Share2, Volume2, VolumeX, Cloud, LogIn, LogOut } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-stone-900 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Logo and Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FFD93D] border-2 border-stone-900 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-2xl select-none shrink-0">
            🚽
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-['Outfit',sans-serif] text-base sm:text-xl font-black text-stone-950 tracking-tight">
                Torneio do Trono
              </h1>
            </div>
            <div className="text-[10px] sm:text-xs text-stone-600 font-bold flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Nuvem Ativa
              </span>
              <span>•</span>
              <span>{totalEntriesCount} idas</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            title={soundMuted ? 'Ativar som' : 'Silenciar som'}
            className={`p-2 rounded-xl text-xs font-black border-2 border-stone-900 transition-all flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 ${
              soundMuted
                ? 'bg-stone-100 text-stone-600'
                : 'bg-[#FFD93D] text-stone-950'
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Manage Participants */}
          <button
            id="btn-manage-participants"
            onClick={onOpenParticipants}
            title="Gerenciar Amigos"
            className="px-2.5 py-2 sm:px-3 rounded-xl text-xs font-black bg-[#4D96FF] hover:bg-[#68a5ff] text-white border-2 border-stone-900 transition-all flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer min-h-[38px]"
          >
            <Users className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Amigos</span>
          </button>

          {/* Share WhatsApp */}
          <button
            id="btn-share-ranking"
            onClick={onOpenShare}
            title="Compartilhar no WhatsApp"
            className="px-2.5 py-2 sm:px-3 rounded-xl text-xs font-black bg-[#25D366] hover:bg-[#20b858] text-white border-2 border-stone-900 transition-all flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer min-h-[38px]"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <button
              onClick={onLogout}
              title={`Conectado como ${currentUser.displayName || 'Usuário'}. Clique para sair.`}
              className="p-1.5 rounded-xl border-2 border-stone-900 bg-stone-100 hover:bg-stone-200 text-xs font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>👤</span>
              )}
            </button>
          ) : (
            onLoginGoogle && (
              <button
                onClick={onLoginGoogle}
                title="Entrar com Google"
                className="px-2.5 py-2 rounded-xl text-xs font-black bg-white hover:bg-stone-100 text-stone-900 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-stone-800" />
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
