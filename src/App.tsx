import React, { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { PlayerInfo } from './components/PlayerInfo';
import { ShopArea } from './components/ShopArea';
import { HandArea } from './components/HandArea';
import { GameOver } from './components/GameOver';
import VersionDisplay from './components/VersionDisplay';
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
import { shuffleDeck, upgradeBaseCards } from './utils/cardUtils';
import { GameState, Card, Tile, BuildingType } from './types';
import TechUpgradeModal from './components/TechUpgradeModal';
import './App.css';
import { version, lastUpdated } from './version';

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
    console.log('handleCardSelect called with card:', card?.name);
    console.log('Current hand:', gameState.hand.map(c => c.name));
    
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
      console.log('Setting selectedCard to:', gameState.selectedCard?.id === card.id ? 'null' : card.name);
      // Only allow selection if the card is actually in the hand
      if (!gameState.hand.some(c => c.id === card.id)) {
        console.log('Card not in hand, ignoring selection');
        return;
      }
      setGameState(prev => ({
        ...prev!,
        selectedCard: prev!.selectedCard?.id === card.id ? null : card
      }));
    }
  };

  // Handle card placement on grid OR building placement
  const handleCardPlacement = (rowIndex: number, colIndex: number) => {
    // Check if we are in building placement mode
    if (gameState.buildingToPlace) {
      const newGrid = JSON.parse(JSON.stringify(gameState.grid)) as Tile[][];
      
      // Check if a building already exists on this tile
      if (newGrid[rowIndex][colIndex].building) {
        console.log('Building already exists on this tile');
        // Optionally provide user feedback here (e.g., toast message)
        return; 
      }

      // Place the building
      newGrid[rowIndex][colIndex].building = gameState.buildingToPlace;
      
      // Update state: place building and clear placement flags
      setGameState(prev => ({
        ...prev!,
        grid: newGrid,
        buildingToPlace: null,
        techTierJustReached: null // Clear this as the action is complete
      }));
      
      console.log(`Placed ${gameState.buildingToPlace} at [${rowIndex}, ${colIndex}]`);
      return; // Exit after placing building
    }

    console.log('handleCardPlacement called with selectedCard:', gameState.selectedCard?.name);
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
                grid: newGrid,
                selectedCard: null // Ensure selectedCard is cleared
              }));
            }, 500);
          }
        }
      }
      return;
    }
    
    if (!gameState.selectedCard) {
      console.log('No card selected, returning early');
      return;
    }
    
    // Check if a card has already been played on this tile
    if (gameState.grid[rowIndex][colIndex].cardPlayed) {
      console.log('Tile already has a card played');
      return;
    }
    
    // Check if player has enough card plays
    if (gameState.player.cardPlays <= 0) {
      console.log('No card plays remaining');
      return;
    }
    
    const card = gameState.selectedCard;
    console.log('Playing card:', card.name);
    
    // Clear selected card immediately
    console.log('Clearing selectedCard state');
    setGameState(prev => ({
      ...prev!,
      selectedCard: null
    }));
    
    // Track tiles that have cards played on them in this turn
    const tileMap = new Map<string, boolean>();
    
    // Create a deep copy of the grid and player state for effect application
    let tempGrid = JSON.parse(JSON.stringify(gameState.grid)) as Tile[][];
    let tempPlayerState = { ...gameState.player };
    let tempPartialBenefits = gameState.partialLandBenefits ? { ...gameState.partialLandBenefits } : { cardPlays: 0, cardDraw: 0, gold: 0 };
    let tempSpecialState = gameState.specialState; // Copy special state reference
    let tempHand = [...gameState.hand]; // Track hand within loop
    let tempDeck = [...gameState.deck]; // Track deck within loop
    let tempDiscard = [...gameState.discard]; // Track discard within loop
    let tempShop = [...gameState.shop]; // Track shop within loop
    let totalDrawCount = 0;
    let accumulatedGoldRush = gameState.goldRushEffects || 0;

    // Determine number of times to apply effect (1 normally, 2 for Echo Chamber)
    const applyTimes = tempGrid[rowIndex][colIndex].building === 'Echo Chamber' ? 2 : 1;
    console.log(`Applying card effects ${applyTimes} times.`);

    for (let i = 0; i < applyTimes; i++) {
      console.log(`Applying effect iteration ${i + 1}`);
      // Apply the basic card effect to the tile (only visual update on first pass?)
      // Or should this be inside? If card applies defense, does it double?
      // Let's assume visual only happens once, but effect logic happens multiple times.
      // We'll apply the *effects* multiple times, but place the card visually once.
      if (i === 0) {
        const { grid: updatedGrid } = applyCardEffectToTile(
          tempGrid, 
          rowIndex, 
          colIndex, 
          card,
          tileMap // tileMap needs to persist across iterations?
        );
        tempGrid = updatedGrid;
      }
      
      // Calculate effects from the card for this iteration
      let iterationDrawCount = 0; // Draw count for this specific iteration
      
      // Decrease card plays (only on the first iteration!)
      if (i === 0) {
         tempPlayerState.cardPlays -= 1;
      }
      
      // Apply card effects (gold, draw, buy, etc.)
      const tileHasResourceDepot = tempGrid[rowIndex][colIndex].building === 'Resource Depot';

      if (card.effects.gold) {
        let goldToAdd = card.effects.gold;
        if (tileHasResourceDepot) {
          goldToAdd += 1;
        }
        tempPlayerState.gold += goldToAdd;
      }
      
      if (card.effects.draw) {
        let drawToAdd = card.effects.draw;
        if (tileHasResourceDepot) {
          drawToAdd += 1;
        }
        iterationDrawCount += drawToAdd;
      }

      if (card.effects.buy) {
        tempPlayerState.buys += card.effects.buy;
      }
      
      if (card.effects.card_play) {
        tempPlayerState.cardPlays += card.effects.card_play;
      }
      
      // Tech upgrades happen only once, when the card is played, not duplicated
      let iterationBuildingToPlace: BuildingType | null = null;
      let iterationTechTierJustReached: number | null = null;
      if (i === 0 && card.effects.tech) { 
        const currentTechTier = tempPlayerState.techTier;
        const newTechTier = card.effects.tech;
        
        if (newTechTier > currentTechTier) {
          iterationTechTierJustReached = newTechTier;
          tempPlayerState.techTier = Math.min(newTechTier, 5);
          
          if (newTechTier === 2) iterationBuildingToPlace = 'Resource Depot';
          else if (newTechTier === 3) {
            iterationBuildingToPlace = 'Refinery';
            // --- Upgrade Base Cards --- 
            console.log('Upgrading base cards for Tier 3');
            tempHand = upgradeBaseCards(tempHand);
            tempDeck = upgradeBaseCards(tempDeck);
            tempDiscard = upgradeBaseCards(tempDiscard);
            // --- End Base Card Upgrade ---
            // Refresh shop for Tier 3
            console.log('Refreshing shop for Tier 3');
            tempShop = generateShopCards(3); // Use tempShop variable
          }
          else if (newTechTier === 4) iterationBuildingToPlace = 'Echo Chamber';
        }
      }
      
      // Apply land benefit if card has that effect
      const currentTile = tempGrid[rowIndex][colIndex];
      if (card.effects.land_benefit) {
        const oldCardDraw = tempPlayerState.cardDraw;
        const { playerAttributes, partialBenefits } = applyLandBenefit(
          currentTile.landType, 
          tempPlayerState,
          card.effects.land_benefit_double,
          tempPartialBenefits // Pass the current partial benefits
        );
        tempPlayerState = playerAttributes;
        tempPartialBenefits = partialBenefits;

        if (tempPlayerState.cardDraw > oldCardDraw) {
          iterationDrawCount += tempPlayerState.cardDraw - oldCardDraw;
        }
      }

      // Apply conditional effects
      if (card.effects.conditional_effect) {
        if (card.effects.conditional_effect.condition === 'land_type' && 
            card.effects.conditional_effect.land_type === currentTile.landType) {
          if (card.effects.conditional_effect.effects.gold) {
            tempPlayerState.gold += card.effects.conditional_effect.effects.gold;
          }
          // Add other conditional effects here
        }
      }
      
      // --- Handle Special Effects (Need careful thought for duplication) ---
      // Missile Dome: Should likely only trigger once. Place selection state outside loop.
      // Archives: Needs careful handling. Maybe process discard/draw twice successively?
      // Stone Skin: Apply to tiles played on *this* turn. Maybe apply outside loop?
      // Gold Rush: Accumulate the effect. +2 per application.

      if (card.effects.special_effect === 'missile_dome' && i === 0) {
        setMissileDomeSelection({
          tilesSelected: [[rowIndex, colIndex]],
          tilesNeeded: 2 
        });
      } else if (card.effects.special_effect === 'archives') {
        // For Echo Chamber, this needs to happen twice.
        const activationsNeeded = applyTimes; // Will be 2 if Echo Chamber, 1 otherwise
        if (tempSpecialState?.type === 'archives') {
          // If already in archives state (e.g., second Echo Chamber activation)
          tempSpecialState.data.remainingActivations += activationsNeeded;
        } else {
          // Start archives state
          tempSpecialState = { 
            type: 'archives', 
            data: { 
              discardedCards: [],
              remainingActivations: activationsNeeded,
              initialActivations: activationsNeeded // Store how many activations started
            } 
          };
          setCardSelectionMode('discard'); // Enter discard mode only on first activation
        }
      } else if (card.effects.special_effect === 'stone_skin' && i === 0) {
         // Apply stone skin once after all effects resolve.
         // Requires tracking tiles modified outside the loop.
      } else if (card.effects.special_effect === 'gold_rush') {
         accumulatedGoldRush += 2;
      }
      
      // Accumulate total draw count across iterations
      totalDrawCount += iterationDrawCount;

      // --- Tech tier state needs to be set outside the loop based on first iteration ---
      // buildingToPlace = iterationBuildingToPlace; 
      // techTierJustReached = iterationTechTierJustReached;

    } // End of effect application loop

    // --- Post-loop updates ---
    
    // Apply Stone Skin if needed (apply to final grid state)
    if (card.effects.special_effect === 'stone_skin') {
      tempGrid = applyStoneSkinEffect(tempGrid, tileMap);
    }

    // Resolve tech tier state based on first pass (if it happened)
    let finalBuildingToPlace: BuildingType | null = null;
    let finalTechTierJustReached: number | null = null;
    if (card.effects.tech) { 
      const currentTechTier = gameState.player.techTier; // Check original state
      const newTechTier = card.effects.tech;
      if (newTechTier > currentTechTier) {
        finalTechTierJustReached = newTechTier;
        if (newTechTier === 2) finalBuildingToPlace = 'Resource Depot';
        else if (newTechTier === 3) finalBuildingToPlace = 'Refinery';
        else if (newTechTier === 4) finalBuildingToPlace = 'Echo Chamber';
      }
    }

    // Update game state using the final calculated states
    setGameState(prev => {
      if (!prev) return null;
      
      let finalHand = tempHand.filter(c => c.id !== card.id);
      let finalDeck = tempDeck;
      let finalDiscard = [...tempDiscard, card];

      // Draw accumulated cards
      if (totalDrawCount > 0) {
        const drawResult = drawCards(finalDeck, finalDiscard, totalDrawCount);
        finalHand = [...finalHand, ...drawResult.drawnCards];
        finalDeck = drawResult.newDeck;
        finalDiscard = drawResult.newDiscard;
      }
      
      let updatedState: Partial<GameState> = {};
      if (finalTechTierJustReached !== null) {
        updatedState.techTierJustReached = finalTechTierJustReached;
        updatedState.buildingToPlace = finalBuildingToPlace;
        // If tier 3 was reached, update the shop in the final state
        if (finalTechTierJustReached === 3) {
          updatedState.shop = tempShop; 
        }
      }

      return {
        ...prev,
        grid: tempGrid, // Use the grid potentially modified by stone skin
        hand: finalHand,
        deck: finalDeck,
        discard: finalDiscard,
        player: tempPlayerState, // Use the state after all iterations
        specialState: tempSpecialState, // Use potentially updated special state
        partialLandBenefits: tempPartialBenefits, // Use final partial benefits
        goldRushEffects: accumulatedGoldRush > 0 ? accumulatedGoldRush : undefined,
        ...updatedState
      };
    });
  };

  // Handle completing an Archives card action
  const handleArchivesComplete = () => {
    if (gameState.specialState?.type !== 'archives') return;
    
    const { discardedCards = [], remainingActivations, initialActivations } = gameState.specialState.data;
    
    console.log(`Archives complete: ${discardedCards.length} cards discarded. Remaining activations: ${remainingActivations - 1}`);

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
    
    // Check if more activations are needed (e.g., Echo Chamber)
    const nextRemainingActivations = remainingActivations - 1;
    let nextSpecialState: GameState['specialState'] = undefined;
    let nextCardSelectionMode: 'play' | 'discard' | null = null;

    if (nextRemainingActivations > 0) {
      // Re-enter Archives state for the next activation
      console.log('Re-activating Archives effect...');
      nextSpecialState = {
        type: 'archives',
        data: {
          discardedCards: [], // Reset for next discard selection
          remainingActivations: nextRemainingActivations,
          initialActivations: initialActivations
        }
      };
      nextCardSelectionMode = 'discard'; // Stay in discard mode
    } else {
      // All activations complete, exit discard mode
      nextCardSelectionMode = null;
    }
    
    // Update game state
    setGameState({
      ...gameState,
      hand: [...newHand, ...drawnCards],
      deck: newDeck,
      discard: updatedDiscard,
      specialState: nextSpecialState
    });
    
    // Update card selection mode separately
    setCardSelectionMode(nextCardSelectionMode);
  };

  // Handle buying a card from the shop
  const handleBuyCard = (card: Card) => {
    // Check if player has enough gold and buys
    if (gameState.player.gold < card.cost || gameState.player.buys <= 0) {
      return;
    }
    
    // Handle tech upgrade cards immediately
    if (card.type === 'Tech' && card.effects.tech) {
      const currentTechTier = gameState.player.techTier;
      const newTechTier = card.effects.tech;
      let buildingToPlace: BuildingType | null = null;
      let techTierJustReached: number | null = null;

      if (newTechTier > currentTechTier) {
        techTierJustReached = newTechTier;
        // Determine building based on the tier reached
        if (newTechTier === 2) buildingToPlace = 'Resource Depot';
        else if (newTechTier === 3) {
           buildingToPlace = 'Refinery';
           // TODO: Handle base card upgrades + shop refresh when buying Tier 3 card?
           // This is tricky because the upgrades should ideally happen immediately,
           // but the current upgrade logic is tied to handleCardPlacement.
           // For now, we'll just set the building flag. Need to refactor later.
           console.warn("Tier 3 card bought - Base card upgrades need refactoring to apply here.");
        } 
        else if (newTechTier === 4) buildingToPlace = 'Echo Chamber';
      }

      // Update player state with tech upgrade
      const newPlayerState = {
        ...gameState.player,
        gold: gameState.player.gold - card.cost,
        buys: gameState.player.buys - 1,
        techTier: newTechTier
      };
      
      // Update shop with new cards based on tech tier
      const newShop = generateShopCards(newTechTier);
      
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
        victory,
        buildingToPlace,
        techTierJustReached
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
    console.log('handleEndTurn called with selectedCard:', gameState.selectedCard?.name);
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
    
    // Add card draw from partial benefits if applicable
    if (gameState.partialLandBenefits?.cardDraw && gameState.partialLandBenefits.cardDraw >= 1) {
      nextCardDraw += Math.floor(gameState.partialLandBenefits.cardDraw);
    }
    
    // Reset player attributes for next turn
    let newPlayerState = {
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
    let newGrid = resetGridForNewTurn(damagedGrid);
    
    // --- Apply Refinery effects at the start of the turn ---
    let playerStateAfterRefinery = { ...newPlayerState };
    let partialBenefitsAfterRefinery = { cardPlays: 0, cardDraw: 0, gold: 0 }; // Initialize partial benefits for refinery

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (newGrid[r][c].building === 'Refinery') {
          const refineryTile = newGrid[r][c];
          const { playerAttributes: updatedAttrs, partialBenefits: updatedPartial } = applyLandBenefit(
            refineryTile.landType,
            playerStateAfterRefinery,
            false, // Not doubled
            partialBenefitsAfterRefinery
          );
          playerStateAfterRefinery = updatedAttrs;
          partialBenefitsAfterRefinery = updatedPartial;
        }
      }
    }
    // Update player state with refinery benefits
    newPlayerState = playerStateAfterRefinery;
    // --- End Refinery effects ---

    // Generate pending attacks for the next round
    const nextRound = gameState.round + 1;
    const pendingAttacks = generatePendingAttacks(nextRound);
    
    // Check for game over conditions
    const { gameOver, victory } = checkGameOver({
      ...gameState,
      player: newPlayerState
    });
    
    // Update game state
    console.log('Setting selectedCard to null in end turn');
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
      goldRushEffects: undefined,
      partialLandBenefits: undefined // Clear partial benefits at end of turn
    });
  };

  // Handle starting a new game
  const handleNewGame = () => {
    const initialState = initializeGameState();
    setGameState(initialState);
  };

  // Function to close the tech upgrade modal
  const handleCloseTechModal = () => {
    setGameState(prev => ({
      ...prev!,
      techTierJustReached: null // Only clear the flag, building placement happens on click
    }));
  };

  return (
    <div className="App">
      <div className="game-container">
        {gameState.gameOver ? (
          <GameOver 
            victory={gameState.victory} 
            onNewGame={handleNewGame} 
          />
        ) : (
          <>
            <PlayerInfo 
              playerAttributes={gameState.player}
              round={gameState.round}
            />
            <div className="game-play-area">
              <GameBoard
                grid={gameState.grid}
                selectedCard={gameState.selectedCard}
                onTileClick={handleCardPlacement}
                pendingAttacks={gameState.pendingAttacks}
                missileDomeSelection={missileDomeSelection}
                buildingToPlace={gameState.buildingToPlace}
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
              selectionMode={cardSelectionMode}
              selectedForDiscard={gameState.specialState?.type === 'archives' ? gameState.specialState.data.discardedCards : []}
              cardPlays={gameState.player.cardPlays}
            />
          </>
        )}
        <VersionDisplay />
        
        {/* Conditionally render the Tech Upgrade Modal */}
        {gameState.techTierJustReached && (
          <TechUpgradeModal 
            techTier={gameState.techTierJustReached}
            building={gameState.buildingToPlace}
            onClose={handleCloseTechModal}
          />
        )}
      </div>
    </div>
  );
};

export default App;