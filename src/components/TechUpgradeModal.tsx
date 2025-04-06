import React from 'react';
import { BuildingType } from '../types';
import './TechUpgradeModal.css';

interface TechUpgradeModalProps {
  techTier: number;
  building?: BuildingType | null;
  onClose: () => void; // A function to close the modal (might not be needed if placement is mandatory)
}

const TechUpgradeModal: React.FC<TechUpgradeModalProps> = ({ techTier, building, onClose }) => {
  let title = `Tech Tier ${techTier} Reached!`;
  let description = '';
  let buildingInfo = '';

  switch (techTier) {
    case 2:
      title = 'Tech Tier 2: Advanced Resource Processing';
      description = 'You can now place a Resource Depot on an empty tile.';
      buildingInfo = '🏭 Resource Depot: Tiles with this building grant +1 additional Gold and +1 additional Card Draw when a card providing that resource is played there.';
      break;
    case 3:
      title = 'Tech Tier 3: Refining & Base Enhancements';
      description = 'You can now place a Refinery on an empty tile. Your base cards have also been upgraded!';
      buildingInfo = '⚙️ Refinery: Automatically gain the benefit of the land type on this tile at the start of each turn.\n\nCard Upgrades:\n- Copper: Now provides +2 Gold.\n- Defend: Now provides +4 Defense.\n- Til the Land: Now provides +1 Gold in addition to the land benefit.\n- Cards costing up to 10 are unlocked.';
      break;
    case 4:
      title = 'Tech Tier 4: Echo Technology';
      description = 'You can now place an Echo Chamber on an empty tile.';
      buildingInfo = '🔮 Echo Chamber: All effects from a card played on this tile are duplicated (as if played twice).';
      break;
    default:
      // Should not happen for tiers 2, 3, 4
      return null; 
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="building-info">
          <pre>{buildingInfo}</pre> {/* Use pre for better formatting of newlines */}
        </div>
        <button onClick={onClose}>
          {building ? 'Place Building' : 'Continue'} 
        </button>
      </div>
    </div>
  );
};

export default TechUpgradeModal; 