import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App'; // Assuming App is the main component
import { GameState, Card, Tile /*, LandType*/ } from '../types'; // Remove unused LandType
import { initializeGameState } from '../utils/gameUtils'; // Adjust path as needed
import { CARDS } from '../data/cards'; // Fix import case: CARDS
import { createCardInstance } from '../utils/cardUtils'; // Adjust path

// Helper to create a specific card instance for test setup
export const getCard = (name: string): Card => {
  const cardData = CARDS.find((c: Card) => c.name === name);
  if (!cardData) {
    throw new Error(`Card with name "${name}" not found in card data.`);
  }
  return createCardInstance(cardData, Date.now() + Math.random());
};

// Helper to create a minimal grid for testing
export const createTestGrid = (tiles: Partial<Tile>[][] = [
    [{ landType: 'gold' }, { landType: 'card' }, { landType: 'play' }],
    [{ landType: 'card' }, { landType: 'play' }, { landType: 'gold' }],
    [{ landType: 'play' }, { landType: 'gold' }, { landType: 'card' }],
]): Tile[][] => {
  return tiles.map(row =>
    row.map(partialTile => ({
      landType: partialTile.landType ?? 'gold',
      defense: partialTile.defense ?? 0,
      damage: partialTile.damage ?? 0,
      cardPlayed: partialTile.cardPlayed ?? null,
      defenseHistory: partialTile.defenseHistory ?? [],
      building: partialTile.building ?? null,
    }))
  );
};


// This function sets up the test environment
// NOTE: It relies on a modification in App.tsx to expose state for testing
export const setupTestGame = (initialStateOverrides: Partial<GameState> = {}): {
  user: ReturnType<typeof userEvent.setup>;
  getGameState: () => GameState;
  rerenderWithState: (newStateOverrides: Partial<GameState>) => void;
} & RenderResult => {
  const user = userEvent.setup();
  let currentGameState: GameState | null = null;

  // Function for App.tsx to call on state changes during tests
  const handleStateUpdateForTest = (newState: GameState) => {
    currentGameState = newState;
  };

  // Create the initial state, merging overrides
  const baseState = initializeGameState();
  // Start with base state
  const initialState = { ...baseState };

  // Deep merge player attributes if provided
  if (initialStateOverrides.player) {
      initialState.player = { ...baseState.player, ...initialStateOverrides.player };
  }

  // Apply other top-level overrides directly
  // Grid: Use override, otherwise create a default test grid
  initialState.grid = initialStateOverrides.grid ? initialStateOverrides.grid : createTestGrid();
  initialState.hand = initialStateOverrides.hand ?? baseState.hand;
  initialState.deck = initialStateOverrides.deck ?? baseState.deck;
  initialState.discard = initialStateOverrides.discard ?? baseState.discard;
  initialState.shop = initialStateOverrides.shop ?? baseState.shop;
  initialState.round = initialStateOverrides.round ?? baseState.round;
  initialState.selectedCard = initialStateOverrides.selectedCard ?? baseState.selectedCard;
  initialState.gameOver = initialStateOverrides.gameOver ?? baseState.gameOver;
  initialState.victory = initialStateOverrides.victory ?? baseState.victory;
  initialState.pendingAttacks = initialStateOverrides.pendingAttacks ?? baseState.pendingAttacks;
  // Add any other top-level GameState properties here...


  // Render the App component, passing the initial state and the update handler
  // **IMPORTANT**: Requires modification in App.tsx to accept these props.
  const renderResult = render(
    <App
      initialTestState={initialState as any}
      onStateUpdateForTest={handleStateUpdateForTest}
    />
  );

  // Initialize currentGameState with the potentially modified initial state
  currentGameState = initialState;

  const getGameState = (): GameState => {
    if (!currentGameState) {
      throw new Error("GameState not available. Ensure App calls onStateUpdateForTest properly.");
    }
    // Return a deep copy to prevent accidental mutation in tests
    return JSON.parse(JSON.stringify(currentGameState));
  };

  // Function to re-render with potentially new state (less common)
   const rerenderWithState = (newStateOverrides: Partial<GameState>) => {
     // This needs a more robust deep merge
     const newState = JSON.parse(JSON.stringify({ ...initialState, ...newStateOverrides }));
      if (newStateOverrides.player) {
          newState.player = { ...initialState.player, ...newStateOverrides.player };
      }
     // ... potentially more merging needed ...
      renderResult.rerender(
          <App
              initialTestState={newState}
              onStateUpdateForTest={handleStateUpdateForTest}
          />
      );
      currentGameState = newState; // Update the state tracker
   };


  return {
    ...renderResult,
    user,
    getGameState,
    rerenderWithState,
  };
};

// --- Simulation Helpers ---

// Clicks a card in the player's hand
export const simulatePlayCardFromHand = async (
    user: ReturnType<typeof userEvent.setup>,
    cardName: string
  ) => {
    // Use data-testid based on card name
    // Find *all* matching cards and click the first one
    const cardElements = screen.getAllByTestId(`hand-card-${cardName}`);
    if (cardElements.length > 0) {
        await user.click(cardElements[0]); // Click the first match
    } else {
        throw new Error(`Card with name "${cardName}" not found in hand.`);
    }
};

// Clicks a specific grid tile
export const simulateTileClick = async (
    user: ReturnType<typeof userEvent.setup>,
    rowIndex: number,
    colIndex: number
  ) => {
    // Use data-testid added to Tile component
    const tileElement = screen.getByTestId(`tile-${rowIndex}-${colIndex}`);
    await user.click(tileElement);
};

// Clicks the End Turn button
export const simulateEndTurn = async (user: ReturnType<typeof userEvent.setup>) => {
    // Find by role and text content (adjust if button text varies)
    const endTurnButton = screen.getByRole('button', { name: /end turn/i });
    await user.click(endTurnButton);
};


// --- Assertion Helpers --- //

// Checks specific parts of the player state
export const assertPlayerState = (currentState: GameState, expected: Partial<GameState['player']>) => {
  Object.entries(expected).forEach(([key, value]) => {
    expect(currentState.player[key as keyof GameState['player']]).toBe(value);
  });
};

// Checks properties of a specific tile
export const assertTileState = (currentState: GameState, rowIndex: number, colIndex: number, expected: Partial<Tile>) => {
   const tile = currentState.grid[rowIndex]?.[colIndex];
   expect(tile).toBeDefined(); // Ensure tile exists
   Object.entries(expected).forEach(([key, value]) => {
       if (key === 'cardPlayed') {
           // Compare card names if checking cardPlayed (null check included)
           expect(tile.cardPlayed?.name).toBe((value as Card)?.name);
       } else {
         // Use toEqual for potential objects/arrays like defenseHistory
         expect(tile[key as keyof Tile]).toEqual(value);
       }
   });
};

// Checks the contents of the player's hand (by card name)
export const assertHandContains = (currentState: GameState, expectedCardNames: string[]) => {
    const currentHandNames = currentState.hand.map(card => card.name).sort();
    expect(currentHandNames).toEqual([...expectedCardNames].sort()); // Compare sorted arrays
}; 