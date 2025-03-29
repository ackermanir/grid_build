import React from 'react';
import { Tile, Card } from '../types';
import './GameBoard.css';

interface GameBoardProps {
  grid: Tile[][];
  selectedCard: Card | null;
  onTileClick: (rowIndex: number, colIndex: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  grid, 
  selectedCard, 
  onTileClick 
}) => {
  // Determine if a tile is eligible for card placement
  const isTileEligible = (tile: Tile): boolean => {
    return !tile.cardPlayed && selectedCard !== null;
  };

  return (
    <div className="game-board">
      {grid.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="board-row">
          {row.map((tile, colIndex) => {
            const isEligible = isTileEligible(tile);
            const landClass = `land-${tile.landType}`;
            
            return (
              <div
                key={`tile-${rowIndex}-${colIndex}`}
                className={`board-tile ${landClass} ${isEligible ? 'eligible' : ''}`}
                onClick={() => isEligible && onTileClick(rowIndex, colIndex)}
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
                
                {/* Defense value */}
                {tile.defense > 0 && (
                  <div className="defense-value">
                    {tile.defense}🛡️
                  </div>
                )}
                
                {/* Damage value */}
                {tile.damage > 0 && (
                  <div className="damage-value">
                    {tile.damage}💥
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};