import React from 'react';
import { PlayerAttributes } from '../types';
import './PlayerInfo.css';

interface PlayerInfoProps {
  playerAttributes: PlayerAttributes;
  round: number;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({ 
  playerAttributes, 
  round 
}) => {
  return (
    <div className="player-info">
      <div className="round-counter">
        <span className="label">Round</span>
        <span className="value">{round}</span>
      </div>
      
      <div className="attributes">
        <div className="attribute">
          <span className="label">Tech Tier</span>
          <span className="value">
            {playerAttributes.techTier} / 5
            <span className="tier-progress">
              {Array(5).fill(0).map((_, i) => (
                <span 
                  key={i} 
                  className={`tier-dot ${i < playerAttributes.techTier ? 'active' : ''}`}
                />
              ))}
            </span>
          </span>
        </div>
        
        <div className="attribute">
          <span className="label">Card Plays</span>
          <span className="value">{playerAttributes.cardPlays}</span>
        </div>
        
        <div className="attribute">
          <span className="label">Buys</span>
          <span className="value">{playerAttributes.buys}</span>
        </div>
        
        <div className="attribute">
          <span className="label">Gold</span>
          <span className="value">{playerAttributes.gold} 💰</span>
        </div>
        
        <div className="attribute">
          <span className="label">Card Draw</span>
          <span className="value">{playerAttributes.cardDraw}</span>
        </div>
        
        <div className="attribute">
          <span className="label">Wounds</span>
          <span className={`value ${playerAttributes.wounds >= 4 ? 'warning' : ''}`}>
            {playerAttributes.wounds} / 6 💔
          </span>
        </div>
      </div>
    </div>
  );
};