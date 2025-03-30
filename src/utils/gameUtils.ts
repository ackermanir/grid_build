import { Card, GameState, Tile, LandType, PlayerAttributes } from '../types';
import { getAllCards, createInitialDeck, createWoundCard, getShopCards } from '../data/cards';
import { shuffleDeck, drawCards as drawCardsUtil } from './cardUtils';

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
        cardPlayed: null,
        defenseHistory: []
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
  return drawCardsUtil(deck, discard, count);
};

// Generate shop cards based on tech tier
export const generateShopCards = (techTier: number): Card[] => {
  const availableCards = getShopCards(techTier);
  
  // Prepare selected cards array
  const selectedCards: Card[] = [];
  
  // First, add all tech upgrade cards within the next tier
  const techCards = availableCards.filter(card => 
    card.type === 'Tech' && 
    card.effects.tech && 
    card.effects.tech === techTier + 1
  );
  
  techCards.forEach(card => {
    selectedCards.push({...card, id: `shop-${card.name.toLowerCase().replace(/\s+/g, '-')}`});
  });
  
  // Then add ALL regular cards (not just a subset)
  const regularCards = availableCards.filter(card => card.type !== 'Tech');
  
  // Add all regular cards with unique IDs
  regularCards.forEach((card, i) => {
    selectedCards.push({...card, id: `shop-${card.name.toLowerCase().replace(/\s+/g, '-')}-${i}`});
  });
  
  return selectedCards;
};

// Generate pending enemy attacks for the current round
export const generatePendingAttacks = (round: number): {positions: [number, number][], damagePerAttack: number} => {
  // Determine attack pattern based on round
  let attackCount = 0;
  let damagePerAttack = 0;
  
  if (round < 3) {
    // No attacks in rounds 1-2
    return { positions: [], damagePerAttack: 0 };
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
  
  // Select the positions to attack
  const attackPositions = shuffledPositions.slice(0, Math.min(attackCount, positions.length));
  
  return { positions: attackPositions, damagePerAttack };
};

// Apply damage to grid tiles
export const applyDamageToGrid = (
  grid: Tile[][], 
  pendingAttacks: {positions: [number, number][], damagePerAttack: number}
): { grid: Tile[][], woundCount: number } => {
  const newGrid = JSON.parse(JSON.stringify(grid)) as Tile[][];
  let woundCount = 0;
  
  // Apply damage to the attack positions
  for (const [row, col] of pendingAttacks.positions) {
    const tile = newGrid[row][col];
    
    // Apply damage to the tile
    tile.damage = pendingAttacks.damagePerAttack;
    
    // Calculate total defense including history
    let totalDefense = tile.defense;
    if (tile.defenseHistory && tile.defenseHistory.length > 0) {
      totalDefense += tile.defenseHistory.reduce((sum, item) => sum + item.defense, 0);
    }
    
    // If damage exceeds defense, add a wound
    if (tile.damage > totalDefense) {
      woundCount++;
    }
  }
  
  return { grid: newGrid, woundCount };
};

// Get adjacent tiles (including diagonals)
export const getAdjacentTiles = (
  grid: Tile[][],
  rowIndex: number,
  colIndex: number
): [number, number][] => {
  const adjacentPositions: [number, number][] = [];
  
  for (let r = Math.max(0, rowIndex - 1); r <= Math.min(2, rowIndex + 1); r++) {
    for (let c = Math.max(0, colIndex - 1); c <= Math.min(2, colIndex + 1); c++) {
      // Exclude the center tile (the one we're checking adjacency for)
      if (r !== rowIndex || c !== colIndex) {
        adjacentPositions.push([r, c]);
      }
    }
  }
  
  return adjacentPositions;
};

// Reset grid for new turn
export const resetGridForNewTurn = (grid: Tile[][]): Tile[][] => {
  return grid.map(row => 
    row.map(tile => {
      const newTile = {
        ...tile,
        defense: 0,
        damage: 0,
        cardPlayed: null
      };
      
      // Process defense history and decrement turn counters
      if (tile.defenseHistory && tile.defenseHistory.length > 0) {
        newTile.defenseHistory = tile.defenseHistory
          .map(item => ({
            defense: item.defense,
            turnsRemaining: item.turnsRemaining - 1
          }))
          .filter(item => item.turnsRemaining > 0);
      } else {
        newTile.defenseHistory = [];
      }
      
      return newTile;
    })
  );
};

// Apply land benefit based on land type
export const applyLandBenefit = (
  landType: LandType, 
  playerAttributes: PlayerAttributes,
  isDouble: boolean = false,
  partialBenefits?: {
    cardPlays: number;
    cardDraw: number;
    gold: number;
  }
): { 
  playerAttributes: PlayerAttributes;
  partialBenefits: {
    cardPlays: number;
    cardDraw: number;
    gold: number;
  };
} => {
  const newAttributes = { ...playerAttributes };
  const multiplier = isDouble ? 2 : 1;
  const newPartialBenefits = partialBenefits || {
    cardPlays: 0,
    cardDraw: 0,
    gold: 0
  };
  
  switch (landType) {
    case 'gold':
      // +2 gold
      newAttributes.gold += 2 * multiplier;
      break;
    case 'card':
      // +1 card draw
      newAttributes.cardDraw += 1 * multiplier;
      break;
    case 'play':
      // Add 0.5 to each partial benefit
      newPartialBenefits.cardPlays += 0.5 * multiplier;
      newPartialBenefits.cardDraw += 0.5 * multiplier;
      newPartialBenefits.gold += 0.5 * multiplier;
      
      // Apply benefits when they reach whole numbers
      if (newPartialBenefits.cardPlays >= 1) {
        newAttributes.cardPlays += Math.floor(newPartialBenefits.cardPlays);
        newPartialBenefits.cardPlays -= Math.floor(newPartialBenefits.cardPlays);
      }
      if (newPartialBenefits.cardDraw >= 1) {
        newAttributes.cardDraw += Math.floor(newPartialBenefits.cardDraw);
        newPartialBenefits.cardDraw -= Math.floor(newPartialBenefits.cardDraw);
      }
      if (newPartialBenefits.gold >= 1) {
        newAttributes.gold += Math.floor(newPartialBenefits.gold);
        newPartialBenefits.gold -= Math.floor(newPartialBenefits.gold);
      }
      break;
  }
  
  return { playerAttributes: newAttributes, partialBenefits: newPartialBenefits };
};

// Apply card effect to a tile
export const applyCardEffectToTile = (
  grid: Tile[][],
  rowIndex: number,
  colIndex: number,
  card: Card,
  tileMap: Map<string, boolean> = new Map() // Tracks tiles that already have cards played on them
): { grid: Tile[][], tilesModified: [number, number][] } => {
  const newGrid = JSON.parse(JSON.stringify(grid)) as Tile[][];
  const tile = newGrid[rowIndex][colIndex];
  const tilesModified: [number, number][] = [[rowIndex, colIndex]];
  
  // Mark this tile as having a card played on it
  tileMap.set(`${rowIndex},${colIndex}`, true);
  
  // Add the card to the tile
  tile.cardPlayed = card;
  
  // Apply defense effects
  if (card.effects.defense) {
    tile.defense += card.effects.defense;
  }
  
  // Apply special effects
  if (card.effects.special_effect === 'durable_defense') {
    if (!tile.defenseHistory) {
      tile.defenseHistory = [];
    }
    
    // Add defense that persists for additional turns
    if (card.effects.defense && card.effects.defense_duration) {
      tile.defenseHistory.push({
        defense: card.effects.defense,
        turnsRemaining: card.effects.defense_duration
      });
    }
  }
  
  // Apply conditional effects based on land type
  if (card.effects.conditional_effect && 
      card.effects.conditional_effect.condition === 'land_type' &&
      card.effects.conditional_effect.land_type === tile.landType) {
    
    // Apply adjacent defense effect
    if (card.effects.conditional_effect.effects.defense_adjacent) {
      const adjacentPositions = getAdjacentTiles(newGrid, rowIndex, colIndex);
      
      adjacentPositions.forEach(([r, c]) => {
        newGrid[r][c].defense += (card.effects.conditional_effect?.effects.defense || 0);
        tilesModified.push([r, c]);
      });
    }
    
    // Apply other conditional effects
    if (card.effects.conditional_effect.effects.gold) {
      // This will be handled in the App component
    }
    
    if (card.effects.conditional_effect.effects.draw) {
      // This will be handled in the App component
    }
  }
  
  return { grid: newGrid, tilesModified };
};

// Apply stone skin effect (all played tiles get +2 defense)
export const applyStoneSkinEffect = (
  grid: Tile[][],
  tileMap: Map<string, boolean>
): Tile[][] => {
  const newGrid = JSON.parse(JSON.stringify(grid)) as Tile[][];
  
  // Iterate through all tiles that have had cards played on them
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (tileMap.get(`${row},${col}`)) {
        newGrid[row][col].defense += 2;
      }
    }
  }
  
  return newGrid;
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
  const shuffledDeck = shuffleDeck(initialDeck);
  
  // Draw initial hand
  const { drawnCards: initialHand, newDeck } = drawCards(shuffledDeck, [], 5);
  
  // Generate initial pending attacks (round 1 won't have any attacks)
  const pendingAttacks = generatePendingAttacks(1);
  
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
    victory: false,
    pendingAttacks
  };
};