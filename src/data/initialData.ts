import { Participant, PoopEntry } from '../types';

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'p-1',
    name: 'Leo',
    nickname: 'O Estrategista',
    avatar: '👑',
    color: 'amber',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-2',
    name: 'Gabriel',
    nickname: 'Relâmpago McQueen',
    avatar: '⚡',
    color: 'emerald',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-3',
    name: 'Matheus',
    nickname: 'Guerreiro de Ferro',
    avatar: '🛡️',
    color: 'blue',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-4',
    name: 'Lucas',
    nickname: 'Filósofo do Trono',
    avatar: '🧘',
    color: 'purple',
    createdAt: new Date().toISOString(),
  },
];

export function generateSeedEntries(): PoopEntry[] {
  const now = new Date();
  const entries: PoopEntry[] = [];

  // Generate realistic logs for the current week & previous days of this month
  const sampleConfigs = [
    // Today
    { pId: 'p-1', hoursAgo: 2, effort: 2, loc: 'casa', dur: 7, notes: 'Cafézinho da manhã fez efeito' },
    { pId: 'p-2', hoursAgo: 4, effort: 1, loc: 'trabalho', dur: 4, notes: 'Cagada remunerada e veloz' },
    { pId: 'p-3', hoursAgo: 5, effort: 4, loc: 'academia', dur: 15, notes: 'Pré-treino bateu errado' },
    { pId: 'p-1', hoursAgo: 6, effort: 3, loc: 'trabalho', dur: 10, notes: 'Intervalo estratégico' },
    { pId: 'p-4', hoursAgo: 8, effort: 2, loc: 'casa', dur: 12, notes: 'Lendo notícias com calma' },

    // Yesterday
    { pId: 'p-1', hoursAgo: 24 + 3, effort: 3, loc: 'casa', dur: 9, notes: 'Rotina em dia' },
    { pId: 'p-2', hoursAgo: 24 + 5, effort: 1, loc: 'casa', dur: 3, notes: 'Recorde de velocidade' },
    { pId: 'p-2', hoursAgo: 24 + 10, effort: 2, loc: 'role', dur: 6, notes: 'No barzinho dos amigos' },
    { pId: 'p-3', hoursAgo: 24 + 7, effort: 5, loc: 'casa', dur: 22, notes: 'A feijoada de domingo cobrou o preço' },
    { pId: 'p-4', hoursAgo: 24 + 2, effort: 2, loc: 'casa', dur: 10, notes: 'Paz absoluta' },

    // 2 days ago
    { pId: 'p-1', hoursAgo: 48 + 2, effort: 2, loc: 'trabalho', dur: 8, notes: 'No horário nobre da firma' },
    { pId: 'p-1', hoursAgo: 48 + 8, effort: 1, loc: 'casa', dur: 5, notes: 'Rápido e rasteiro' },
    { pId: 'p-2', hoursAgo: 48 + 4, effort: 2, loc: 'trabalho', dur: 5, notes: 'Pausa técnica' },
    { pId: 'p-3', hoursAgo: 48 + 6, effort: 3, loc: 'casa', dur: 12, notes: 'Trabalho árduo' },
    { pId: 'p-4', hoursAgo: 48 + 9, effort: 3, loc: 'casa', dur: 11, notes: 'Acompanhado de podcast' },

    // 3 days ago
    { pId: 'p-1', hoursAgo: 72 + 4, effort: 4, loc: 'casa', dur: 18, notes: 'Pizza apimentada' },
    { pId: 'p-2', hoursAgo: 72 + 6, effort: 1, loc: 'casa', dur: 4, notes: 'Express' },
    { pId: 'p-3', hoursAgo: 72 + 5, effort: 4, loc: 'trabalho', dur: 16, notes: 'Sobrevivi' },
    { pId: 'p-4', hoursAgo: 72 + 3, effort: 2, loc: 'viagem', dur: 8, notes: 'Banheiro do hotel' },

    // 4 days ago
    { pId: 'p-1', hoursAgo: 96 + 3, effort: 2, loc: 'casa', dur: 7, notes: 'Leveza' },
    { pId: 'p-2', hoursAgo: 96 + 7, effort: 2, loc: 'trabalho', dur: 6, notes: 'Mais uma pra conta' },
    { pId: 'p-2', hoursAgo: 96 + 12, effort: 1, loc: 'casa', dur: 3, notes: 'Tiro livre' },
    { pId: 'p-3', hoursAgo: 96 + 4, effort: 3, loc: 'casa', dur: 10, notes: 'Equilibrado' },

    // 5 days ago
    { pId: 'p-1', hoursAgo: 120 + 5, effort: 3, loc: 'casa', dur: 9, notes: 'Constância' },
    { pId: 'p-3', hoursAgo: 120 + 8, effort: 4, loc: 'casa', dur: 14, notes: 'Força bruta' },
    { pId: 'p-4', hoursAgo: 120 + 2, effort: 2, loc: 'casa', dur: 8, notes: 'Zen' },
  ];

  sampleConfigs.forEach((cfg, idx) => {
    const entryDate = new Date(now.getTime() - cfg.hoursAgo * 60 * 60 * 1000);
    entries.push({
      id: `seed-entry-${idx + 1}`,
      participantId: cfg.pId,
      timestamp: entryDate.toISOString(),
      effortLevel: cfg.effort as 1 | 2 | 3 | 4 | 5,
      durationMinutes: cfg.dur,
      location: cfg.loc as any,
      notes: cfg.notes,
    });
  });

  return entries;
}
