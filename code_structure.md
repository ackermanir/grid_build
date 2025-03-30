# Grid Build Code Structure

## Project Overview
Grid Build is a deck-building game built with React and TypeScript, featuring a 3x3 grid-based play area, resource management, and tech tier progression. The game combines elements from Spirit Island and Dominion.

## Core Types and Interfaces

### Game State Types
Located in `src/types/index.ts`:

```typescript
// Basic game elements
type LandType = 'gold' | 'card' | 'play';
type CardType = 'Defense' | 'Gold' | 'Action' | 'Tech';

// Grid tile representation
interface Tile {
  landType: LandType;
  defense: number;
  damage: number;
  cardPlayed: Card | null;
  defenseHistory?: Array<{ defense: number, turnsRemaining: number }>;
}

// Card effects system
interface CardEffect {
  defense?: number;
  gold?: number;
  draw?: number;
  card_play?: number;
  buy?: number;
  tech?: number;
  land_benefit?: boolean;
  land_benefit_double?: boolean;
  discard_draw?: boolean;
  defense_adjacent?: boolean;
  defense_all_played?: boolean;
  defense_duration?: number;
  conditional_effect?: {
    condition: 'land_type';
    land_type?: LandType;
    effects: CardEffect;
  };
  special_effect?: 'missile_dome' | 'archives' | 'stone_skin' | 'durable_defense' | 'gold_rush';
}

// Card representation
interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  shopNumber: number;
  effects: CardEffect;
  description: string;
  emoji: string;
}

// Player attributes
interface PlayerAttributes {
  cardPlays: number;
  buys: number;
  gold: number;
  cardDraw: number;
  wounds: number;
  techTier: number;
  maxCardPlays: number;
  maxBuys: number;
  maxCardDraw: number;
}

// Complete game state
interface GameState {
  round: number;
  grid: Tile[][];
  hand: Card[];
  deck: Card[];
  discard: Card[];
  shop: Card[];
  player: PlayerAttributes;
  selectedCard: Card | null;
  gameOver: boolean;
  victory: boolean;
  pendingAttacks: {
    positions: [number, number][];
    damagePerAttack: number;
  };
  specialState?: {
    type: 'missile_dome' | 'archives';
    data: any;
  };
  goldRushEffects?: number;
  partialLandBenefits?: {
    card: number;
    gold: number;
    play: number;
  };
}
```

## Component Structure

### Main Components
1. `App.tsx`: Root component managing game state and logic
2. `GameBoard.tsx`: Renders the 3x3 grid and handles tile interactions
3. `HandArea.tsx`: Displays player's hand and card selection
4. `ShopArea.tsx`: Shows available cards for purchase
5. `PlayerInfo.tsx`: Displays player attributes and game status
6. `GameOver.tsx`: Shows victory/defeat screen

### Component Props Interfaces
```typescript
// GameBoard
interface GameBoardProps {
  grid: Tile[][];
  selectedCard: Card | null;
  onTileClick: (rowIndex: number, colIndex: number) => void;
  missileDomeSelection?: {
    tilesSelected: [number, number][];
    tilesNeeded: number;
  } | null;
  pendingAttacks?: {
    positions: [number, number][];
    damagePerAttack: number;
  };
}

// HandArea
interface HandAreaProps {
  hand: Card[];
  selectedCard: Card | null;
  onCardSelect: (card: Card) => void;
  cardPlays: number;
  selectionMode?: 'play' | 'discard' | null;
  selectedForDiscard?: Card[];
}

// ShopArea
interface ShopAreaProps {
  shop: Card[];
  gold: number;
  buys: number;
  onBuyCard: (card: Card) => void;
}

// PlayerInfo
interface PlayerInfoProps {
  playerAttributes: PlayerAttributes;
  round: number;
}

// GameOver
interface GameOverProps {
  victory: boolean;
  onNewGame: () => void;
}
```

## Utility Functions

### Game Logic (`src/utils/gameUtils.ts`)
- `createInitialGrid()`: Creates 3x3 grid with random land distribution
- `createInitialPlayerAttributes()`: Sets up starting player state
- `generatePendingAttacks()`: Determines enemy attacks based on round
- `applyDamageToGrid()`: Processes damage to grid tiles
- `resetGridForNewTurn()`: Resets grid state for new turn
- `applyLandBenefit()`: Processes land type benefits (including partial benefits)
- `applyCardEffectToTile()`: Applies card effects to grid tiles
- `checkGameOver()`: Checks victory/defeat conditions
- `initializeGameState()`: Sets up complete initial game state

### Card Utilities (`src/utils/cardUtils.ts`)
- `parseCSVCards()`: Parses card definitions from CSV
- `createInitialDeck()`: Creates starting deck
- `shuffleDeck()`: Randomizes deck order
- `drawCards()`: Handles card drawing mechanics

## Data Management

### Card Definitions (`src/data/cards.ts`)
- Contains all card definitions as TypeScript objects
- Provides functions for card creation and management
- Handles initial deck setup and shop generation

## Game Flow

1. **Initialization**
   - Create 3x3 grid with random land types
   - Set up initial player deck and attributes
   - Initialize shop with available cards

2. **Turn Structure**
   - Draw cards up to card draw limit
   - Play cards based on card plays remaining
   - Buy cards from shop
   - End turn to face enemy attacks

3. **Card Playing**
   - Select card from hand
   - Place on eligible grid tile
   - Apply card effects and land benefits
   - Handle special effects (missile dome, archives, gold rush, etc.)

4. **Enemy Phase**
   - Generate pending attacks based on round
   - Apply damage to grid tiles
   - Add wounds to player's deck if damage exceeds defense

## State Management
- Uses React's useState for game state management
- State updates are handled through immutable patterns
- Special states (missile dome, archives) are managed separately
- Partial land benefits are tracked between card plays
- Gold rush effects are tracked for next turn

## Key Abstractions

1. **Grid System**
   - 3x3 grid with different land types
   - Tiles can hold cards and track defense/damage
   - Supports persistent effects through defense history

2. **Card System**
   - Flexible effect system supporting various card types
   - Conditional effects based on land types
   - Special effects for unique card mechanics
   - Partial benefits system for land effects

3. **Resource Management**
   - Gold for purchasing cards
   - Card plays for playing cards
   - Buys for purchasing cards
   - Tech tier progression
   - Partial benefits tracking

4. **Combat System**
   - Enemy attacks scale with rounds
   - Defense mechanics with persistent effects
   - Wound system affecting player's deck

## Best Practices

1. **Type Safety**
   - Strong TypeScript typing throughout
   - Clear interface definitions
   - Proper type guards and checks

2. **State Management**
   - Immutable state updates
   - Clear state transitions
   - Separation of concerns
   - Proper tracking of partial benefits

3. **Component Design**
   - Presentational components
   - Clear prop interfaces
   - Reusable utility functions

4. **Game Logic**
   - Centralized game rules
   - Clear victory/defeat conditions
   - Modular effect system
   - Consistent benefit application 