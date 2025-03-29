import React from 'react';
import './GameOver.css';

interface GameOverProps {
  victory: boolean;
  onNewGame: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ victory, onNewGame }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className={victory ? 'victory' : 'defeat'}>
          {victory ? 'Victory!' : 'Defeat!'}
        </h2>
        <p>
          {victory 
            ? 'Congratulations! You have reached Tech Tier 5 and won the game!'
            : 'You have accumulated too many wounds and lost the game. Better luck next time!'}
        </p>
        <button className="new-game-button" onClick={onNewGame}>
          Start New Game
        </button>
      </div>
    </div>
  );
};