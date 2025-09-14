// Create graphics metadata file with accurate timestamps
import fs from 'fs';

// List of all graphics files
const graphicsFiles = [
  'cfbd-rushingYards-2025.png',
  'cfbd-netPassingYards-2025.png', 
  'cfbd-totalYards-2025.png',
  'cfbd-sacks-2025.png',
  'cfbd-totalYardsOpponent-2025.png',
  'cfbd-possessionTime-2025.png',
  'cfbd-thirdDownConversions-2025.png',
  'cfbd-penaltyYards-2025.png',
  'cfbd-turnoversOpponent-2025.png',
  'player-rushingYards-2025.png',
  'player-rushingTDs-2025.png',
  'player-passingYards-2025.png',
  'player-passingTDs-2025.png',
  'player-receivingYards-2025.png',
  'player-receivingTDs-2025.png',
  'player-sacks-2025.png'
];

// Create metadata object
const now = new Date().toISOString();
const metadata = {
  generatedAt: now,
  graphics: {}
};

// Set timestamp for each graphic file
graphicsFiles.forEach(filename => {
  metadata.graphics[filename] = now;
});

// Write metadata file
fs.writeFileSync('graphics-metadata.json', JSON.stringify(metadata, null, 2));

console.log('✅ Graphics metadata created:', now);
console.log('📁 Files tracked:', graphicsFiles.length);
