# Grid Build

A deck building game similar to Spirit Island and Dominion, with a grid-based play area, resource management, and tech tier progression.

## Game Overview

- Play cards on a 3x3 grid with different land types
- Defend against enemy attacks
- Buy new cards to improve your deck
- Advance through tech tiers to win

## How to Play

1. **Draw Cards**: Start each turn by drawing cards
2. **Play Cards**: Place cards on grid tiles to get their effects
3. **Buy Cards**: Use gold to buy new cards for your deck
4. **End Turn**: End your turn to face enemy attacks

## Victory and Defeat

- **Victory**: Reach Tech tier 5
- **Defeat**: Accumulate 6+ wounds in your deck

## Setup and Running

### Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open your browser at `http://localhost:3000`

### Production Build and Deployment

1. Build for production:
   ```
   npm run build
   ```

2. Deploy to GitHub Pages:
   ```
   npm run deploy:patch
   ```
   This command will:
   - Automatically increment the patch version (e.g., 0.1.0 → 0.1.1)
   - Build the project
   - Deploy to GitHub Pages
   - Create a Git tag for the version
   - Push changes to the repository

   The site will be available at: https://acker.github.io/grid_build

## Technologies Used

- React
- TypeScript
- CSS

## Game Mechanics

### Land Types
- **Gold (Yellow)**: +2 gold
- **Card (Blue)**: Draw 1 card
- **Play (Red)**: +0.5 card play

### Card Types
- **Defense**: Protect tiles from enemy attacks
- **Gold**: Generate gold for purchases
- **Action**: Various effects like drawing cards or advancing tech tiers

### Enemy Attacks
- Enemies attack random tiles with increasing difficulty as rounds progress
- Defend tiles with defense cards or suffer wounds