import { Card, CardType, CardEffect, LandType } from '../types';

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