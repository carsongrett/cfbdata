import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTML, generatePNG, getTeamColors, generateTeamLogo } from './generate-leaders.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CFBD API configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = process.env.CFBD_API_KEY || 'vWJ5SPrCVwGbFMQEb+qepkkcU+GVRy+cQLg6QqN2v0+1DHxVEPDUR01WWulIfji2';

// Stats we want to track (using correct CFBD API stat names)
const DESIRED_STATS = [
  'rushingYards', 
  'netPassingYards',        // was 'passingYards'
  'totalYards',
  'sacks',
  'totalYardsOpponent',     // was 'defensiveYards'
  'possessionTime',         // possession time leaders
  'thirdDownConversions',   // 3rd down conv. leaders
  'penaltyYards',           // most team penalty yards
  'turnoversOpponent',      // most turnovers forced
  'games'                   // games played for YPG calculations
];

// Function to make API request
async function fetchCFBDData(endpoint) {
  const url = `${CFBD_BASE}${endpoint}`;
  console.log(`📡 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error.message);
    throw error;
  }
}

// Function to create team name to ID mapping
function createTeamIdMapping(teamsData) {
  const mapping = {};
  teamsData.forEach(team => {
    mapping[team.school] = team.id;
  });
  return mapping;
}

// Function to process team stats data
function processTeamStats(statsData, recordsData) {
  console.log('📊 Processing team stats...');
  
  // Group stats by team
  const teamStats = {};
  
  statsData.forEach(stat => {
    if (DESIRED_STATS.includes(stat.statName)) {
      if (!teamStats[stat.team]) {
        teamStats[stat.team] = {
          team: stat.team,
          conference: stat.conference,
          stats: {}
        };
      }
      teamStats[stat.team].stats[stat.statName] = stat.statValue;
    }
  });
  
  // Add win/loss records
  recordsData.forEach(record => {
    if (teamStats[record.team]) {
      teamStats[record.team].wins = record.total.wins;
      teamStats[record.team].losses = record.total.losses;
    }
  });
  
  return Object.values(teamStats).filter(team => 
    team.stats && Object.keys(team.stats).length > 0
  );
}

// Function to create leaders data for a specific stat
function createLeadersData(teams, statName, isDefensive = false) {
  const titles = {
    'rushingYards': 'TEAM RUSHING LEADERS',
    'netPassingYards': 'TEAM PASSING LEADERS',
    'totalYards': 'TOP 6 TOTAL OFFENSE',
    'sacks': 'TEAM SACK LEADERS',
    'totalYardsOpponent': 'LEAST YARDS ALLOWED',
    'possessionTime': 'POSSESSION TIME LEADERS',
    'thirdDownConversions': '3RD DOWN CONV. LEADERS',
    'penaltyYards': 'MOST TEAM PENALTY YDS',
    'turnoversOpponent': 'MOST TURNOVERS FORCED'
  };
  
  const units = {
    'rushingYards': { total: 'YDS', perGame: 'YPG', showBoth: true },
    'netPassingYards': { total: 'YDS', perGame: 'YPG', showBoth: true },
    'totalYards': { total: 'YDS', perGame: 'YPG', showBoth: true },
    'sacks': { total: 'SACKS', perGame: null, showBoth: false },
    'totalYardsOpponent': { total: 'YDS', perGame: 'YPG', showBoth: true },
    'possessionTime': { total: null, perGame: 'MINS', showBoth: false },
    'thirdDownConversions': { total: 'CONV', perGame: null, showBoth: false },
    'penaltyYards': { total: 'YDS', perGame: null, showBoth: false },
    'turnoversOpponent': { total: 'TO', perGame: null, showBoth: false }
  };
  
  // Filter teams that have this stat
  const teamsWithStat = teams.filter(team => team.stats[statName] !== undefined);
  
  // Calculate YPG for stats that need per-game calculations
  const statsNeedingYPG = ['rushingYards', 'netPassingYards', 'totalYards', 'totalYardsOpponent'];
  
  statsNeedingYPG.forEach(stat => {
    if (statName === stat) {
      teamsWithStat.forEach(team => {
        if (team.stats.games && team.stats.games > 0) {
          const ypgKey = stat === 'totalYardsOpponent' ? 'defensiveYPG' : `${stat}YPG`;
          team.stats[ypgKey] = team.stats[stat] / team.stats.games;
        } else {
          const ypgKey = stat === 'totalYardsOpponent' ? 'defensiveYPG' : `${stat}YPG`;
          team.stats[ypgKey] = 0;
        }
      });
    }
  });
  
  // Sort by stat value (ascending for defensive stats, descending for offensive)
  const sortedTeams = teamsWithStat.sort((a, b) => {
    let aValue, bValue;
    
    if (statName === 'rushingYards') {
      // Use YPG for rushing yards
      aValue = a.stats.rushingYPG || 0;
      bValue = b.stats.rushingYPG || 0;
    } else if (statName === 'netPassingYards') {
      // Use YPG for net passing yards
      aValue = a.stats.netPassingYardsYPG || 0;
      bValue = b.stats.netPassingYardsYPG || 0;
    } else if (statName === 'totalYards') {
      // Use YPG for total yards
      aValue = a.stats.totalYardsYPG || 0;
      bValue = b.stats.totalYardsYPG || 0;
    } else if (statName === 'totalYardsOpponent') {
      // Use YPG for total yards allowed (defensive)
      aValue = a.stats.defensiveYPG || 0;
      bValue = b.stats.defensiveYPG || 0;
    } else {
      aValue = a.stats[statName] || 0;
      bValue = b.stats[statName] || 0;
    }
    
    return isDefensive ? aValue - bValue : bValue - aValue;
  });
  
  // Take top 6
  const top6 = sortedTeams.slice(0, 6);
  
  return {
    title: titles[statName],
    subtitle: 'VIA CFB DATA',
    showRecords: true,
    type: statName,
    teams: top6.map((team, index) => {
      let displayValue;
      const unitConfig = units[statName];
      
      if (unitConfig.showBoth) {
        // Display both total and per-game
        const totalValue = Math.round(team.stats[statName]);
        let perGameValue;
        
        if (statName === 'rushingYards') {
          perGameValue = (team.stats.rushingYPG || 0).toFixed(1);
        } else if (statName === 'netPassingYards') {
          perGameValue = (team.stats.netPassingYardsYPG || 0).toFixed(1);
        } else if (statName === 'totalYards') {
          perGameValue = (team.stats.totalYardsYPG || 0).toFixed(1);
        } else if (statName === 'totalYardsOpponent') {
          perGameValue = (team.stats.defensiveYPG || 0).toFixed(1);
        }
        
        displayValue = `${totalValue.toLocaleString()} ${unitConfig.total} <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>${perGameValue}/G</span>`;
      } else if (unitConfig.perGame) {
        // Display per-game only
        let perGameValue;
        if (statName === 'possessionTime') {
          perGameValue = Math.round(team.stats[statName]);
        } else {
          perGameValue = (team.stats[statName] || 0).toFixed(1);
        }
        displayValue = `${perGameValue} ${unitConfig.perGame}`;
      } else {
        // Display total only
        displayValue = `${Math.round(team.stats[statName])} ${unitConfig.total}`;
      }
      
      return {
        rank: index + 1,
        name: team.team,
        record: `${team.wins || 0}-${team.losses || 0}`,
        conference: team.conference || 'Unknown',
        value: displayValue
      };
    })
  };
}

// Function to generate all leader graphics
async function generateAllLeaders(teams, teamIdMapping) {
  const leaderTypes = [
    { stat: 'rushingYards', defensive: false },
    { stat: 'netPassingYards', defensive: false },
    { stat: 'totalYards', defensive: false },
    { stat: 'sacks', defensive: false },
    { stat: 'totalYardsOpponent', defensive: true },
    { stat: 'possessionTime', defensive: false },
    { stat: 'thirdDownConversions', defensive: false },
    { stat: 'penaltyYards', defensive: false },
    { stat: 'turnoversOpponent', defensive: false }
  ];
  
  for (const { stat, defensive } of leaderTypes) {
    console.log(`\n🎨 Generating ${stat} leaders...`);
    
    const leadersData = createLeadersData(teams, stat, defensive);
    
    // Generate HTML
    const htmlContent = generateHTML(leadersData, teamIdMapping);
    const htmlPath = path.join(__dirname, '..', 'output', `cfbd-${stat}-2025.html`);
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ HTML: ${htmlPath}`);
    
    // Generate PNG
    const pngPath = path.join(__dirname, '..', 'output', `cfbd-${stat}-2025.png`);
    await generatePNG(leadersData, pngPath, teamIdMapping);
    console.log(`✅ PNG: ${pngPath}`);
  }
}

// Main function
async function main() {
  try {
    console.log('🎨 Generating CFB Leaders from CFBD API...');
    console.log(`📊 Stats: ${DESIRED_STATS.join(', ')}`);
    
    // Add initial delay to stagger requests from other scripts
    console.log('⏳ Waiting 5 seconds to stagger API requests...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Fetch data (3 API calls total)
    console.log('\n📡 Fetching season stats...');
    const statsData = await fetchCFBDData('/stats/season?year=2025');
    
    console.log('⏳ Waiting 3 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📡 Fetching team records...');
    const recordsData = await fetchCFBDData('/records?year=2025');
    
    console.log('⏳ Waiting 3 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📡 Fetching team data...');
    const teamsData = await fetchCFBDData('/teams?year=2025');
    
    // Process data
    const teams = processTeamStats(statsData, recordsData);
    const teamIdMapping = createTeamIdMapping(teamsData);
    console.log(`✅ Processed ${teams.length} teams`);
    
    // Generate all leader graphics
    await generateAllLeaders(teams, teamIdMapping);
    
    console.log('\n🎉 All graphics generated successfully!');
    console.log('📁 Check the output folder for HTML and PNG files');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting CFBD leaders generation...');
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
} else {
  // Also run if this is the main module
  console.log('🚀 Starting CFBD leaders generation (fallback)...');
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}
