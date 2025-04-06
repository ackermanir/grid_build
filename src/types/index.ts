export type LandType = 'gold' | 'card' | 'play';

export interface Tile {
  landType: LandType;
  defense: number;
  damage: number;
  cardPlayed: Card | null;
  defenseHistory?: Array<{ defense: number, turnsRemaining: number }>;
  building?: BuildingType | null;
}

export type CardType = 'Defense' | 'Gold' | 'Action' | 'Tech';

export interface CardEffect {
  defense?: number;
  gold?: number;
  draw?: number;
  card_play?: number;
  buy?: number;
  tech?: number;
  land_benefit?: boolean;
  land_benefit_double?: boolean;
  discard_draw?: boolean;
  defense_adjacent?: boolean;
  defense_all_played?: boolean;
  defense_duration?: number;
  conditional_effect?: {
    condition: 'land_type';
    land_type?: LandType;
    effects: CardEffect;
  };
  special_effect?: 'missile_dome' | 'archives' | 'stone_skin' | 'durable_defense' | 'gold_rush';
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  shopNumber: number;
  effects: CardEffect;
  description: string;
  emoji: string;
  quantity?: number;
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
  pendingAttacks: {
    positions: [number, number][];
    damagePerAttack: number;
  };
  specialState?: {
    type: 'missile_dome' | 'archives';
    data: any;
  };
  goldRushEffects?: number;
  partialLandBenefits?: {
    cardPlays: number;
    cardDraw: number;
    gold: number;
  };
  buildingToPlace?: BuildingType | null;
  techTierJustReached?: number | null;
}

export type BuildingType = 'Resource Depot' | 'Refinery' | 'Echo Chamber';