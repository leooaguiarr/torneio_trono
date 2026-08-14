import React from 'react';
import { Trophy, History, BarChart3, Users, Plus, Share2 } from 'lucide-react';
import { triggerHaptic, playPopSound } from '../utils/soundEffects';

interface MobileBottomNavProps {
  activeTab: 'ranking' | 'feed' | 'stats';
  onChangeTab: (tab: 'ranking' | 'feed' | 'stats') => void;
  onOpenNewEntry: () => void;
  onOpenParticipants: () => void;
  onOpenShare: () => void;
  soundMuted: boolean;
  entriesCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenNewEntry,
  onOpenParticipants,
  onOpenShare,
  soundMuted,
  entriesCount,
}) => {
  const handleTabClick = (tab: 'ranking' | 'feed' | 'stats') => {
    triggerHaptic(15);
    playPopSound(soundMuted);
    onChangeTab(tab);
  };

  const handleActionClick = (action: () => void) => {
    triggerHaptic(20);
    playPopSound(soundMuted);
    action();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t-2 border-stone-900 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-safe md:hidden">
      <div className="flex items-center justify-around px-2 py-2 relative">
        {/* Tab 1: Ranking */}
        <button
          id="mobile-nav-ranking"
          onClick={() => handleTabClick('ranking')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-w-[60px] ${
            activeTab === 'ranking'
              ? 'bg-[#FFD93D] text-stone-950 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
              : 'text-stone-600 hover:text-stone-950 border-2 border-transparent'
          }`}
        >
          <Trophy className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] font-black mt-0.5">Ranking</span>
        </button>

        {/* Tab 2: Feed */}
        <button
          id="mobile-nav-feed"
          onClick={() => handleTabClick('feed')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-w-[60px] relative ${
            activeTab === 'feed'
              ? 'bg-[#4D96FF] text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
              : 'text-stone-600 hover:text-stone-950 border-2 border-transparent'
          }`}
        >
          <History className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] font-black mt-0.5">Histórico</span>
          {entriesCount > 0 && activeTab !== 'feed' && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6B6B] text-white text-[9px] font-black flex items-center justify-center border border-stone-900">
              {entriesCount > 99 ? '99+' : entriesCount}
            </span>
          )}
        </button>

        {/* Center Primary Action: + Registrar */}
        <div className="relative -mt-6">
          <button
            id="mobile-nav-register"
            onClick={() => handleActionClick(onOpenNewEntry)}
            title="Registrar nova ida ao trono"
            className="w-14 h-14 rounded-2xl bg-[#FF6B6B] text-white border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all group"
          >
            <span className="text-xl leading-none">🚽</span>
            <span className="text-[9px] font-black uppercase tracking-tighter leading-none mt-0.5 text-white">
              + Ida
            </span>
          </button>
        </div>

        {/* Tab 3: Stats */}
        <button
          id="mobile-nav-stats"
          onClick={() => handleTabClick('stats')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-w-[60px] ${
            activeTab === 'stats'
              ? 'bg-[#6BCB77] text-stone-950 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
              : 'text-stone-600 hover:text-stone-950 border-2 border-transparent'
          }`}
        >
          <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] font-black mt-0.5">Raio-X</span>
        </button>

        {/* Tab 4: Amigos Modal */}
        <button
          id="mobile-nav-friends"
          onClick={() => handleActionClick(onOpenParticipants)}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-stone-600 hover:text-stone-950 transition-all cursor-pointer min-w-[60px] border-2 border-transparent hover:border-stone-900"
        >
          <Users className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] font-black mt-0.5">Amigos</span>
        </button>
      </div>
    </div>
  );
};
