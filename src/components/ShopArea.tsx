import React from 'react';
import { Card } from '../types';
import './ShopArea.css';

interface ShopAreaProps {
  shop: Card[];
  gold: number;
  buys: number;
  onBuyCard: (card: Card) => void;
}

export const ShopArea: React.FC<ShopAreaProps> = ({ 
  shop, 
  gold, 
  buys,
  onBuyCard 
}) => {
  // Check if player can afford a card
  const canAfford = (card: Card): boolean => {
    return gold >= card.cost && buys > 0;
  };

  return (
    <div className="shop-area">
      <div className="shop-header">
        <h2 className="shop-title">Shop</h2>
        <div className="shop-stats">
          <span className="shop-gold">{gold} 💰</span>
          <span className="shop-buys">{buys} buys</span>
        </div>
      </div>
      <div className="shop-cards">
        {shop.map(card => {
          const affordable = canAfford(card);
          
          return (
            <div
              key={card.id}
              className={`shop-card ${affordable ? 'affordable' : 'unaffordable'}`}
              onClick={() => affordable && onBuyCard(card)}
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