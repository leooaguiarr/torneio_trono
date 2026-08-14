export type EffortLevel = 1 | 2 | 3 | 4 | 5;

export interface EffortInfo {
  level: EffortLevel;
  label: string;
  shortLabel: string;
  description: string;
  emoji: string;
  color: string; // Tailwind text/bg classes
  badgeBg: string;
  badgeBorder: string;
}

export const EFFORT_LEVELS: Record<EffortLevel, EffortInfo> = {
  1: {
    level: 1,
    label: 'Relâmpago & Suave',
    shortLabel: 'Suave',
    description: 'Sem nenhum esforço, rápido como um raio ⚡',
    emoji: '⚡',
    color: 'text-emerald-900 bg-emerald-100 border-emerald-400',
    badgeBg: 'bg-emerald-500',
    badgeBorder: 'border-emerald-400',
  },
  2: {
    level: 2,
    label: 'Tranquilo / Natural',
    shortLabel: 'Tranquilo',
    description: 'Fluxo perfeito, sem pressa e relaxado 🍃',
    emoji: '🍃',
    color: 'text-cyan-900 bg-cyan-100 border-cyan-400',
    badgeBg: 'bg-cyan-500',
    badgeBorder: 'border-cyan-400',
  },
  3: {
    level: 3,
    label: 'Moderado / Padrão',
    shortLabel: 'Moderado',
    description: 'Exigiu um pouco de concentração e presença 🧘',
    emoji: '🧘',
    color: 'text-amber-900 bg-amber-100 border-amber-400',
    badgeBg: 'bg-amber-500',
    badgeBorder: 'border-amber-400',
  },
  4: {
    level: 4,
    label: 'Intenso / Suor Frio',
    shortLabel: 'Intenso',
    description: 'Segurando nas paredes, exigiu dedicação e garra 🥵',
    emoji: '🥵',
    color: 'text-orange-900 bg-orange-100 border-orange-400',
    badgeBg: 'bg-orange-500',
    badgeBorder: 'border-orange-400',
  },
  5: {
    level: 5,
    label: 'Lendário / Parto Cósmico',
    shortLabel: 'Lendário',
    description: 'Experiência quase religiosa, renascimento total 🌋',
    emoji: '🌋',
    color: 'text-rose-900 bg-rose-100 border-rose-400',
    badgeBg: 'bg-rose-500',
    badgeBorder: 'border-rose-400',
  },
};

export type LocationType = 'casa' | 'trabalho' | 'academia' | 'role' | 'viagem' | 'publico' | 'outro';

export interface LocationInfo {
  type: LocationType;
  label: string;
  emoji: string;
}

export const LOCATIONS: Record<LocationType, LocationInfo> = {
  casa: { type: 'casa', label: 'Em Casa', emoji: '🏠' },
  trabalho: { type: 'trabalho', label: 'No Trabalho (Remunerado)', emoji: '💼' },
  academia: { type: 'academia', label: 'Academia', emoji: '💪' },
  role: { type: 'role', label: 'Rolê / Bar', emoji: '🍻' },
  viagem: { type: 'viagem', label: 'Viagem / Hotel', emoji: '✈️' },
  publico: { type: 'publico', label: 'Banheiro Público / Shopping', emoji: '🏢' },
  outro: { type: 'outro', label: 'Outro Lugar', emoji: '📍' },
};

export interface Participant {
  id: string;
  name: string;
  nickname?: string;
  avatar: string; // Emoji
  color: string; // e.g. 'amber', 'emerald', 'blue', 'purple', 'rose', 'indigo'
  createdAt: string;
  userId?: string; // Firebase Auth UID
  email?: string;
  photoURL?: string;
}

export interface PoopEntry {
  id: string;
  participantId: string;
  timestamp: string; // ISO date string e.g. 2026-08-14T14:30:00Z
  effortLevel: EffortLevel;
  durationMinutes?: number;
  location?: LocationType;
  notes?: string;
  bristolScale?: number; // 1 to 7
  createdBy?: string;
}

export type Timeframe = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'all_time';

export interface TimeframeOption {
  id: Timeframe;
  label: string;
  subLabel: string;
  badge: string;
}

export interface ParticipantRankingStats {
  participant: Participant;
  totalCount: number;
  avgEffort: number;
  totalEffortScore: number;
  avgDuration: number;
  dailyAverage: number;
  effortBreakdown: Record<EffortLevel, number>;
  locationBreakdown: Record<LocationType, number>;
  daysActive: number;
  rank: number;
  hardestEntryCount: number;
  fastestEntryCount: number;
  titles: string[];
}
