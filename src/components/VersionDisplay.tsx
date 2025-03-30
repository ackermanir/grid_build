import React from 'react';
import './VersionDisplay.css';
import { version, lastUpdated } from '../version';

const VersionDisplay: React.FC = () => {
  return (
    <div className="version-display">
      <div>Version: {version}</div>
      <div>Last Updated: {lastUpdated}</div>
    </div>
  );
};

export default VersionDisplay; 