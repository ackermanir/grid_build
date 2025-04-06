# Grid Build Code Structure

## Project Overview
Grid Build is a deck-building game built with React and TypeScript, featuring a 3x3 grid-based play area, resource management, tech tier progression, and building mechanics. The game combines elements from Spirit Island and Dominion.

## Deployment and Version Management

### Automated Deployment Process
The project uses npm scripts to automate the deployment process:

```json
{
  "scripts": {
    "deploy:patch": "npm version patch && npm run deploy",
    "version": "git add -A src",
    "postversion": "git push && git push --tags",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

#### Deployment Steps
1. Run `npm run deploy:patch` to:
   - Increment the patch version (e.g., 0.1.0 → 0.1.1)
   - Stage and commit changes
   - Create a Git tag
   - Push changes and tags to GitHub
   - Build the project
   - Deploy to GitHub Pages

#### Version Bumping Options
- `npm version patch`: Small fixes (0.1.0 → 0.1.1)
- `npm version minor`: New features (0.1.0 → 0.2.0)
- `npm version major`: Breaking changes (0.1.0 → 1.0.0)

### Deployment Configuration
- The project is configured to deploy to GitHub Pages
- Homepage is set to: https://acker.github.io/grid_build
- Build output is served from the `build` directory
- Version information is displayed in the game UI

## Core Types and Interfaces

### Game State Types
Located in `src/types/index.ts`:

```typescript
// Basic game elements
type LandType = 'gold' | 'card' | 'play';
type CardType = 'Defense' | 'Gold' | 'Action' | 'Tech';
type BuildingType = 'Resource Depot' | 'Refinery' | 'Echo Chamber';

// Grid tile representation
interface Tile {
  landType: LandType;
  defense: number;
  damage: number;
  cardPlayed: Card | null;
  defenseHistory?: Array<{ defense: number, turnsRemaining: number }>;
  building?: BuildingType | null;
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
    cardPlays: number;
    cardDraw: number;
    gold: number;
  };
  buildingToPlace?: BuildingType | null;
  techTierJustReached?: number | null;
}
```

## Component Structure

### Main Components
1. `App.tsx`: Root component managing game state and logic
2. `GameBoard.tsx`: Renders the 3x3 grid and handles tile interactions (including building placement)
3. `HandArea.tsx`: Displays player's hand and card selection
4. `ShopArea.tsx`: Shows available cards for purchase
5. `PlayerInfo.tsx`: Displays player attributes and game status
6. `GameOver.tsx`: Shows victory/defeat screen
7. `TechUpgradeModal.tsx`: Displays information when a new tech tier is reached and prompts for building placement.
8. `VersionDisplay.tsx`: Shows current app version.

### Component Props Interfaces
```typescript
// GameBoard
interface GameBoardProps {
  grid: Tile[][];
  selectedCard: Card | null;
  onTileClick: (rowIndex: number, colIndex: number) => void;
  buildingToPlace?: BuildingType | null;
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

// TechUpgradeModal
interface TechUpgradeModalProps {
  techTier: number;
  building?: BuildingType | null;
  onClose: () => void;
}
```

## Utility Functions

### Game Logic (`src/utils/gameUtils.ts`)
- `createInitialGrid()`: Creates 3x3 grid with random land distribution
- `createInitialPlayerAttributes()`: Sets up starting player state
- `generatePendingAttacks()`: Determines enemy attacks based on round
- `applyDamageToGrid()`: Processes damage to grid tiles
- `resetGridForNewTurn()`: Resets grid state for new turn
- `applyLandBenefit()`: Processes land type benefits (including refinery and partial benefits)
- `applyCardEffectToTile()`: Applies card effects to grid tiles
- `applyStoneSkinEffect()`: Applies Stone Skin defense effect.
- `getAdjacentTiles()`: Gets adjacent tile coordinates.
- `checkGameOver()`: Checks victory/defeat conditions
- `initializeGameState()`: Sets up complete initial game state
- `generateShopCards()`: Creates the shop based on current tech tier.

### Card Utilities (`src/utils/cardUtils.ts`)
- `createCardInstance()`: Creates a unique instance of a card
- `createInitialDeck()`: Creates starting deck
- `shuffleDeck()`: Randomizes deck order
- `drawCards()`: Handles card drawing mechanics
- `upgradeBaseCards()`: Modifies base cards (Copper, Defend, Til the Land) upon reaching Tier 3.

## Data Management

### Card Definitions (`src/data/cards.ts`)
- Contains all card definitions as TypeScript objects
- Provides functions for card creation and management
- Handles initial deck setup and shop generation

## Game Flow

1. **Initialization**
   - Create 3x3 grid with random land types (no buildings initially).
   - Set up initial player deck and attributes (Tech Tier 1).
   - Initialize shop with Tier 1 cards.

2. **Turn Structure**
   - **Start of Turn:** Apply benefits from `Refinery` buildings.
   - Draw cards up to card draw limit.
   - Play cards based on card plays remaining.
   - Buy cards from shop.
   - End turn to face enemy attacks.

3. **Card Playing / Buying Tech Upgrades**
   - Select card from hand or purchase tech card from shop.
   - If tech upgrade occurs (Tier 2, 3, or 4):
     - Update player's `techTier`.
     - Set `techTierJustReached` state to trigger modal.
     - If Tier 2, 3, or 4, set `buildingToPlace` state (Resource Depot, Refinery, Echo Chamber).
     - If Tier 3, call `upgradeBaseCards` on hand/deck/discard and refresh shop (`generateShopCards(3)`).
     - Display `TechUpgradeModal`.
   - **Building Placement:**
     - After closing modal, player clicks an empty tile.
     - `handleCardPlacement` checks `buildingToPlace` state and updates the clicked `Tile`'s `building` property.
     - Clear `buildingToPlace` and `techTierJustReached` state.
   - **Card Placement:**
     - Place selected card on eligible grid tile.
     - Apply card effects (checking for `Resource Depot` bonus and `Echo Chamber` duplication).
     - Apply land benefits (if applicable).
     - Handle special effects (missile dome, archives duplication, gold rush, etc.).

4. **Enemy Phase**
   - Generate pending attacks based on round.
   - Apply damage to grid tiles.
   - Add wounds to player's discard pile if damage exceeds defense.

## State Management
- Uses React's `useState` for game state management (`gameState` in `App.tsx`).
- State updates are handled through immutable patterns, often using functional updates (`setGameState(prev => ...)`).
- Special states (`missileDomeSelection`, `cardSelectionMode`, `gameState.specialState` for Archives) are managed separately.
- Tech upgrades trigger state changes (`techTierJustReached`, `buildingToPlace`) to control UI flow (modal, placement mode).
- Partial land benefits and gold rush effects are tracked across card plays within a turn.

## Key Abstractions

1. **Grid System**
   - 3x3 grid with different land types (`LandType`).
   - Tiles (`Tile`) can hold cards, track defense/damage/history, and host buildings.
   - **Buildings (`BuildingType`):** Permanent tile modifiers (Resource Depot, Refinery, Echo Chamber) placed via tech upgrades, affecting card plays or providing start-of-turn benefits.

2. **Card System**
   - Flexible effect system (`CardEffect`) supporting various actions (gold, draw, defense, tech, etc.).
   - Conditional effects based on land types.
   - Special effects for unique card mechanics (Missile Dome, Archives, etc.), including handling duplication (Echo Chamber).
   - Base cards are upgraded automatically at Tier 3 (`upgradeBaseCards`).

3. **Resource Management**
   - Gold, Card Plays, Buys managed in `PlayerAttributes`.
   - **Tech Tier Progression:** Player advances tiers by playing/buying tech cards, unlocking new shop cards, base card upgrades (Tier 3), and buildings.
   - Partial benefits tracking for land effects.

4. **Combat System**
   - Enemy attacks scale with rounds (`generatePendingAttacks`).
   - Defense mechanics with persistent effects (`defenseHistory`).
   - Wound system affecting player's deck.

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