export type LandType = 'gold' | 'card' | 'play';

export interface Tile {
  landType: LandType;
  defense: number;
  damage: number;
  cardPlayed: Card | null;
}

export type CardType = 'Defense' | 'Gold' | 'Action';

export interface CardEffect {
  defense?: number;
  gold?: number;
  draw?: number;
  card_play?: number;
  buy?: number;
  tech?: number;
  land_benefit?: boolean;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  effects: CardEffect;
  description: string;
  emoji: string;
}

export interface PlayerAttributes {
  cardPlays: number;
  buys: number;
  gold: number;
  cardDraw: number;
  wounds: number;
  techTier: number;
  maxCardPlays: number;
  maxBuys: number;
  maxCardDraw: number;
}

export interface GameState {
  round: number;
  grid: Tile[][];
  hand: Card[];
  deck: Card[];
  discard: Card[];
  shop: Card[];
  player: PlayerAttributes;
  selectedCard: Card | null;
  gameOver: boolean;
  victory: boolean;
}