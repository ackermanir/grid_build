import React, { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { PlayerInfo } from './components/PlayerInfo';
import { ShopArea } from './components/ShopArea';
import { HandArea } from './components/HandArea';
import { GameOver } from './components/GameOver';
import { initializeGameState, drawCards, checkGameOver, resetGridForNewTurn, applyDamageToGrid, generateShopCards } from './utils/gameUtils';
import { createWoundCard } from './data/cards';
import { GameState, Card, Tile } from './types';
import './App.css';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initializeGameState());

  // Handle card selection from hand
  const handleCardSelect = (card: Card) => {
    setGameState(prev => ({
      ...prev,
      selectedCard: prev.selectedCard?.id === card.id ? null : card
    }));
  };

  // Handle card placement on grid
  const handleCardPlacement = (rowIndex: number, colIndex: number) => {
    if (!gameState.selectedCard) return;
    
    // Check if a card has already been played on this tile
    if (gameState.grid[rowIndex][colIndex].cardPlayed) return;
    
    // Check if player has enough card plays
    if (gameState.player.cardPlays <= 0) return;
    
    const card = gameState.selectedCard;
    
    // Create a deep copy of the grid
    const newGrid = JSON.parse(JSON.stringify(gameState.grid)) as Tile[][];
    
    // Update the tile with the card
    newGrid[rowIndex][colIndex].cardPlayed = card;
    
    // Add defense if the card provides it
    if (card.effects.defense) {
      newGrid[rowIndex][colIndex].defense += card.effects.defense;
    }
    
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
      newPlayerState.techTier += card.effects.tech;
      if (newPlayerState.techTier > 5) {
        newPlayerState.techTier = 5;
      }
    }
    
    // Apply land benefit if card has that effect
    const tile = gameState.grid[rowIndex][colIndex];
    if (card.effects.land_benefit) {
      switch (tile.landType) {
        case 'gold':
          newPlayerState.gold += 2;
          break;
        case 'card':
          // Will handle card drawing separately
          break;
        case 'play':
          newPlayerState.cardPlays += 0.5;
          if (newPlayerState.cardPlays % 1 === 0) {
            // Round down if needed
            newPlayerState.cardPlays = Math.floor(newPlayerState.cardPlays);
          }
          break;
      }
    }
    
    // Handle card drawing effects
    let newHand = [...gameState.hand];
    let newDeck = [...gameState.deck];
    let newDiscard = [...gameState.discard];
    
    // Remove the played card from hand
    newHand = newHand.filter(c => c.id !== card.id);
    
    // Handle card draw effects
    let drawCount = 0;
    if (card.effects.draw) {
      drawCount += card.effects.draw;
    }
    
    // Add card draw from land benefit if applicable
    if (card.effects.land_benefit && tile.landType === 'card') {
      drawCount += 1;
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
      victory
    });
  };

  // Handle buying a card from the shop
  const handleBuyCard = (card: Card) => {
    // Check if player has enough gold and buys
    if (gameState.player.gold < card.cost || gameState.player.buys <= 0) {
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
    // Discard remaining hand
    const newDiscard = [...gameState.discard, ...gameState.hand];
    
    // Apply damage from enemies
    const { grid: damagedGrid, woundCount } = applyDamageToGrid(
      gameState.grid, 
      gameState.round
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
      gold: 0,
      wounds: newWoundsCount,
      cardDraw: nextCardDraw
    };
    
    // Draw new hand
    const { drawnCards, newDeck, newDiscard: updatedDiscard } = 
      drawCards(gameState.deck, newDiscard, nextCardDraw);
    
    // Reset grid for new turn
    const newGrid = resetGridForNewTurn(damagedGrid);
    
    // Check for game over conditions
    const { gameOver, victory } = checkGameOver({
      ...gameState,
      player: newPlayerState
    });
    
    // Update game state
    setGameState({
      ...gameState,
      round: gameState.round + 1,
      grid: newGrid,
      hand: drawnCards,
      deck: newDeck,
      discard: updatedDiscard,
      player: newPlayerState,
      selectedCard: null,
      gameOver,
      victory
    });
  };

  // Handle starting a new game
  const handleNewGame = () => {
    setGameState(initializeGameState());
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
              End Turn
            </button>
          </div>
        </div>
        <HandArea 
          hand={gameState.hand} 
          selectedCard={gameState.selectedCard} 
          onCardSelect={handleCardSelect} 
          cardPlays={gameState.player.cardPlays}
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