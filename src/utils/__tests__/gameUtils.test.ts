import { applyLandBenefit } from '../gameUtils';
import { PlayerAttributes } from '../../types';

describe('applyLandBenefit', () => {
  const basePlayerAttributes: PlayerAttributes = {
    cardPlays: 0,
    buys: 0,
    gold: 0,
    cardDraw: 0,
    wounds: 0,
    techTier: 1,
    maxCardPlays: 4,
    maxBuys: 1,
    maxCardDraw: 5
  };

  describe('play land type', () => {
    it('should add 0.5 to each partial benefit on first benefit', () => {
      const { playerAttributes, partialBenefits } = applyLandBenefit(
        'play',
        basePlayerAttributes,
        false
      );

      expect(partialBenefits).toEqual({
        cardPlays: 0.5,
        cardDraw: 0.5,
        gold: 0.5
      });
      expect(playerAttributes).toEqual(basePlayerAttributes);
    });

    it('should add 1.0 to each partial benefit on double benefit', () => {
      const { playerAttributes, partialBenefits } = applyLandBenefit(
        'play',
        basePlayerAttributes,
        true
      );

      expect(partialBenefits).toEqual({
        cardPlays: 0,
        cardDraw: 0,
        gold: 0
      });
      expect(playerAttributes).toEqual({
        ...basePlayerAttributes,
        cardPlays: 1,
        cardDraw: 1,
        gold: 1
      });
    });

    it('should apply benefits when partial benefits reach whole numbers', () => {
      const { playerAttributes, partialBenefits } = applyLandBenefit(
        'play',
        basePlayerAttributes,
        false,
        {
          cardPlays: 0.5,
          cardDraw: 0.5,
          gold: 0.5
        }
      );

      expect(partialBenefits).toEqual({
        cardPlays: 0,
        cardDraw: 0,
        gold: 0
      });
      expect(playerAttributes).toEqual({
        ...basePlayerAttributes,
        cardPlays: 1,
        cardDraw: 1,
        gold: 1
      });
    });

    it('should handle multiple partial benefits correctly', () => {
      // First benefit
      const firstResult = applyLandBenefit(
        'play',
        basePlayerAttributes,
        false
      );

      // Second benefit
      const secondResult = applyLandBenefit(
        'play',
        firstResult.playerAttributes,
        false,
        firstResult.partialBenefits
      );

      expect(secondResult.partialBenefits).toEqual({
        cardPlays: 0,
        cardDraw: 0,
        gold: 0
      });
      expect(secondResult.playerAttributes).toEqual({
        ...basePlayerAttributes,
        cardPlays: 1,
        cardDraw: 1,
        gold: 1
      });
    });

    it('should handle double benefit with existing partial benefits', () => {
      const { playerAttributes, partialBenefits } = applyLandBenefit(
        'play',
        basePlayerAttributes,
        true,
        {
          cardPlays: 0.5,
          cardDraw: 0.5,
          gold: 0.5
        }
      );

      expect(partialBenefits).toEqual({
        cardPlays: 0.5,
        cardDraw: 0.5,
        gold: 0.5
      });
      expect(playerAttributes).toEqual({
        ...basePlayerAttributes,
        cardPlays: 1,
        cardDraw: 1,
        gold: 1
      });
    });
  });

  describe('card land type', () => {
    it('should directly increase card draw by 1', () => {
      const { playerAttributes, partialBenefits } = applyLandBenefit(
        'card',
        basePlayerAttributes,
        false
      );

      expect(partialBenefits).toEqual({
        cardPlays: 0,
        cardDraw: 0,
        gold: 0
      });
      expect(playerAttributes).toEqual({
        ...basePlayerAttributes,
        cardDraw: 1
      });
    });

    it('should double the card draw increase when doubled', () => {
      const { playerAttributes, partialBenefits } = applyLandBenefit(
        'card',
        basePlayerAttributes,
        true
      );

      expect(partialBenefits).toEqual({
        cardPlays: 0,
        cardDraw: 0,
        gold: 0
      });
      expect(playerAttributes).toEqual({
        ...basePlayerAttributes,
        cardDraw: 2
      });
    });
  });

  describe('gold land type', () => {
    it('should directly increase gold by 2', () => {
      const { playerAttributes, partialBenefits } = applyLandBenefit(
        'gold',
        basePlayerAttributes,
        false
      );

      expect(partialBenefits).toEqual({
        cardPlays: 0,
        cardDraw: 0,
        gold: 0
      });
      expect(playerAttributes).toEqual({
        ...basePlayerAttributes,
        gold: 2
      });
    });

    it('should double the gold increase when doubled', () => {
      const { playerAttributes, partialBenefits } = applyLandBenefit(
        'gold',
        basePlayerAttributes,
        true
      );

      expect(partialBenefits).toEqual({
        cardPlays: 0,
        cardDraw: 0,
        gold: 0
      });
      expect(playerAttributes).toEqual({
        ...basePlayerAttributes,
        gold: 4
      });
    });
  });
}); 