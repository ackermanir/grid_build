import React, { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { PlayerInfo } from './components/PlayerInfo';
import { ShopArea } from './components/ShopArea';
import { HandArea } from './components/HandArea';
import { GameOver } from './components/GameOver';
import { 
  initializeGameState, 
  drawCards, 
  checkGameOver, 
  resetGridForNewTurn, 
  applyDamageToGrid, 
  generateShopCards,
  applyLandBenefit,
  applyCardEffectToTile,
  applyStoneSkinEffect,
  getAdjacentTiles,
  generatePendingAttacks
} from './utils/gameUtils';
import { createWoundCard, getAllCards } from './data/cards';
import { shuffleDeck } from './utils/cardUtils';
import { GameState, Card, Tile } from './types';
import './App.css';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [cardSelectionMode, setCardSelectionMode] = useState<'play' | 'discard' | null>(null);
  const [missileDomeSelection, setMissileDomeSelection] = useState<{
    tilesSelected: [number, number][];
    tilesNeeded: number;
  } | null>(null);

  // Initialize game
  useEffect(() => {
    // Initialize with cards from our hardcoded set
    const initialState = initializeGameState();
    setGameState(initialState);
  }, []);

  if (!gameState) {
    return <div className="loading">Loading game data...</div>;
  }

  // Handle card selection from hand
  const handleCardSelect = (card: Card) => {
    if (missileDomeSelection) {
      // If in missile dome selection mode, ignore card selection
      return;
    }
    
    if (cardSelectionMode === 'discard') {
      // In discard mode (for Archives card)
      const discardedCards = gameState.specialState?.type === 'archives' 
        ? gameState.specialState.data.discardedCards || []
        : [];

      // Toggle card selection for discard
      if (discardedCards.some((c: Card) => c.id === card.id)) {
        // Remove from discard selection
        const newDiscardedCards = discardedCards.filter((c: Card) => c.id !== card.id);
        
        setGameState(prev => ({
          ...prev!,
          specialState: {
            type: 'archives',
            data: {
              ...prev!.specialState!.data,
              discardedCards: newDiscardedCards
            }
          }
        }));
      } else {
        // Add to discard selection
        setGameState(prev => ({
          ...prev!,
          specialState: {
            type: 'archives',
            data: {
              ...prev!.specialState!.data,
              discardedCards: [...discardedCards, card]
            }
          }
        }));
      }
    } else {
      // Regular card selection mode
      setGameState(prev => ({
        ...prev!,
        selectedCard: prev!.selectedCard?.id === card.id ? null : card
      }));
    }
  };

  // Handle card placement on grid
  const handleCardPlacement = (rowIndex: number, colIndex: number) => {
    // Handle missile dome selection mode
    if (missileDomeSelection) {
      if (missileDomeSelection.tilesSelected.length < missileDomeSelection.tilesNeeded) {
        // Add this tile to missile dome selection if not already selected
        if (!missileDomeSelection.tilesSelected.some(([r, c]) => r === rowIndex && c === colIndex)) {
          const newSelection = {
            tilesSelected: [...missileDomeSelection.tilesSelected, [rowIndex, colIndex] as [number, number]],
            tilesNeeded: missileDomeSelection.tilesNeeded
          };
          
          setMissileDomeSelection(newSelection);
          
          // If we've selected all needed tiles, apply the defense
          if (newSelection.tilesSelected.length === newSelection.tilesNeeded) {
            const newGrid = JSON.parse(JSON.stringify(gameState.grid)) as Tile[][];
            
            // Apply defense to selected tiles
            newSelection.tilesSelected.forEach(([r, c]) => {
              newGrid[r][c].defense += 4; // Missile dome provides +4 defense
            });
            
            // Finish the missile dome action
            setTimeout(() => {
              setMissileDomeSelection(null);
              setGameState(prev => ({
                ...prev!,
                grid: newGrid
              }));
            }, 500);
          }
        }
      }
      return;
    }
    
    if (!gameState.selectedCard) return;
    
    // Check if a card has already been played on this tile
    if (gameState.grid[rowIndex][colIndex].cardPlayed) return;
    
    // Check if player has enough card plays
    if (gameState.player.cardPlays <= 0) return;
    
    const card = gameState.selectedCard;
    
    // Track tiles that have cards played on them in this turn
    const tileMap = new Map<string, boolean>();
    
    // Create a deep copy of the grid
    let newGrid = JSON.parse(JSON.stringify(gameState.grid)) as Tile[][];
    
    // Apply the basic card effect to the tile
    const { grid: updatedGrid, tilesModified } = applyCardEffectToTile(
      newGrid, 
      rowIndex, 
      colIndex, 
      card,
      tileMap
    );
    
    newGrid = updatedGrid;
    
    // Calculate effects from the card
    let newPlayerState = { ...gameState.player };
    
    // Decrease card plays
    newPlayerState.cardPlays -= 1;
    
    // Apply card effects
    if (card.effects.gold) {
      newPlayerState.gold += card.effects.gold;
    }
    
    if (card.effects.buy) {
      newPlayerState.buys += card.effects.buy;
    }
    
    if (card.effects.card_play) {
      newPlayerState.cardPlays += card.effects.card_play;
    }
    
    if (card.effects.tech) {
      newPlayerState.techTier = card.effects.tech;
      if (newPlayerState.techTier > 5) {
        newPlayerState.techTier = 5;
      }
    }
    
    // Handle special effects
    let specialState = gameState.specialState;
    
    if (card.effects.special_effect === 'missile_dome') {
      // Enter missile dome selection mode - handled by a different function
      setMissileDomeSelection({
        tilesSelected: [[rowIndex, colIndex]], // The initial tile is already selected
        tilesNeeded: 2 // Missile dome defends 2 tiles
      });
    } else if (card.effects.special_effect === 'archives') {
      // Enter archives mode - discard and draw
      specialState = {
        type: 'archives',
        data: {
          discardedCards: []
        }
      };
      setCardSelectionMode('discard');
    } else if (card.effects.special_effect === 'stone_skin') {
      // Apply Stone Skin effect to all tiles that had cards played on them
      newGrid = applyStoneSkinEffect(newGrid, tileMap);
    } else if (card.effects.special_effect === 'gold_rush') {
      // Track gold rush effect for next turn
      setGameState(prev => ({
        ...prev!,
        goldRushEffects: (prev!.goldRushEffects || 0) + 2
      }));
    }
    
    // Apply land benefit if card has that effect
    const tile = gameState.grid[rowIndex][colIndex];
    let newPartialBenefits = gameState.partialLandBenefits;
    if (card.effects.land_benefit) {
      const { playerAttributes, partialBenefits } = applyLandBenefit(
        tile.landType, 
        newPlayerState, 
        card.effects.land_benefit_double,
        gameState.partialLandBenefits
      );
      newPlayerState = playerAttributes;
      newPartialBenefits = partialBenefits;
    }
    
    // Apply conditional effects based on land type
    if (card.effects.conditional_effect && 
        card.effects.conditional_effect.condition === 'land_type' &&
        card.effects.conditional_effect.land_type === tile.landType) {
      
      if (card.effects.conditional_effect.effects.gold) {
        newPlayerState.gold += card.effects.conditional_effect.effects.gold;
      }
      
      if (card.effects.conditional_effect.effects.draw) {
        // Will handle card drawing later
      }
    }
    
    // Handle card drawing effects
    let newHand = [...gameState.hand];
    let newDeck = [...gameState.deck];
    let newDiscard = [...gameState.discard];
    
    // Remove the played card from hand (unless it's a special effect that stays in play)
    newHand = newHand.filter(c => c.id !== card.id);
    
    // Add the played card to the discard pile
    newDiscard.push(card);
    
    // Handle card draw effects
    let drawCount = 0;
    if (card.effects.draw) {
      drawCount += card.effects.draw;
    }
    
    // Add card draw from land benefit if applicable
    if (card.effects.land_benefit && tile.landType === 'card') {
      drawCount += 1 * (card.effects.land_benefit_double ? 2 : 1);
    }
    
    // Add card draw from conditional effects if applicable
    if (card.effects.conditional_effect && 
        card.effects.conditional_effect.condition === 'land_type' &&
        card.effects.conditional_effect.land_type === tile.landType &&
        card.effects.conditional_effect.effects.draw) {
      
      drawCount += card.effects.conditional_effect.effects.draw;
    }
    
    // Draw cards if needed
    if (drawCount > 0) {
      const { drawnCards, newDeck: updatedDeck, newDiscard: updatedDiscard } = 
        drawCards(newDeck, newDiscard, drawCount);
      
      newHand = [...newHand, ...drawnCards];
      newDeck = updatedDeck;
      newDiscard = updatedDiscard;
    }
    
    // Check for game over conditions
    const { gameOver, victory } = checkGameOver({
      ...gameState,
      player: newPlayerState
    });
    
    // Update game state
    setGameState({
      ...gameState,
      grid: newGrid,
      hand: newHand,
      deck: newDeck,
      discard: newDiscard,
      player: newPlayerState,
      selectedCard: null,
      gameOver,
      victory,
      specialState,
      partialLandBenefits: newPartialBenefits
    });
  };

  // Handle completing an Archives card action
  const handleArchivesComplete = () => {
    if (gameState.specialState?.type !== 'archives') return;
    
    const discardedCards = gameState.specialState.data.discardedCards || [];
    
    // Move discarded cards to discard pile
    let newHand = [...gameState.hand];
    let newDiscard = [...gameState.discard];
    
    // Remove discarded cards from hand
    newHand = newHand.filter(card => 
      !discardedCards.some((c: Card) => c.id === card.id)
    );
    
    // Add discarded cards to discard pile
    newDiscard = [...newDiscard, ...discardedCards];
    
    // Draw as many cards as were discarded
    const { drawnCards, newDeck, newDiscard: updatedDiscard } = 
      drawCards(gameState.deck, newDiscard, discardedCards.length);
    
    // Update game state
    setGameState({
      ...gameState,
      hand: [...newHand, ...drawnCards],
      deck: newDeck,
      discard: updatedDiscard,
      specialState: undefined
    });
    
    // Exit discard mode
    setCardSelectionMode(null);
  };

  // Handle buying a card from the shop
  const handleBuyCard = (card: Card) => {
    // Check if player has enough gold and buys
    if (gameState.player.gold < card.cost || gameState.player.buys <= 0) {
      return;
    }
    
    // Handle tech upgrade cards immediately
    if (card.type === 'Tech' && card.effects.tech) {
      // Update player state with tech upgrade
      const newPlayerState = {
        ...gameState.player,
        gold: gameState.player.gold - card.cost,
        buys: gameState.player.buys - 1,
        techTier: card.effects.tech
      };
      
      // Update shop with new cards based on tech tier
      const newShop = generateShopCards(card.effects.tech);
      
      // Check for game over conditions
      const { gameOver, victory } = checkGameOver({
        ...gameState,
        player: newPlayerState
      });
      
      // Update game state
      setGameState({
        ...gameState,
        shop: newShop,
        player: newPlayerState,
        gameOver,
        victory
      });
      
      return;
    }
    
    // Update player state
    const newPlayerState = {
      ...gameState.player,
      gold: gameState.player.gold - card.cost,
      buys: gameState.player.buys - 1
    };
    
    // Add card to discard pile
    const newDiscard = [...gameState.discard, card];
    
    // Remove card from shop and replace it
    const newShop = gameState.shop.filter(c => c.id !== card.id);
    
    // Add a new card to the shop
    const availableCards = generateShopCards(gameState.player.techTier);
    const cardsNotInShop = availableCards.filter(
      c => !newShop.some(shopCard => shopCard.name === c.name)
    );
    
    if (cardsNotInShop.length > 0) {
      const randomIndex = Math.floor(Math.random() * cardsNotInShop.length);
      newShop.push(cardsNotInShop[randomIndex]);
    }
    
    // Update game state
    setGameState({
      ...gameState,
      shop: newShop,
      discard: newDiscard,
      player: newPlayerState
    });
  };

  // Handle end turn
  const handleEndTurn = () => {
    // If in a special state, handle it first
    if (cardSelectionMode === 'discard') {
      handleArchivesComplete();
      return;
    }
    
    if (missileDomeSelection) {
      // Force selection to complete
      const newGrid = JSON.parse(JSON.stringify(gameState.grid)) as Tile[][];
      
      // Apply defense to selected tiles
      missileDomeSelection.tilesSelected.forEach(([r, c]) => {
        newGrid[r][c].defense += 4; // Missile dome provides +4 defense
      });
      
      setMissileDomeSelection(null);
      
      setGameState(prev => ({
        ...prev!,
        grid: newGrid
      }));
      
      return;
    }
    
    // Discard remaining hand
    let newDiscard = [...gameState.discard, ...gameState.hand];
    let newDeck = [...gameState.deck];
    
    // Apply damage from pending attacks
    const { grid: damagedGrid, woundCount } = applyDamageToGrid(
      gameState.grid, 
      gameState.pendingAttacks
    );
    
    // Add wounds to discard pile
    for (let i = 0; i < woundCount; i++) {
      newDiscard.push(createWoundCard(gameState.player.wounds + i));
    }
    
    // Update player wounds count
    const newWoundsCount = gameState.player.wounds + woundCount;
    
    // Calculate card draw for next turn
    let nextCardDraw = gameState.player.maxCardDraw;
    if (newWoundsCount >= 4) {
      nextCardDraw -= 1;
    }
    
    // Reset player attributes for next turn
    const newPlayerState = {
      ...gameState.player,
      cardPlays: gameState.player.maxCardPlays,
      buys: gameState.player.maxBuys,
      gold: gameState.goldRushEffects || 0, // Apply gold rush effects
      wounds: newWoundsCount,
      cardDraw: nextCardDraw
    };
    
    // Draw new hand for next turn
    let drawnCards: Card[] = [];
    
    // If deck doesn't have enough cards, shuffle discard into deck
    if (newDeck.length < nextCardDraw && newDiscard.length > 0) {
      console.log('Reshuffling discard pile into deck');
      // Shuffle discard pile to form new deck
      newDeck = shuffleDeck([...newDeck, ...newDiscard]);
      newDiscard = [];
    }
    
    // Draw cards
    const drawResult = drawCards(newDeck, newDiscard, nextCardDraw);
    drawnCards = drawResult.drawnCards;
    newDeck = drawResult.newDeck;
    newDiscard = drawResult.newDiscard;
    
    // Reset grid for new turn
    const newGrid = resetGridForNewTurn(damagedGrid);
    
    // Generate pending attacks for the next round
    const nextRound = gameState.round + 1;
    const pendingAttacks = generatePendingAttacks(nextRound);
    
    // Check for game over conditions
    const { gameOver, victory } = checkGameOver({
      ...gameState,
      player: newPlayerState
    });
    
    // Update game state
    setGameState({
      ...gameState,
      round: nextRound,
      grid: newGrid,
      hand: drawnCards,
      deck: newDeck,
      discard: newDiscard,
      player: newPlayerState,
      selectedCard: null,
      gameOver,
      victory,
      specialState: undefined,
      pendingAttacks,
      goldRushEffects: undefined, // Reset gold rush effects
      partialLandBenefits: undefined // Reset partial land benefits
    });
  };

  // Handle starting a new game
  const handleNewGame = () => {
    const initialState = initializeGameState();
    setGameState(initialState);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Grid Builder</h1>
      </header>
      <div className="game-container">
        <PlayerInfo 
          playerAttributes={gameState.player} 
          round={gameState.round} 
        />
        <div className="game-play-area">
          <GameBoard 
            grid={gameState.grid} 
            selectedCard={gameState.selectedCard}
            onTileClick={handleCardPlacement}
            missileDomeSelection={missileDomeSelection}
            pendingAttacks={gameState.pendingAttacks}
          />
          <div className="side-panel">
            <ShopArea 
              shop={gameState.shop} 
              gold={gameState.player.gold}
              buys={gameState.player.buys}
              onBuyCard={handleBuyCard} 
            />
            <button 
              className="end-turn-button" 
              onClick={handleEndTurn}
            >
              {cardSelectionMode === 'discard' ? 'Confirm Discards' : 'End Turn'}
            </button>
          </div>
        </div>
        <HandArea 
          hand={gameState.hand} 
          selectedCard={gameState.selectedCard}
          onCardSelect={handleCardSelect} 
          cardPlays={gameState.player.cardPlays}
          selectionMode={cardSelectionMode}
          selectedForDiscard={
            gameState.specialState?.type === 'archives' 
              ? gameState.specialState.data.discardedCards || []
              : []
          }
        />
        {gameState.gameOver && (
          <GameOver 
            victory={gameState.victory} 
            onNewGame={handleNewGame} 
          />
        )}
      </div>
    </div>
  );
};

export default App;