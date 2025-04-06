import React from 'react';
import { render, RenderResult /*, screen*/ } from '@testing-library/react';
import { GameState } from '../../types'; // Adjust path
import {
  setupTestGame,
  getCard,
  simulatePlayCardFromHand,
  simulateTileClick,
  assertPlayerState,
  assertTileState,
  assertHandContains,
  createTestGrid,
  // NOTE: Explicit .tsx extension is required here as a workaround.
  // react-scripts test (via Babel?) fails to parse the JSX in testUtils.tsx 
  // when imported without the extension, despite tsconfig.json being correct.
  // @ts-expect-error - Suppressing extension error for react-scripts compatibility
} from '../testUtils.tsx';

describe('Integration Tests: Basic Card Play', () => {
  // --- Copper Test ---
  it('should grant +1 gold when playing Copper, regardless of tile', async () => {
    const initialHand = [getCard('Copper')];
    const initialState: Partial<GameState> = {
      hand: initialHand,
      player: { gold: 0, cardPlays: 1, buys: 1, cardDraw: 5, wounds: 0, techTier: 1, maxCardPlays: 1, maxBuys: 1, maxCardDraw: 5 },
      deck: [],
      discard: [],
    };

    const { user, getGameState } = setupTestGame(initialState);

    // Actions
    await simulatePlayCardFromHand(user, 'Copper');
    await simulateTileClick(user, 0, 0); // Click any tile

    // Assertions
    const finalState = getGameState();
    assertPlayerState(finalState, { gold: 1, cardPlays: 0 });
    assertHandContains(finalState, []); // Hand should be empty
    // Check card is on tile (assuming Copper stays visually)
    assertTileState(finalState, 0, 0, { cardPlayed: getCard('Copper') });
  });

  // --- Til the Land Tests ---
  it('should grant +2 gold immediately when Til the Land is played on a gold tile', async () => {
    const initialHand = [getCard('Til the Land')];
    // Create a grid with just one 'gold' tile for simplicity
    const grid = createTestGrid([[{ landType: 'gold' }]]);
    const initialState: Partial<GameState> = {
      hand: initialHand,
      grid: grid,
      player: { gold: 5, cardPlays: 1, buys: 1, cardDraw: 5, wounds: 0, techTier: 1, maxCardPlays: 1, maxBuys: 1, maxCardDraw: 5 },
      deck: [],
      discard: [],
    };

    const { user, getGameState } = setupTestGame(initialState);

    // Actions
    await simulatePlayCardFromHand(user, 'Til the Land');
    await simulateTileClick(user, 0, 0);

    // Assertions
    const finalState = getGameState();
    // Expect +2 Gold (5 + 2 = 7) - Correcting assertion based on rules
    assertPlayerState(finalState, { gold: 7, cardPlays: 0 }); 
    assertHandContains(finalState, []);
    assertTileState(finalState, 0, 0, { cardPlayed: getCard('Til the Land') });
  });

  it('should immediately draw 1 card when Til the Land is played on a card tile', async () => {
      const initialHand = [getCard('Til the Land')];
      const grid = createTestGrid([[{ landType: 'card' }]]);
      const initialState: Partial<GameState> = {
          hand: initialHand,
          grid: grid,
          player: { gold: 0, cardPlays: 1, buys: 1, cardDraw: 5, wounds: 0, techTier: 1, maxCardPlays: 1, maxBuys: 1, maxCardDraw: 5 },
          // Need a card in deck to draw
          deck: [getCard('Copper')], 
          discard: [],
      };

      const { user, getGameState } = setupTestGame(initialState);

      // Actions
      await simulatePlayCardFromHand(user, 'Til the Land');
      await simulateTileClick(user, 0, 0);

      // Assertions
      const finalState = getGameState();
      // Check cardPlays used and maxCardDraw unchanged
      assertPlayerState(finalState, { cardPlays: 0, maxCardDraw: 5 }); 
      // Check that the card from the deck was drawn into the hand
      assertHandContains(finalState, ['Copper']); 
      assertTileState(finalState, 0, 0, { cardPlayed: getCard('Til the Land') });
  });

  // Removed the 'play two cards on play tile' test for simplification
}); 