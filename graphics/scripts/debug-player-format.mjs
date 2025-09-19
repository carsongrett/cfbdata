import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the player format logic
function testPlayerFormat() {
  const statConfig = {
    rushingYards: { title: 'RUSHING YD LEADERS', totalUnit: 'YDS', perGameUnit: 'YPG', showBoth: true },
    rushingTDs: { title: 'RUSHING TD LEADERS', totalUnit: 'TD', perGameUnit: null, showBoth: false }
  };
  
  const mockPlayers = [
    { name: 'Test Player 1', team: 'Georgia', stats: { rushingYards: 462 }, games: 3 },
    { name: 'Test Player 2', team: 'Alabama', stats: { rushingYards: 409 }, games: 3 }
  ];
  
  const stat = 'rushingYards';
  const config = statConfig[stat];
  
  console.log('Config:', config);
  console.log('showBoth:', config.showBoth);
  
  const playersWithStat = mockPlayers
    .filter(player => player.stats[stat] !== undefined)
    .sort((a, b) => b.stats[stat] - a.stats[stat])
    .slice(0, 6);
  
  console.log('Players with stat:', playersWithStat.length);
  
  const teams = playersWithStat.map((player, index) => {
    let value;
    
    console.log(`Processing player ${index + 1}:`, player.name, 'showBoth:', config.showBoth);
    
    if (config.showBoth) {
      // Display both total and per-game
      const totalValue = Math.round(player.stats[stat]);
      const perGameValue = player.games > 0 ? (player.stats[stat] / player.games).toFixed(1) : '0.0';
      value = `${totalValue.toLocaleString()} ${config.totalUnit} <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>${perGameValue}/G</span>`;
      console.log('Generated value:', value);
    } else {
      // Display total only
      value = `${Math.round(player.stats[stat])} ${config.totalUnit}`;
      console.log('Generated value (total only):', value);
    }
    
    return {
      rank: index + 1,
      name: player.name,
      team: player.team,
      value: value
    };
  });
  
  console.log('Final teams:', teams);
}

testPlayerFormat();
