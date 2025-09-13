import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CFBD API configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = process.env.CFBD_API_KEY;

if (!API_KEY) {
  console.error('❌ CFBD_API_KEY environment variable is required');
  console.log('Set it with: $env:CFBD_API_KEY="your-api-key"');
  process.exit(1);
}

// Function to make API requests
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

// Function to get team statistics
async function getTeamStats(year = 2024) {
  console.log(`📊 Fetching team statistics for ${year}...`);
  
  try {
    // Get team stats
    const stats = await fetchCFBDData(`/stats/team/season?year=${year}`);
    
    // Get team records
    const records = await fetchCFBDData(`/records?year=${year}`);
    
    // Combine data
    const teamData = stats.map(team => {
      const record = records.find(r => r.team === team.team);
      return {
        team: team.team,
        games: team.games,
        wins: record?.total?.wins || 0,
        losses: record?.total?.losses || 0,
        ties: record?.total?.ties || 0,
        pointsPerGame: team.offense?.pointsPerGame || 0,
        totalOffense: team.offense?.totalYards || 0,
        totalDefense: team.defense?.totalYards || 0,
        passingYards: team.offense?.passingYards || 0,
        rushingYards: team.offense?.rushingYards || 0
      };
    });
    
    return teamData;
  } catch (error) {
    console.error('❌ Error fetching team stats:', error.message);
    throw error;
  }
}

// Function to create leaders data from CFBD stats
function createLeadersFromStats(stats, type) {
  let sortedTeams = [];
  let title = '';
  let subtitle = 'VIA CFB DATA';
  
  switch (type) {
    case 'points_scorers':
      sortedTeams = stats
        .filter(team => team.pointsPerGame > 0)
        .sort((a, b) => b.pointsPerGame - a.pointsPerGame)
        .slice(0, 5);
      title = 'TOP 5 POINTS SCORERS';
      break;
      
    case 'offensive_yards':
      sortedTeams = stats
        .filter(team => team.totalOffense > 0)
        .sort((a, b) => b.totalOffense - a.totalOffense)
        .slice(0, 5);
      title = 'TOP 5 OFFENSIVE YARDS';
      break;
      
    case 'defensive_yards':
      sortedTeams = stats
        .filter(team => team.totalDefense > 0)
        .sort((a, b) => a.totalDefense - b.totalDefense)
        .slice(0, 5);
      title = 'LEAST YARDS ALLOWED';
      break;
      
    case 'passing_yards':
      sortedTeams = stats
        .filter(team => team.passingYards > 0)
        .sort((a, b) => b.passingYards - a.passingYards)
        .slice(0, 5);
      title = 'TOP 5 PASSING YARDS';
      break;
      
    case 'rushing_yards':
      sortedTeams = stats
        .filter(team => team.rushingYards > 0)
        .sort((a, b) => b.rushingYards - a.rushingYards)
        .slice(0, 5);
      title = 'TOP 5 RUSHING YARDS';
      break;
      
    default:
      throw new Error(`Unknown leader type: ${type}`);
  }
  
  return {
    title,
    subtitle,
    showRecords: true,
    type,
    teams: sortedTeams.map((team, index) => ({
      rank: index + 1,
      name: team.team,
      record: `${team.wins}-${team.losses}`,
      conference: team.conference || 'Unknown',
      value: getValueForType(team, type)
    }))
  };
}

// Function to get the display value based on leader type
function getValueForType(team, type) {
  switch (type) {
    case 'points_scorers':
      return `${team.pointsPerGame.toFixed(1)} PPG`;
    case 'offensive_yards':
      return `${team.totalOffense.toFixed(1)} YPG`;
    case 'defensive_yards':
      return `${team.totalDefense.toFixed(1)} YPG`;
    case 'passing_yards':
      return `${team.passingYards.toFixed(1)} YPG`;
    case 'rushing_yards':
      return `${team.rushingYards.toFixed(1)} YPG`;
    default:
      return `${team.wins}-${team.losses}`;
  }
}

// Main function
async function main() {
  try {
    const leaderType = process.argv[2] || 'points_scorers';
    const year = process.argv[3] || '2024';
    
    console.log(`🎨 Generating CFB Leaders graphic from CFBD API...`);
    console.log(`📊 Leader type: ${leaderType}`);
    console.log(`📅 Year: ${year}`);
    
    // Fetch data from CFBD API
    const stats = await getTeamStats(year);
    console.log(`✅ Fetched data for ${stats.length} teams`);
    
    // Create leaders data
    const leadersData = createLeadersFromStats(stats, leaderType);
    
    // Save data to file
    const dataPath = path.join(__dirname, '..', 'data', `cfbd-${leaderType}-${year}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(leadersData, null, 2));
    console.log(`💾 Saved data to: ${dataPath}`);
    
    // Generate graphic
    const { generateHTML, generatePNG } = await import('./generate-leaders.mjs');
    
    // Generate HTML
    const htmlContent = generateHTML(leadersData);
    const htmlOutputPath = path.join(__dirname, '..', 'output', `cfbd-${leaderType}-${year}.html`);
    fs.writeFileSync(htmlOutputPath, htmlContent);
    console.log(`✅ HTML generated: ${htmlOutputPath}`);
    
    // Generate PNG
    const pngOutputPath = path.join(__dirname, '..', 'output', `cfbd-${leaderType}-${year}.png`);
    await generatePNG(leadersData, pngOutputPath);
    console.log(`✅ PNG generated: ${pngOutputPath}`);
    
    console.log('🌐 Open the HTML file in a browser to preview');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Show usage if no arguments
if (process.argv.length < 3) {
  console.log('🎨 CFB Leaders Graphics Generator (CFBD API)');
  console.log('');
  console.log('Usage: node fetch-cfbd-stats.mjs <leader-type> [year]');
  console.log('');
  console.log('Available leader types:');
  console.log('  - points_scorers    (Points per game)');
  console.log('  - offensive_yards   (Total offensive yards)');
  console.log('  - defensive_yards   (Least yards allowed)');
  console.log('  - passing_yards     (Passing yards)');
  console.log('  - rushing_yards     (Rushing yards)');
  console.log('');
  console.log('Examples:');
  console.log('  node fetch-cfbd-stats.mjs points_scorers 2024');
  console.log('  node fetch-cfbd-stats.mjs offensive_yards 2023');
  console.log('  node fetch-cfbd-stats.mjs defensive_yards 2024');
  console.log('');
  console.log('Note: Requires CFBD_API_KEY environment variable');
  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting CFBD stats fetch...');
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

