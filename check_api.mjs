const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = 'AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN';

async function checkAPI() {
  try {
    const response = await fetch(`${CFBD_BASE}/stats/season?year=2025`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Sample team stats:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
    
    console.log('\nAll unique stat names:');
    const statNames = [...new Set(data.map(item => item.statName))];
    statNames.sort().forEach(name => console.log(name));
    
    // Check if there are games played stats
    const gamesStats = data.filter(item => item.statName.includes('games') || item.statName.includes('Games'));
    console.log('\nGames-related stats:');
    gamesStats.forEach(stat => console.log(`${stat.statName}: ${stat.statValue} (${stat.team})`));
    
    // Check for rushing yards and games for a specific team
    const airForceStats = data.filter(item => item.team === 'Air Force' && (item.statName === 'rushingYards' || item.statName === 'games'));
    console.log('\nAir Force rushing and games:');
    airForceStats.forEach(stat => console.log(`${stat.statName}: ${stat.statValue}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAPI();
