import { Card, CardType } from '../types';

export const parseCardEffect = (effectString: string): Card['effects'] => {
  const effects: Card['effects'] = {};
  
  if (!effectString) return effects;
  
  const effectParts = effectString.split('|');
  
  effectParts.forEach(part => {
    const [key, valueStr] = part.split(':');
    
    if (key === 'land_benefit' && valueStr === 'true') {
      effects.land_benefit = true;
    } else if (['defense', 'gold', 'draw', 'card_play', 'buy', 'tech'].includes(key)) {
      const numValue = parseInt(valueStr, 10);
      (effects as any)[key] = numValue;
    }
  });
  
  return effects;
};

export const parseCSVCards = (csvContent: string): Card[] => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    const card: Partial<Card> = { id: `card-${index}` };
    
    headers.forEach((header, idx) => {
      const value = values[idx];
      
      switch (header) {
        case 'name':
          card.name = value;
          break;
        case 'type':
          card.type = value as CardType;
          break;
        case 'cost':
          card.cost = parseInt(value, 10);
          break;
        case 'effect':
          card.effects = parseCardEffect(value);
          break;
        case 'description':
          card.description = value;
          break;
        case 'emoji':
          card.emoji = value;
          break;
      }
    });
    
    return card as Card;
  });
};

export const createInitialDeck = (cards: Card[]): Card[] => {
  const initialDeck: Card[] = [];
  
  // Find the required card types
  const defend = cards.find(c => c.name === 'Defend');
  const copper = cards.find(c => c.name === 'Copper');
  const tilTheLand = cards.find(c => c.name === 'Til the Land');
  
  if (defend && copper && tilTheLand) {
    // Add 4 Defend cards
    for (let i = 0; i < 4; i++) {
      initialDeck.push({...defend, id: `defend-${i}`});
    }
    
    // Add 4 Copper cards
    for (let i = 0; i < 4; i++) {
      initialDeck.push({...copper, id: `copper-${i}`});
    }
    
    // Add 2 Til the Land cards
    for (let i = 0; i < 2; i++) {
      initialDeck.push({...tilTheLand, id: `til-the-land-${i}`});
    }
  }
  
  return initialDeck;
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