import { Card } from '../types';
import { parseCSVCards, createCardInstance } from '../utils/cardUtils';
import fs from 'fs';
import path from 'path';

let CARDS: Card[] = [];

// Read cards from CSV file
try {
  // We'll load this client-side in the React component
  // This is just a placeholder for when code is imported
  CARDS = [];
} catch (error) {
  console.error('Error loading cards from CSV file:', error);
}

// Function to load cards - will be called from App component
export const loadCards = (csvContent: string): Card[] => {
  CARDS = parseCSVCards(csvContent);
  return CARDS;
};

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
    case 1: maxCost = 3; break;
    case 2: maxCost = 5; break;
    case 3: maxCost = 7; break;
    case 4: maxCost = 9; break;
    case 5: maxCost = Infinity; break;
    default: maxCost = 3;
  }
  
  const regularCards = CARDS.filter(c => 
    c.shopNumber === 5 && 
    c.cost <= maxCost
  );
  
  return [...techCards, ...regularCards];
};