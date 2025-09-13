import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTML, generatePNG, getTeamColors, generateTeamLogo } from './generate-leaders.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CFBD API configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = 'AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN';

// Stats we want to track
const DESIRED_STATS = [
  'points',
  'rushingYards', 
  'passingYards',
  'totalYards',
  'defensivePoints',
  'sacks',
  'defensiveYards'
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
    'points': 'TOP 5 POINTS SCORERS',
    'rushingYards': 'TEAM RUSHING LEADERS',
    'passingYards': 'TEAM PASSING LEADERS',
    'totalYards': 'TOP 5 TOTAL OFFENSE',
    'defensivePoints': 'LEAST POINTS ALLOWED',
    'sacks': 'TOP 5 SACKS',
    'defensiveYards': 'LEAST YARDS ALLOWED'
  };
  
  const units = {
    'points': 'PPG',
    'rushingYards': 'YDS',
    'passingYards': 'YDS',
    'totalYards': 'YPG', 
    'defensivePoints': 'PPG',
    'sacks': 'SACKS',
    'defensiveYards': 'YPG'
  };
  
  // Filter teams that have this stat
  const teamsWithStat = teams.filter(team => team.stats[statName] !== undefined);
  
  // Sort by stat value (ascending for defensive stats, descending for offensive)
  const sortedTeams = teamsWithStat.sort((a, b) => {
    const aValue = a.stats[statName] || 0;
    const bValue = b.stats[statName] || 0;
    return isDefensive ? aValue - bValue : bValue - aValue;
  });
  
  // Take top 5
  const top5 = sortedTeams.slice(0, 5);
  
  return {
    title: titles[statName],
    subtitle: 'VIA CFB DATA',
    showRecords: true,
    type: statName,
    teams: top5.map((team, index) => ({
      rank: index + 1,
      name: team.team,
      record: `${team.wins || 0}-${team.losses || 0}`,
      conference: team.conference || 'Unknown',
      value: `${Math.round(team.stats[statName])} ${units[statName]}`
    }))
  };
}

// Function to generate all leader graphics
async function generateAllLeaders(teams, teamIdMapping) {
  const leaderTypes = [
    { stat: 'points', defensive: false },
    { stat: 'rushingYards', defensive: false },
    { stat: 'passingYards', defensive: false },
    { stat: 'totalYards', defensive: false },
    { stat: 'defensivePoints', defensive: true },
    { stat: 'sacks', defensive: false },
    { stat: 'defensiveYards', defensive: true }
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
    
    // Fetch data (3 API calls total)
    console.log('\n📡 Fetching season stats...');
    const statsData = await fetchCFBDData('/stats/season?year=2025');
    
    console.log('📡 Fetching team records...');
    const recordsData = await fetchCFBDData('/records?year=2025');
    
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
