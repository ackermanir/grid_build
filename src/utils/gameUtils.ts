import { Card, GameState, Tile, LandType, PlayerAttributes } from '../types';
import { CARDS, createInitialDeck, createWoundCard } from '../data/cards';

// Shuffle an array using Fisher-Yates algorithm
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Draw cards from deck, reshuffling discard if needed
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
      
      currentDeck = shuffleArray(currentDiscard);
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

// Create initial 3x3 grid with random land distribution
export const createInitialGrid = (): Tile[][] => {
  // Create land distribution: 3 of each type
  const landTypes: LandType[] = [
    'gold', 'gold', 'gold',
    'card', 'card', 'card',
    'play', 'play', 'play'
  ];
  
  // Shuffle the land types
  const shuffledLandTypes = shuffleArray(landTypes);
  
  // Create 3x3 grid
  const grid: Tile[][] = [];
  let landIndex = 0;
  
  for (let row = 0; row < 3; row++) {
    const gridRow: Tile[] = [];
    
    for (let col = 0; col < 3; col++) {
      gridRow.push({
        landType: shuffledLandTypes[landIndex++],
        defense: 0,
        damage: 0,
        cardPlayed: null
      });
    }
    
    grid.push(gridRow);
  }
  
  return grid;
};

// Create initial player attributes
export const createInitialPlayerAttributes = (): PlayerAttributes => {
  return {
    cardPlays: 4,
    buys: 1,
    gold: 0,
    cardDraw: 5,
    wounds: 0,
    techTier: 1,
    maxCardPlays: 4, // Starting values for the turn
    maxBuys: 1,
    maxCardDraw: 5
  };
};

// Generate shop cards based on tech tier
export const generateShopCards = (techTier: number): Card[] => {
  // Filter cards by cost tier
  // Tier 1: 0-3 cost
  // Tier 2: 0-5 cost
  // Tier 3: 0-7 cost
  // Tier 4: 0-9 cost
  // Tier 5: All cards
  
  let maxCost = 3;
  
  switch (techTier) {
    case 1: maxCost = 3; break;
    case 2: maxCost = 5; break;
    case 3: maxCost = 7; break;
    case 4: maxCost = 9; break;
    case 5: maxCost = Infinity; break;
    default: maxCost = 3;
  }
  
  const availableCards = CARDS.filter(card => card.cost <= maxCost);
  
  // Randomly select 5 cards
  const shuffled = shuffleArray(availableCards);
  return shuffled.slice(0, 5);
};

// Apply damage to grid tiles
export const applyDamageToGrid = (
  grid: Tile[][], 
  round: number
): { grid: Tile[][], woundCount: number } => {
  const newGrid = JSON.parse(JSON.stringify(grid)) as Tile[][];
  let woundCount = 0;
  
  // Determine attack pattern based on round
  let attackCount = 0;
  let damagePerAttack = 0;
  
  if (round < 3) {
    // No attacks in rounds 1-2
    return { grid: newGrid, woundCount: 0 };
  } else if (round >= 3 && round <= 7) {
    // Attack 1-3 random tiles with 2 damage each
    attackCount = Math.floor(Math.random() * 3) + 1; // 1-3
    damagePerAttack = 2;
  } else if (round >= 8 && round <= 12) {
    // Attack 3-5 random tiles with 2 damage each
    attackCount = Math.floor(Math.random() * 3) + 3; // 3-5
    damagePerAttack = 2;
  } else {
    // Attack 5 random tiles with 4 damage each
    attackCount = 5;
    damagePerAttack = 4;
  }
  
  // Get all tile positions
  const positions: [number, number][] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      positions.push([row, col]);
    }
  }
  
  // Shuffle positions to get random attack order
  const shuffledPositions = shuffleArray(positions);
  
  // Apply damage to the first 'attackCount' positions
  for (let i = 0; i < Math.min(attackCount, positions.length); i++) {
    const [row, col] = shuffledPositions[i];
    const tile = newGrid[row][col];
    
    // Apply damage to the tile
    tile.damage = damagePerAttack;
    
    // If damage exceeds defense, add a wound
    if (tile.damage > tile.defense) {
      woundCount++;
    }
  }
  
  return { grid: newGrid, woundCount };
};

// Reset grid for new turn
export const resetGridForNewTurn = (grid: Tile[][]): Tile[][] => {
  return grid.map(row => 
    row.map(tile => ({
      ...tile,
      defense: 0,
      damage: 0,
      cardPlayed: null
    }))
  );
};

// Apply land benefit based on land type
export const applyLandBenefit = (
  landType: LandType, 
  playerAttributes: PlayerAttributes
): PlayerAttributes => {
  const newAttributes = { ...playerAttributes };
  
  switch (landType) {
    case 'gold':
      // +2 gold
      newAttributes.gold += 2;
      break;
    case 'card':
      // Draw 1 card
      // (drawing will be handled separately)
      break;
    case 'play':
      // +0.5 card play (add 1 card play every two benefits)
      // We'll track partial card plays in a separate game state
      newAttributes.cardPlays += 0.5;
      if (newAttributes.cardPlays % 1 === 0) {
        // Round down if needed
        newAttributes.cardPlays = Math.floor(newAttributes.cardPlays);
      }
      break;
  }
  
  return newAttributes;
};

// Check for game over conditions
export const checkGameOver = (gameState: GameState): { gameOver: boolean, victory: boolean } => {
  // Victory: Reach Tech tier 5
  if (gameState.player.techTier >= 5) {
    return { gameOver: true, victory: true };
  }
  
  // Defeat: 6+ wounds in deck
  if (gameState.player.wounds >= 6) {
    return { gameOver: true, victory: false };
  }
  
  return { gameOver: false, victory: false };
};

// Initialize the game state
export const initializeGameState = (): GameState => {
  const initialDeck = createInitialDeck();
  const shuffledDeck = shuffleArray(initialDeck);
  
  // Draw initial hand
  const { drawnCards: initialHand, newDeck } = drawCards(shuffledDeck, [], 5);
  
  return {
    round: 1,
    grid: createInitialGrid(),
    hand: initialHand,
    deck: newDeck,
    discard: [],
    shop: generateShopCards(1),
    player: createInitialPlayerAttributes(),
    selectedCard: null,
    gameOver: false,
    victory: false
  };
};