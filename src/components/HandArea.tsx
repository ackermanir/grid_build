import React from 'react';
import { Card } from '../types';
import './HandArea.css';

interface HandAreaProps {
  hand: Card[];
  selectedCard: Card | null;
  onCardSelect: (card: Card) => void;
  cardPlays: number;
}

export const HandArea: React.FC<HandAreaProps> = ({ 
  hand, 
  selectedCard, 
  onCardSelect,
  cardPlays
}) => {
  // Determine if a card can be played (if player has card plays left)
  const canPlayCard = (card: Card): boolean => {
    return cardPlays > 0;
  };

  return (
    <div className="hand-area">
      <h2 className="hand-title">Your Hand ({hand.length})</h2>
      <div className="hand-cards">
        {hand.map(card => {
          const isSelected = selectedCard && selectedCard.id === card.id;
          const isPlayable = canPlayCard(card);
          
          return (
            <div
              key={card.id}
              className={`hand-card ${isSelected ? 'selected' : ''} ${isPlayable ? 'playable' : 'unplayable'}`}
              onClick={() => isPlayable && onCardSelect(card)}
            >
              <div className="card-header">
                <span className="card-name">{card.name}</span>
                <span className="card-cost">{card.cost}</span>
              </div>
              <div className="card-emoji">{card.emoji}</div>
              <div className="card-type">{card.type}</div>
              <div className="card-description">{card.description}</div>
              <div className="card-effects">
                {Object.entries(card.effects).map(([key, value]) => {
                  if (key === 'land_benefit' && value === true) {
                    return <div key={key}>Land Benefit</div>;
                  }
                  if (value) {
                    return (
                      <div key={key}>
                        {key}: {value}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};