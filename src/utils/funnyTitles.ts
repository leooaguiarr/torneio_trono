import { LocationType } from '../types';

// General funny nicknames for newcomers / default seed
export const GENERAL_FUNNY_NICKNAMES = [
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

// Location-specific funny titles that dynamically adapt based on where the user goes most!
export const LOCATION_BASED_NICKNAMES: Record<LocationType, string[]> = {
  trabalho: [
    'Mestre da Cagada Remunerada',
    'Cagador Salariado CLT',
    'Terror do RH',
    'Lucrando no Vaso Sanitário',
    'Auditor do Trono Corporativo',
    'Faturando em Horário Comercial',
    'Produtividade no Banheiro da Firma',
  ],
  casa: [
    'Cú de Ouro do Lar',
    'Sultão do Trono Climatizado',
    'Patriarca da Privada Familiar',
    'Rei do Conforto Doméstico',
    'Apegado à Própria Cerâmica',
    'Dono da Privada Sagrada',
    'Bebedor de Café com Trono Próprio',
  ],
  role: [
    'Guerreiro de Banheiro de Boteco',
    'Sobrevivente do Copo Sujo',
    'Inimigo da Ambev',
    'Desbravador de Banheiro Químico',
    'Alpinista da Noite Insalubre',
    'Herói da Balada e da Privada',
    'Corajoso da Madrugada',
  ],
  publico: [
    'Terror dos Shoppings',
    'Inimigo do Assento Limpo',
    'Sem Nojinho de Privada Pública',
    'Colonizador de Banheiros Públicos',
    'Cliente VIP do Shopping',
    'Fiscal de Sabonete de Shopping',
  ],
  academia: [
    'Monstro do Pré-Treino',
    'Explosão de Whey Protein',
    'Mais Pesado que o Supino',
    'Agachamento Turbo',
    'Bomba Relógio de Creatina',
    'Atleta de Pressão Intestinal',
  ],
  viagem: [
    'Colonizador Internacional de Tronos',
    'Cagão Sem Fronteiras',
    'Avaliador de Hotéis 5 Estrelas',
    'Marcador de Território Global',
    'Passaporte do Vaso Sanitário',
  ],
  outro: [
    'Agente Secreto do Vaso Clandestino',
    'Operação Sigilosa no Trono',
    'Cagador Fantasma',
    'Espião da Porcelana Oculta',
  ],
};

/**
 * Returns dynamic funny nickname based on the participant's top location and history
 */
export function getDynamicFunnyNickname(
  locationBreakdown?: Record<LocationType, number>,
  totalCount: number = 0,
  fallbackSeed: string = ''
): string {
  if (!locationBreakdown || totalCount === 0) {
    return getDeterministicFunnyNickname(fallbackSeed);
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

  if (maxCount <= 0) {
    return getDeterministicFunnyNickname(fallbackSeed);
  }

  const pool = LOCATION_BASED_NICKNAMES[topLoc] || GENERAL_FUNNY_NICKNAMES;
  let hash = 0;
  for (let i = 0; i < fallbackSeed.length; i++) {
    hash = (hash << 5) - hash + fallbackSeed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash + totalCount) % pool.length;
  return pool[index];
}

export function getDeterministicFunnyNickname(seed: string): string {
  if (!seed) return GENERAL_FUNNY_NICKNAMES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GENERAL_FUNNY_NICKNAMES.length;
  return GENERAL_FUNNY_NICKNAMES[index];
}

export function getRandomFunnyNickname(): string {
  const index = Math.floor(Math.random() * GENERAL_FUNNY_NICKNAMES.length);
  return GENERAL_FUNNY_NICKNAMES[index];
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
