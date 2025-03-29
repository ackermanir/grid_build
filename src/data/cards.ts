import { Card, CardType } from '../types';

// Card definitions
export const CARDS: Card[] = [
  {
    id: 'defend',
    name: 'Defend',
    type: 'Defense',
    cost: 0,
    effects: { defense: 2 },
    description: 'Defend a tile against 2 damage',
    emoji: '🛡️'
  },
  {
    id: 'copper',
    name: 'Copper',
    type: 'Gold',
    cost: 0,
    effects: { gold: 1 },
    description: 'Generate 1 gold',
    emoji: '💰'
  },
  {
    id: 'til-the-land',
    name: 'Til the Land',
    type: 'Action',
    cost: 0,
    effects: { land_benefit: true },
    description: 'Get the benefit of the land',
    emoji: '🌱'
  },
  {
    id: 'market',
    name: 'Market',
    type: 'Action',
    cost: 2,
    effects: { draw: 1, buy: 1 },
    description: 'Draw 1 card and gain 1 buy',
    emoji: '🏪'
  },
  {
    id: 'silver',
    name: 'Silver',
    type: 'Gold',
    cost: 3,
    effects: { gold: 2 },
    description: 'Generate 2 gold',
    emoji: '💰💰'
  },
  {
    id: 'scout',
    name: 'Scout',
    type: 'Action',
    cost: 2,
    effects: { card_play: 1, draw: 1 },
    description: 'Gain 1 card play and draw 1 card',
    emoji: '👁️'
  },
  {
    id: 'farmer',
    name: 'Farmer',
    type: 'Action',
    cost: 3,
    effects: { land_benefit: true, gold: 1 },
    description: 'Get land benefit and 1 gold',
    emoji: '👨‍🌾'
  },
  {
    id: 'barricade',
    name: 'Barricade',
    type: 'Defense',
    cost: 4,
    effects: { defense: 3, draw: 1 },
    description: 'Defend a tile against 3 damage and draw 1 card',
    emoji: '🧱'
  },
  {
    id: 'innovate',
    name: 'Innovate',
    type: 'Action',
    cost: 5,
    effects: { tech: 1 },
    description: 'Advance tech tier by 1',
    emoji: '💡'
  },
  {
    id: 'gold',
    name: 'Gold',
    type: 'Gold',
    cost: 6,
    effects: { gold: 3 },
    description: 'Generate 3 gold',
    emoji: '💰💰💰'
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    type: 'Action',
    cost: 5,
    effects: { draw: 2, card_play: 1 },
    description: 'Draw 2 cards and gain 1 card play',
    emoji: '🧪'
  },
  {
    id: 'fortify',
    name: 'Fortify',
    type: 'Defense',
    cost: 6,
    effects: { defense: 4, card_play: 1 },
    description: 'Defend a tile against 4 damage and gain 1 card play',
    emoji: '🏰'
  },
  {
    id: 'research',
    name: 'Research',
    type: 'Action',
    cost: 6,
    effects: { draw: 1, tech: 1 },
    description: 'Draw 1 card and advance tech tier by 1',
    emoji: '📚'
  },
  {
    id: 'elite-guard',
    name: 'Elite Guard',
    type: 'Defense',
    cost: 7,
    effects: { defense: 5, land_benefit: true },
    description: 'Defend a tile against 5 damage and get land benefit',
    emoji: '👮'
  },
  {
    id: 'headquarters',
    name: 'Headquarters',
    type: 'Action',
    cost: 8,
    effects: { card_play: 2, buy: 1, draw: 1 },
    description: 'Gain 2 card plays, 1 buy, and draw 1 card',
    emoji: '🏢'
  },
  {
    id: 'breakthrough',
    name: 'Breakthrough',
    type: 'Action',
    cost: 8,
    effects: { tech: 2 },
    description: 'Advance tech tier by 2',
    emoji: '⚡'
  },
  {
    id: 'treasure-chamber',
    name: 'Treasure Chamber',
    type: 'Gold',
    cost: 9,
    effects: { gold: 4, draw: 1 },
    description: 'Generate 4 gold and draw 1 card',
    emoji: '💎'
  },
  {
    id: 'ultimate-defense',
    name: 'Ultimate Defense',
    type: 'Defense',
    cost: 10,
    effects: { defense: 7 },
    description: 'Defend a tile against 7 damage',
    emoji: '🛑'
  },
  {
    id: 'mastery',
    name: 'Mastery',
    type: 'Action',
    cost: 12,
    effects: { tech: 3 },
    description: 'Advance tech tier by 3',
    emoji: '🌟'
  }
];

// Special card for wounds
export const WOUND_CARD: Card = {
  id: 'wound',
  name: 'Wound',
  type: 'Action',
  cost: 0,
  effects: {},
  description: 'A wound that does nothing and takes up space in your hand',
  emoji: '💔'
};

// Create a new instance of a card with a unique ID
export const createCardInstance = (card: Card, index: number): Card => {
  return {
    ...card,
    id: `${card.id}-${index}`
  };
};

// Create initial player deck according to game rules
export const createInitialDeck = (): Card[] => {
  const initialDeck: Card[] = [];
  
  // Find the required card types
  const defend = CARDS.find(c => c.name === 'Defend');
  const copper = CARDS.find(c => c.name === 'Copper');
  const tilTheLand = CARDS.find(c => c.name === 'Til the Land');
  
  if (defend && copper && tilTheLand) {
    // Add 4 Defend cards
    for (let i = 0; i < 4; i++) {
      initialDeck.push(createCardInstance(defend, i));
    }
    
    // Add 4 Copper cards
    for (let i = 0; i < 4; i++) {
      initialDeck.push(createCardInstance(copper, i));
    }
    
    // Add 2 Til the Land cards
    for (let i = 0; i < 2; i++) {
      initialDeck.push(createCardInstance(tilTheLand, i));
    }
  }
  
  return initialDeck;
};

// Create a wound card instance
export const createWoundCard = (index: number): Card => {
  return createCardInstance(WOUND_CARD, index);
};