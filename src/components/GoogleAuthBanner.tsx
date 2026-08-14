import React from 'react';
import { User, LogIn, LogOut, Sparkles } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Participant } from '../types';

interface GoogleAuthBannerProps {
  currentUser: FirebaseUser | null;
  currentParticipant: Participant | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
}

export const GoogleAuthBanner: React.FC<GoogleAuthBannerProps> = ({
  currentUser,
  currentParticipant,
  onSignInWithGoogle,
  onSignOut,
  isSigningIn,
}) => {
  if (currentUser) {
    return (
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'Usuário'}
              className="w-9 h-9 rounded-full border border-amber-300 object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-amber-400 border border-stone-900/10 flex items-center justify-center font-bold text-sm shrink-0">
              {currentParticipant?.avatar || '👑'}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                Conectado como
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs sm:text-sm font-black text-stone-900 truncate">
              {currentParticipant?.avatar} {currentParticipant?.name || currentUser.displayName || 'Você'}
            </p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          title="Sair da conta Google"
        >
          <LogOut className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden sm:inline">Trocar conta</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-stone-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/10">
          👑
        </div>
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
            <span>Entre com o Google para pontuar</span>
          </h3>
          <p className="text-[11px] text-stone-300 font-medium">
            Seu perfil entra automaticamente no ranking dos amigos!
          </p>
        </div>
      </div>

      <button
        onClick={onSignInWithGoogle}
        disabled={isSigningIn}
        className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 disabled:opacity-75 shrink-0"
      >
        {/* Google G SVG */}
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
        <span>{isSigningIn ? 'Entrando...' : 'Entrar com Google'}</span>
      </button>
    </div>
  );
};
