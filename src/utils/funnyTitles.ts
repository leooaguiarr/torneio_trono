import { LocationType } from '../types';

export const FUNNY_NICKNAMES = [
  'O Terror da Porcelana',
  'Destruidor de Encanamento',
  'Mestre da Cagada Remunerada',
  'Rei da Fibra',
  'Bomba Relógio Intestinal',
  'Desentupidor Nato',
  'Filósofo do Trono',
  'Lorde das Fezes',
  'Tsunami de Descarga',
  'Sultão do Papel Neve',
  'Alpinista de Vaso Sanitário',
  'General do Trono Real',
  'Guerreiro do Papel Folha Dupla',
  'Atleta de Alta Pressão',
  'Terror do Sifão',
  'Fiscal de Papel Higiênico',
  'Encantador de Privadas',
  'Monstro do Esgoto',
  'Engenheiro de Descargas',
  'Pistola de Pressão',
  'Doutor em Soltar o Barro',
  'Comandante da Cerâmica',
  'Imperador da Barriga Leve',
  'Capitão do Trocador de Papel',
  'Mestre do Bumbum de Aço',
  'Cavaleiro da Descarga Turbo',
];

export function getDeterministicFunnyNickname(seed: string): string {
  if (!seed) return FUNNY_NICKNAMES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FUNNY_NICKNAMES.length;
  return FUNNY_NICKNAMES[index];
}

export function getRandomFunnyNickname(): string {
  const index = Math.floor(Math.random() * FUNNY_NICKNAMES.length);
  return FUNNY_NICKNAMES[index];
}

export interface LocationRoastInfo {
  topLocation: LocationType | null;
  topLocationLabel: string;
  topCount: number;
  emoji: string;
  roast: string;
  badge: string;
}

export function getLocationRoast(
  locationBreakdown: Record<LocationType, number>,
  totalCount: number
): LocationRoastInfo {
  if (totalCount === 0) {
    return {
      topLocation: null,
      topLocationLabel: 'Nenhuma ida',
      topCount: 0,
      emoji: '🧻',
      roast: 'Intestino travado ou vergonha de pontuar? Solta o barro!',
      badge: 'Travado 🔒',
    };
  }

  // Find top location
  let topLoc: LocationType = 'casa';
  let maxCount = -1;

  const entries = Object.entries(locationBreakdown) as [LocationType, number][];
  for (const [loc, count] of entries) {
    if (count > maxCount) {
      maxCount = count;
      topLoc = loc;
    }
  }

  // If no location was recorded or max is 0
  if (maxCount <= 0) {
    return {
      topLocation: 'casa',
      topLocationLabel: `${totalCount}x sem local especificado`,
      topCount: totalCount,
      emoji: '🚽',
      roast: 'Cagou no sigilo sem revelar o local do crime!',
      badge: 'Misterioso 🕵️',
    };
  }

  switch (topLoc) {
    case 'trabalho':
      return {
        topLocation: 'trabalho',
        topLocationLabel: `${maxCount}x no Trabalho`,
        topCount: maxCount,
        emoji: '💼',
        roast: 'Especialista em Cagada Remunerada 💸 (Ganhando salário no vaso!)',
        badge: 'Cagada Paga 🤑',
      };
    case 'casa':
      return {
        topLocation: 'casa',
        topLocationLabel: `${maxCount}x em Casa`,
        topCount: maxCount,
        emoji: '🏠',
        roast: 'Cú de Ouro! Só caga no conforto sagrado e climatizado do lar 🛋️',
        badge: 'Rei do Conforto 👑',
      };
    case 'role':
      return {
        topLocation: 'role',
        topLocationLabel: `${maxCount}x no Rolê / Bar`,
        topCount: maxCount,
        emoji: '🍻',
        roast: 'Corajoso nato! Sobrevivente dos banheiros insalubres da noite 🍺',
        badge: 'Guerreiro de Bar 🛡️',
      };
    case 'publico':
      return {
        topLocation: 'publico',
        topLocationLabel: `${maxCount}x em Shopping / Público`,
        topCount: maxCount,
        emoji: '🏢',
        roast: 'Inimigo da fita no assento! Caga em qualquer shopping sem dó 🛒',
        badge: 'Sem Frescura 🎯',
      };
    case 'academia':
      return {
        topLocation: 'academia',
        topLocationLabel: `${maxCount}x na Academia`,
        topCount: maxCount,
        emoji: '💪',
        roast: 'O pré-treino bateu errado e foi direto pro trono! Mais pesado que o supino ⚡',
        badge: 'Pré-Treino Explosivo 🔥',
      };
    case 'viagem':
      return {
        topLocation: 'viagem',
        topLocationLabel: `${maxCount}x em Viagem`,
        topCount: maxCount,
        emoji: '✈️',
        roast: 'Colonizador internacional! Marcando território pelo mundo 🗺️',
        badge: 'Cagão Viajante 🌍',
      };
    case 'outro':
    default:
      return {
        topLocation: 'outro',
        topLocationLabel: `${maxCount}x em Outro Local`,
        topCount: maxCount,
        emoji: '📍',
        roast: 'Operação secreta em vasos clandestinos não identificados 🕵️',
        badge: 'Local Secreto 🤫',
      };
  }
}
