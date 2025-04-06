import React from 'react';
import { Tile, Card, BuildingType } from '../types';
import './GameBoard.css';

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

export const GameBoard: React.FC<GameBoardProps> = ({ 
  grid, 
  selectedCard, 
  onTileClick,
  missileDomeSelection = null,
  buildingToPlace = null,
  pendingAttacks
}) => {
  // Determine if a tile is eligible for card placement
  const isTileEligible = (tile: Tile, rowIndex: number, colIndex: number): boolean => {
    // In missile dome selection mode
    if (missileDomeSelection) {
      // Check if this tile is already selected
      const isAlreadySelected = missileDomeSelection.tilesSelected.some(
        ([r, c]) => r === rowIndex && c === colIndex
      );
      
      if (isAlreadySelected) {
        return false;
      }
      
      // In missile dome mode, any unselected tile is eligible
      return true;
    }
    
    // Normal mode - check if tile doesn't have a card and player has selected a card
    return !tile.cardPlayed && selectedCard !== null;
  };

  return (
    <div className="game-board">
      {grid.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="board-row">
          {row.map((tile, colIndex) => {
            const isEligible = isTileEligible(tile, rowIndex, colIndex);
            const landClass = `land-${tile.landType}`;
            
            // Check if this tile is selected in missile dome mode
            const isSelectedForMissileDome = missileDomeSelection?.tilesSelected.some(
              ([r, c]) => r === rowIndex && c === colIndex
            );
            
            // Check if this tile has a pending attack
            const hasPendingAttack = pendingAttacks?.positions.some(
              ([r, c]) => r === rowIndex && c === colIndex
            );
            
            // Determine if the tile is clickable
            const canPlaceBuilding = buildingToPlace && !tile.building;
            const canSelectMissileDome = isSelectedForMissileDome; // Can click already selected to potentially deselect later?
            const canPlayCard = isEligible; // Check if eligible for card play

            const isClickable = canPlaceBuilding || canSelectMissileDome || canPlayCard;

            return (
              <div
                key={`tile-${rowIndex}-${colIndex}`}
                data-testid={`tile-${rowIndex}-${colIndex}`}
                className={`board-tile ${landClass} 
                           ${isEligible ? 'eligible' : ''} 
                           ${isSelectedForMissileDome ? 'missile-dome-selected' : ''} 
                           ${hasPendingAttack ? 'pending-attack' : ''}
                           ${canPlaceBuilding ? 'building-eligible' : ''} // Add class for visual feedback
                          `}
                onClick={() => isClickable && onTileClick(rowIndex, colIndex)} // Updated click condition
              >
                {/* Land type indicator */}
                <div className="land-type">
                  {tile.landType === 'gold' && '💰'}
                  {tile.landType === 'card' && '🃏'}
                  {tile.landType === 'play' && '▶️'}
                </div>
                
                {/* Card played on this tile */}
                {tile.cardPlayed && (
                  <div className="played-card">
                    <span className="card-emoji">{tile.cardPlayed.emoji}</span>
                  </div>
                )}
                
                {/* Defense value - include defense from history */}
                {(tile.defense > 0 || (tile.defenseHistory && tile.defenseHistory.length > 0)) && (
                  <div className="defense-value">
                    {tile.defense + (tile.defenseHistory?.reduce((sum, item) => sum + item.defense, 0) || 0)}🛡️
                  </div>
                )}
                
                {/* Persistent defense indicator */}
                {tile.defenseHistory && tile.defenseHistory.length > 0 && (
                  <div className="persistent-defense">
                    ⏳
                  </div>
                )}
                
                {/* Damage value */}
                {tile.damage > 0 && (
                  <div className="damage-value">
                    {tile.damage}💥
                  </div>
                )}
                
                {/* Pending attack indicator */}
                {hasPendingAttack && (
                  <div className="pending-attack-value">
                    {pendingAttacks?.damagePerAttack}⚠️
                  </div>
                )}
                
                {/* Missile dome selection indicator */}
                {isSelectedForMissileDome && (
                  <div className="missile-dome-indicator">
                    🎯
                  </div>
                )}
                
                {/* Building on this tile */}
                {tile.building && (
                  <div className="building-indicator">
                    {tile.building === 'Resource Depot' && '🏭'}
                    {tile.building === 'Refinery' && '⚙️'}
                    {tile.building === 'Echo Chamber' && '🔮'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      
      {missileDomeSelection && (
        <div className="missile-dome-instructions">
          Select {missileDomeSelection.tilesNeeded - missileDomeSelection.tilesSelected.length} more tile(s) to defend
        </div>
      )}
    </div>
  );
};