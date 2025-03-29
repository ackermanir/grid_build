import { Card } from '../types';
import { createCardInstance } from '../utils/cardUtils';

// Card definitions based on cards.csv
export const CARDS: Card[] = [
  {
    id: 'defend',
    name: 'Defend',
    emoji: '🛡️',
    cost: 1,
    shopNumber: 0,
    type: 'Defense',
    effects: { defense: 2 },
    description: 'Add defense of 2 to grid played on'
  },
  {
    id: 'copper',
    name: 'Copper',
    emoji: '🥉',
    cost: 1,
    shopNumber: 0,
    type: 'Gold',
    effects: { gold: 1 },
    description: 'Add +1 gold to player'
  },
  {
    id: 'til-the-land',
    name: 'Til the Land',
    emoji: '🏞️',
    cost: 2,
    shopNumber: 0,
    type: 'Action',
    effects: { land_benefit: true },
    description: 'Land Benefit'
  },
  {
    id: 'wound',
    name: 'Wound',
    emoji: '💔',
    cost: 0,
    shopNumber: 0,
    type: 'Action',
    effects: {},
    description: 'A wound that does nothing and takes up space in your hand'
  },
  {
    id: 'gold-rush',
    name: 'Gold Rush',
    emoji: '💰',
    cost: 6,
    shopNumber: 5,
    type: 'Gold',
    effects: { 
      gold: 3,
      conditional_effect: {
        condition: 'land_type',
        land_type: 'gold',
        effects: { gold: 1 }
      }
    },
    description: '+3 Gold. If played on Yellow land, +1 Gold'
  },
  {
    id: 'trading-post',
    name: 'Trading Post',
    emoji: '🏪',
    cost: 4,
    shopNumber: 5,
    type: 'Action',
    effects: { 
      gold: 1, 
      buy: 1,
      land_benefit: true
    },
    description: '+1 Gold, +1 Buy, Land Benefit'
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    emoji: '🔗',
    cost: 7,
    shopNumber: 5,
    type: 'Action',
    effects: { 
      gold: 2, 
      buy: 1,
      draw: 1,
      land_benefit: true
    },
    description: '+2 Gold, +1 Buy, +1 Card Drawn, Land Benefit'
  },
  {
    id: 'sturdy-wall',
    name: 'Sturdy Wall',
    emoji: '🧱',
    cost: 4,
    shopNumber: 5,
    type: 'Defense',
    effects: { 
      defense: 4,
      land_benefit: true
    },
    description: 'Defense +4, Land Benefit'
  },
  {
    id: 'missile-dome',
    name: 'Missle Dome',
    emoji: '🌐',
    cost: 5,
    shopNumber: 5,
    type: 'Defense',
    effects: { 
      special_effect: 'missile_dome',
      defense: 4
    },
    description: 'Defend +4 on two adjacent tiles (including diagonal)'
  },
  {
    id: 'barricade',
    name: 'Barricade',
    emoji: '🚧',
    cost: 5,
    shopNumber: 5,
    type: 'Defense',
    effects: { 
      defense: 2,
      conditional_effect: {
        condition: 'land_type',
        land_type: 'card',
        effects: { defense_adjacent: true, defense: 2 }
      }
    },
    description: 'Defense +2. If played on Blue land, Defend +2 to all adjacent grids (including diagonal)'
  },
  {
    id: 'stone-skin',
    name: 'Stone Skin',
    emoji: '🗿',
    cost: 5,
    shopNumber: 5,
    type: 'Defense',
    effects: { 
      defense: 2,
      defense_all_played: true,
      special_effect: 'stone_skin'
    },
    description: 'Defense +2. All tiles that had a card played on them (including this one) get Defense +2'
  },
  {
    id: 'durable-defense',
    name: 'Durable Defense',
    emoji: '🏛️',
    cost: 8,
    shopNumber: 5,
    type: 'Defense',
    effects: { 
      defense: 4,
      defense_duration: 2,
      special_effect: 'durable_defense'
    },
    description: 'Defend +4. This defense carries over on this grid tile for two more turns'
  },
  {
    id: 'library',
    name: 'Library',
    emoji: '📚',
    cost: 5,
    shopNumber: 5,
    type: 'Action',
    effects: { 
      draw: 2,
      land_benefit: true
    },
    description: '+2 Cards, Land Benefit'
  },
  {
    id: 'archives',
    name: 'Archives',
    emoji: '📜',
    cost: 3,
    shopNumber: 5,
    type: 'Action',
    effects: { 
      discard_draw: true,
      special_effect: 'archives'
    },
    description: 'Discard any number of cards from your hand. Draw as many cards as was discarded'
  },
  {
    id: 'split',
    name: 'Split',
    emoji: '🔀',
    cost: 3,
    shopNumber: 5,
    type: 'Action',
    effects: { 
      card_play: 2,
      draw: 1
    },
    description: '+2 card plays, +1 Card Drawn'
  },
  {
    id: 'research-lab',
    name: 'Research Lab',
    emoji: '🧪',
    cost: 6,
    shopNumber: 5,
    type: 'Action',
    effects: { 
      draw: 1,
      card_play: 1,
      conditional_effect: {
        condition: 'land_type',
        land_type: 'card',
        effects: { draw: 1 }
      }
    },
    description: '+1 Card Drawn, +1 Card Play. If played on Blue Land, +1 Card Drawn'
  },
  {
    id: 'cornucopia',
    name: 'Cornucopia',
    emoji: '🏕️',
    cost: 5,
    shopNumber: 5,
    type: 'Action',
    effects: { 
      land_benefit: true,
      land_benefit_double: true
    },
    description: 'Land Benefit x2'
  },
  {
    id: 'tech-upgrade-2',
    name: 'Tech Upgrade 2',
    emoji: '⚙️',
    cost: 6,
    shopNumber: 1,
    type: 'Tech',
    effects: { tech: 2 },
    description: 'Upgrade to tech tier 2'
  },
  {
    id: 'tech-upgrade-3',
    name: 'Tech Upgrade 3',
    emoji: '🏗️',
    cost: 8,
    shopNumber: 1,
    type: 'Tech',
    effects: { tech: 3 },
    description: 'Upgrade to tech tier 3'
  },
  {
    id: 'tech-upgrade-4',
    name: 'Tech Upgrade 4',
    emoji: '☢️',
    cost: 10,
    shopNumber: 1,
    type: 'Tech',
    effects: { tech: 4 },
    description: 'Upgrade to tech tier 4'
  },
  {
    id: 'tech-upgrade-5',
    name: 'Tech Upgrade 5',
    emoji: '🚀',
    cost: 12,
    shopNumber: 1,
    type: 'Tech',
    effects: { tech: 5 },
    description: 'Upgrade to tech tier 5'
  }
];

// Get all cards
export const getAllCards = (): Card[] => {
  return CARDS;
};

// Create a new instance of a card with a unique ID
export const createNewCardInstance = (card: Card, index: number): Card => {
  return createCardInstance(card, index);
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
  const woundCard = CARDS.find(c => c.name === 'Wound');
  if (!woundCard) {
    throw new Error('Wound card not found in card definitions');
  }
  return createCardInstance(woundCard, index);
};

// Filter cards by tech tier and shop number
export const getShopCards = (techTier: number): Card[] => {
  // Tech cards (shopNumber=1) are always available but filtered by tier
  const techCards = CARDS.filter(c => c.shopNumber === 1 && c.effects.tech && c.effects.tech <= techTier + 1);
  
  // Regular shop cards (shopNumber=5) filtered by cost based on tech tier
  let maxCost = 3;
  
  switch (techTier) {
    case 1: maxCost = 7; break;
    case 2: maxCost = 7; break;
    case 3: maxCost = 7; break;
    case 4: maxCost = 9; break;
    case 5: maxCost = Infinity; break;
    default: maxCost = 7;
  }
  
  const regularCards = CARDS.filter(c => 
    c.shopNumber === 5 && 
    c.cost <= maxCost
  );
  
  return [...techCards, ...regularCards];
};
