import { Card, CardType, CardEffect, LandType } from '../types';

export const parseCSVCards = (csvContent: string): Card[] => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const card: Partial<Card> = { id: `card-${index}` };
    
    // Extract basic card information
    card.name = values[0] || '';
    card.emoji = values[1] || '';
    card.cost = parseInt(values[2], 10) || 0;
    card.shopNumber = parseInt(values[3], 10) || 0;
    
    // Determine card type based on effects
    card.type = determineCardType(card.name, values.slice(4));
    
    // Parse effects from the remaining columns
    card.effects = parseCardEffects(values.slice(4));
    
    // Generate description from effects
    card.description = generateCardDescription(card.name, card.effects, values.slice(4));
    
    return card as Card;
  });
};

const determineCardType = (name: string, effects: string[]): CardType => {
  if (name.startsWith('Tech Upgrade')) {
    return 'Tech';
  }
  
  if (effects.some(effect => effect.includes('Defense') || effect.includes('Defend'))) {
    return 'Defense';
  }
  
  if (effects.some(effect => effect.includes('Gold'))) {
    return 'Gold';
  }
  
  return 'Action';
};

const parseCardEffects = (effectStrings: string[]): CardEffect => {
  const effects: CardEffect = {};
  
  // Process each effect string
  effectStrings.forEach(effectStr => {
    if (!effectStr) return;
    
    // Defense effects
    if (effectStr.match(/Defense \+(\d+)/)) {
      effects.defense = parseInt(effectStr.match(/Defense \+(\d+)/)![1], 10);
    } else if (effectStr.match(/Defend \+(\d+)/)) {
      effects.defense = parseInt(effectStr.match(/Defend \+(\d+)/)![1], 10);
    } else if (effectStr.match(/Add defense of (\d+)/)) {
      effects.defense = parseInt(effectStr.match(/Add defense of (\d+)/)![1], 10);
    }
    
    // Gold effects
    if (effectStr.match(/\+(\d+) Gold/)) {
      effects.gold = parseInt(effectStr.match(/\+(\d+) Gold/)![1], 10);
    } else if (effectStr.match(/Add \+(\d+) gold/)) {
      effects.gold = parseInt(effectStr.match(/Add \+(\d+) gold/)![1], 10);
    }
    
    // Card draw effects
    if (effectStr.match(/\+(\d+) Cards?/)) {
      effects.draw = parseInt(effectStr.match(/\+(\d+) Cards?/)![1], 10);
    } else if (effectStr.match(/\+(\d+) Card Drawn/)) {
      effects.draw = parseInt(effectStr.match(/\+(\d+) Card Drawn/)![1], 10);
    }
    
    // Card play effects
    if (effectStr.match(/\+(\d+) card plays?/)) {
      effects.card_play = parseInt(effectStr.match(/\+(\d+) card plays?/)![1], 10);
    } else if (effectStr.match(/\+(\d+) Card Play/)) {
      effects.card_play = parseInt(effectStr.match(/\+(\d+) Card Play/)![1], 10);
    }
    
    // Buy effects
    if (effectStr.match(/\+(\d+) Buys?/)) {
      effects.buy = parseInt(effectStr.match(/\+(\d+) Buys?/)![1], 10);
    } else if (effectStr.match(/\+(\d+) Buy/)) {
      effects.buy = parseInt(effectStr.match(/\+(\d+) Buy/)![1], 10);
    }
    
    // Tech upgrade effects
    if (effectStr.match(/Upgrade to tech tier (\d+)/)) {
      effects.tech = parseInt(effectStr.match(/Upgrade to tech tier (\d+)/)![1], 10);
    }
    
    // Land benefit effects
    if (effectStr === 'Land Benefit') {
      effects.land_benefit = true;
    } else if (effectStr === 'Land Benefit x2') {
      effects.land_benefit = true;
      effects.land_benefit_double = true;
    }
    
    // Discard and draw effects
    if (effectStr.includes('Discard any number of cards') && effectStr.includes('Draw as many cards')) {
      effects.discard_draw = true;
      effects.special_effect = 'archives';
    }
    
    // Special effect: Missile Dome
    if (effectStr.includes('Defend +4 on two adjacent tiles')) {
      effects.special_effect = 'missile_dome';
    }
    
    // Special effect: Barricade - conditional on blue land
    if (effectStr.includes('If played on Blue land, Defend +2 to all adjacent grids')) {
      if (!effects.conditional_effect) {
        effects.conditional_effect = {
          condition: 'land_type',
          land_type: 'card',
          effects: { defense_adjacent: true, defense: 2 }
        };
      }
    }
    
    // Special effect: Stone Skin - all played tiles get +2 defense
    if (effectStr.includes('All tiles that had a card played on them') && effectStr.includes('get Defense +2')) {
      effects.defense_all_played = true;
      effects.special_effect = 'stone_skin';
    }
    
    // Special effect: Durable Defense - defense persists for multiple turns
    if (effectStr.includes('This defense carries over') && effectStr.includes('for two more turns')) {
      effects.defense_duration = 2;
      effects.special_effect = 'durable_defense';
    }
    
    // Conditional effects for land types
    if (effectStr.match(/If played on (Yellow|Blue|Red) land, (.+)/)) {
      const matches = effectStr.match(/If played on (Yellow|Blue|Red) land, (.+)/);
      if (matches) {
        const landColor = matches[1];
        const conditionalEffect = matches[2];
        let landType: LandType;
        
        // Convert color to land type
        switch (landColor) {
          case 'Yellow': landType = 'gold'; break;
          case 'Blue': landType = 'card'; break;
          case 'Red': landType = 'play'; break;
          default: landType = 'gold';
        }
        
        if (!effects.conditional_effect) {
          effects.conditional_effect = {
            condition: 'land_type',
            land_type: landType,
            effects: {}
          };
        }
        
        // Parse the conditional effect
        if (conditionalEffect.match(/\+(\d+) Gold/)) {
          effects.conditional_effect.effects.gold = parseInt(conditionalEffect.match(/\+(\d+) Gold/)![1], 10);
        } else if (conditionalEffect.match(/\+(\d+) Card Drawn/)) {
          effects.conditional_effect.effects.draw = parseInt(conditionalEffect.match(/\+(\d+) Card Drawn/)![1], 10);
        }
      }
    }
  });
  
  return effects;
};

const generateCardDescription = (name: string, effects: CardEffect, effectStrings: string[]): string => {
  // For tech upgrades, just return the effect text
  if (name.startsWith('Tech Upgrade')) {
    return effectStrings.filter(e => e).join('. ');
  }
  
  // For wound cards
  if (name === 'Wound') {
    return 'A wound that does nothing and takes up space in your hand';
  }
  
  // For normal cards, combine effect strings
  const cleanedEffects = effectStrings
    .filter(e => e && !e.toLowerCase().includes('note:'))
    .map(e => e.trim())
    .join('. ');
  
  return cleanedEffects || 'No effect';
};

// Create a new instance of a card with a unique ID
export const createCardInstance = (card: Card, index: number): Card => {
  return {
    ...card,
    id: `${card.name.toLowerCase().replace(/\s+/g, '-')}-${index}`
  };
};

// Create initial player deck according to game rules
export const createInitialDeck = (cards: Card[]): Card[] => {
  const initialDeck: Card[] = [];
  
  // Find the required card types
  const defend = cards.find(c => c.name === 'Defend');
  const copper = cards.find(c => c.name === 'Copper');
  const tilTheLand = cards.find(c => c.name === 'Til the Land');
  
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
export const createWoundCard = (cards: Card[], index: number): Card => {
  const woundCard = cards.find(c => c.name === 'Wound');
  if (!woundCard) {
    throw new Error('Wound card not found in card definitions');
  }
  return createCardInstance(woundCard, index);
};

export const shuffleDeck = <T>(deck: T[]): T[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const drawCards = (
  deck: Card[], 
  discard: Card[], 
  count: number
): { drawnCards: Card[], newDeck: Card[], newDiscard: Card[] } => {
  let currentDeck = [...deck];
  let currentDiscard = [...discard];
  const drawnCards: Card[] = [];
  
  for (let i = 0; i < count; i++) {
    if (currentDeck.length === 0) {
      // Shuffle discard pile to form new deck
      if (currentDiscard.length === 0) {
        break; // No more cards to draw
      }
      
      currentDeck = shuffleDeck(currentDiscard);
      currentDiscard = [];
    }
    
    // Draw the top card
    const drawnCard = currentDeck.shift();
    if (drawnCard) {
      drawnCards.push(drawnCard);
    }
  }
  
  return {
    drawnCards,
    newDeck: currentDeck,
    newDiscard: currentDiscard
  };
};