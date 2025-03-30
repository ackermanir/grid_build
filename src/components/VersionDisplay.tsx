import React from 'react';
import './VersionDisplay.css';

interface VersionDisplayProps {
  version: string;
  lastUpdated: string;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ version, lastUpdated }) => {
  return (
    <div className="version-display">
      <span className="version">v{version}</span>
      <span className="last-updated">Updated: {lastUpdated}</span>
    </div>
  );
}; 