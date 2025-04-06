import React from 'react';
import { Card } from '../types';
import './HandArea.css';

interface HandAreaProps {
  hand: Card[];
  selectedCard: Card | null;
  onCardSelect: (card: Card) => void;
  cardPlays: number;
  selectionMode?: 'play' | 'discard' | null;
  selectedForDiscard?: Card[];
}

export const HandArea: React.FC<HandAreaProps> = ({ 
  hand, 
  selectedCard, 
  onCardSelect,
  cardPlays,
  selectionMode = null,
  selectedForDiscard = []
}) => {
  // Determine if a card can be played based on selection mode
  const canPlayCard = (card: Card): boolean => {
    if (selectionMode === 'discard') {
      // In discard mode, all cards are selectable
      return true;
    }
    
    // In normal play mode, can only play if player has card plays left
    return cardPlays > 0;
  };

  return (
    <div className="hand-area">
      <h2 className="hand-title">
        {selectionMode === 'discard' 
          ? 'Select Cards to Discard' 
          : `Your Hand (${hand.length})`
        }
      </h2>
      <div className="hand-cards">
        {hand.map(card => {
          const isSelected = selectionMode === 'discard'
            ? selectedForDiscard.some(c => c.id === card.id)
            : selectedCard && selectedCard.id === card.id;
            
          const isPlayable = canPlayCard(card);
          
          return (
            <div
              key={card.id}
              data-testid={`hand-card-${card.name}`}
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
                  if (value && typeof value !== 'object') {
                    return (
                      <div key={key}>
                        {key}: {value}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              {selectionMode === 'discard' && isSelected && (
                <div className="discard-marker">Discard</div>
              )}
            </div>
          );
        })}
      </div>
      {selectionMode === 'discard' && (
        <div className="discard-info">
          Selected {selectedForDiscard.length} cards to discard.
          Click "Confirm Discards" to draw that many cards.
        </div>
      )}
    </div>
  );
};