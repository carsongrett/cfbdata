import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CFBD API configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = 'AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN';

// Player stats we want to track (using correct CFBD API stat types)
const PLAYER_STATS = [
  'rushingYards',    // YDS from rushing category
  'rushingTDs',      // TD from rushing category  
  'passingYards',    // YDS from passing category
  'passingTDs',      // TD from passing category
  'receivingYards',  // YDS from receiving category
  'receivingTDs',    // TD from receiving category
  'sacks'            // SACKS from defensive category
];

// Load team mapping (abbreviations + colors)
const teamMappingPath = path.join(__dirname, '..', 'data', 'team_mapping.json');
const teamMapping = JSON.parse(fs.readFileSync(teamMappingPath, 'utf8'));

// Define Power 5 conferences
const POWER5_CONFERENCES = ['SEC', 'Big Ten', 'ACC', 'Big 12', 'Pac-12'];

// Function to get team info (abbreviation + colors) by API team name
function getTeamInfo(teamName) {
  // Direct match first
  if (teamMapping[teamName]) {
    return teamMapping[teamName];
  }
  
  // Try partial matching for cases like "Miami (OH)" -> "Miami"
  const baseName = teamName.split(' (')[0];
  if (teamMapping[baseName]) {
    return teamMapping[baseName];
  }
  
  // No mapping found - return null to indicate no team display
  return null;
}

// Function to make API request
async function fetchCFBDData(endpoint) {
  const url = `${CFBD_BASE}${endpoint}`;
  console.log(`📡 Fetching: ${url}`);
  
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
}

// Function to filter players for Power 5 teams only
async function filterPower5Players(players) {
  console.log('🏈 Filtering for Power 5 teams only...');
  
  // Fetch team records to get conference information
  const records = await fetchCFBDData('/records?year=2025');
  
  // Create a map of team names to conferences
  const teamConferenceMap = {};
  records.forEach(team => {
    teamConferenceMap[team.team] = team.conference;
  });
  
  // Filter players for Power 5 teams only
  const power5Players = players.filter(player => {
    const conference = teamConferenceMap[player.team];
    return POWER5_CONFERENCES.includes(conference);
  });
  
  console.log(`📊 Total players: ${players.length}`);
  console.log(`🏆 Power 5 players: ${power5Players.length}`);
  
  return power5Players;
}

// Function to encode image to base64
function encodeImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.warn(`⚠️ Could not load image ${imagePath}:`, error.message);
    return null;
  }
}

// Function to get team logo path
function getTeamLogoPath(teamName) {
  // Team name mappings to actual logo file names
  const logoMappings = {
    'Alabama': 'Alabama_Crimson_Tide_logo-300x300.png',
    'Auburn': 'Auburn_Tigers_logo-300x300.png',
    'Florida': 'Florida_Gators_logo-300x300.png',
    'Georgia': 'Georgia_Bulldogs_logo-300x300.png',
    'Kentucky': 'Kentucky_Wildcats_logo-300x300.png',
    'LSU': 'LSU_Tigers-300x300.png',
    'Mississippi State': 'Mississippi_State_Bulldogs_logo-300x300.png',
    'Missouri': 'Missouri_Tigers_logo-300x300.png',
    'Ole Miss': 'Ole_Miss_Rebels_logo-300x300.png',
    'South Carolina': 'South_Carolina_Gamecocks_logo-300x300.png',
    'Tennessee': 'Tennessee_Volunteers_logo-300x300.png',
    'Texas': 'Texas_Longhorns_logo-300x300.png',
    'Texas A&M': 'Texas_AM_University_logo-300x300.png',
    'Vanderbilt': 'Vanderbilt_Commodores_logo-300x300.png',
    'Oklahoma': 'Oklahoma_Sooners_logo-300x300.png',
    'Arkansas': 'Arkansas_Razorbacks_logo-300x300.png',
    
    'Illinois': 'Illinois_Fighting_Illini_logo-300x300.png',
    'Indiana': 'Indiana_Hoosiers_logo-300x300.png',
    'Iowa': 'Iowa_Hawkeyes_logo-300x300.png',
    'Maryland': 'Maryland_Terrapins_logo-300x300.png',
    'Michigan': 'Michigan_Wolverines_logo-300x300.png',
    'Michigan State': 'Michigan_State_Spartans_logo-300x300.png',
    'Minnesota': 'Minnesota_Golden_Gophers_logo-300x300.png',
    'Nebraska': 'Nebraska_Cornhuskers_logo-300x300.png',
    'Northwestern': 'Northwestern_Wildcats_logo-300x300.png',
    'Ohio State': 'Ohio_State_Buckeyes_logo-300x300.png',
    'Penn State': 'Penn_State_Nittany_Lions_logo-300x300.png',
    'Purdue': 'Purdue_Boilermakers_logo-300x300.png',
    'Rutgers': 'Rutgers_Scarlet_Knights_logo-300x300.png',
    'Wisconsin': 'Wisconsin_Badgers_logo-300x300.png',
    'USC': 'USC_Trojans_logo-300x300.png',
    'UCLA': 'UCLA_Bruins-300x300.png',
    'Oregon': 'Oregon_Ducks_logo-300x300.png',
    'Washington': 'Washington_Huskies_logo-300x300.png',
    
    'Arizona': 'Arizona_Wildcats_logo-300x300.png',
    'Arizona State': 'Arizona_State_Sun_Devils_logo-300x300.png',
    'Baylor': 'Baylor_Bears_logo-300x300.png',
    'BYU': 'BYU_Cougars_logo-300x300.png',
    'Cincinnati': 'Cincinnati_Bearcats_logo-300x300.png',
    'Colorado': 'Colorado_Buffaloes_logo-300x300.png',
    'Houston': 'Houston_Cougars_logo-300x300.png',
    'Iowa State': 'Iowa_State_Cyclones_logo-300x300.png',
    'Kansas': 'Kansas_Jayhawks_logo-300x300.png',
    'Kansas State': 'Kansas_State_Wildcats_logo-300x300.png',
    'Oklahoma State': 'Oklahoma_State_Cowboys_logo-300x300.png',
    'TCU': 'TCU_Horned_Frogs_logo-300x300.png',
    'Texas Tech': 'Texas_Tech_Red_Raiders_logo-300x300.png',
    'UCF': 'UCF_Knights_logo-300x300.png',
    'Utah': 'Utah_Utes_logo-300x300.png',
    'West Virginia': 'West_Virginia_Mountaineers_logo-300x300.png',
    
    'Boston College': 'Boston_College_Eagles_logo-300x300.png',
    'Clemson': 'Clemson_Tigers_logo-300x300.png',
    'Duke': 'Duke_Blue_Devils_logo-300x300.png',
    'Florida State': 'Florida_State_Seminoles_logo-300x300.png',
    'Georgia Tech': 'Georgia_Tech_Yellow_Jackets_logo-300x300.png',
    'Louisville': 'Louisville_Cardinals_logo-300x300.png',
    'Miami': 'Miami_Hurricanes_logo-300x300.png',
    'North Carolina': 'North_Carolina_Tar_Heels_logo-300x300.png',
    'NC State': 'North_Carolina_State_Wolfpack_logo-300x300.png',
    'Pittsburgh': 'Pitt_Panthers_logo-300x300.png',
    'Syracuse': 'Syracuse_Orange_logo-300x300.png',
    'Virginia': 'Virginia_Cavaliers_logo-300x300.png',
    'Virginia Tech': 'Virginia_Tech_Hokies_logo-300x300.png',
    'Wake Forest': 'Wake_Forest_Demon_Deacons_logo-300x300.png',
    'California': 'California_Golden_Bears_logo-300x300.png',
    'Stanford': 'Stanford_Cardinal_logo-300x300.png',
    'SMU': 'SMU_Mustang_logo-300x300.png',
    
    'Oregon State': 'Oregon_State_Beavers_logo-300x300.png',
    'Washington State': 'Washington_State_Cougars_logo-300x300.png'
  };
  
  return logoMappings[teamName] || null;
}

// Process player stats from API response
function processPlayerStats(players) {
  console.log('📊 Processing player stats...');
  
  const playerStats = {};
  
  players.forEach(player => {
    const playerId = player.playerId;
    const playerName = player.player;
    const team = player.team;
    const category = player.category;
    const statType = player.statType;
    const statValue = parseFloat(player.stat);
    
    if (!playerStats[playerId]) {
      playerStats[playerId] = {
        playerId,
        name: playerName,
        team,
        stats: {},
        games: player.games || 3  // Default to 3 games if not available
      };
    }
    
    // Map API stat types to our internal stat names
    let statName = null;
    if (category === 'rushing' && statType === 'YDS') {
      statName = 'rushingYards';
    } else if (category === 'rushing' && statType === 'TD') {
      statName = 'rushingTDs';
    } else if (category === 'passing' && statType === 'YDS') {
      statName = 'passingYards';
    } else if (category === 'passing' && statType === 'TD') {
      statName = 'passingTDs';
    } else if (category === 'receiving' && statType === 'YDS') {
      statName = 'receivingYards';
    } else if (category === 'receiving' && statType === 'TD') {
      statName = 'receivingTDs';
    } else if (category === 'defensive' && statType === 'SACKS') {
      statName = 'sacks';
    }
    
    if (statName) {
      playerStats[playerId].stats[statName] = statValue;
    }
  });
  
  return Object.values(playerStats);
}

// Create player leaders data structure
async function createPlayerLeadersData(stat, players, teamRecordMap) {
  const statConfig = {
    rushingYards: { title: 'RUSHING YD LEADERS', totalUnit: 'YDS', perGameUnit: 'YPG', showBoth: true },
    rushingTDs: { title: 'RUSHING TD LEADERS', totalUnit: 'TD', perGameUnit: null, showBoth: false },
    passingYards: { title: 'PASSING YD LEADERS', totalUnit: 'YDS', perGameUnit: 'YPG', showBoth: true },
    passingTDs: { title: 'PASSING TD LEADERS', totalUnit: 'TD', perGameUnit: null, showBoth: false },
    receivingYards: { title: 'RECEIVING YD LEADERS', totalUnit: 'YDS', perGameUnit: 'YPG', showBoth: true },
    receivingTDs: { title: 'RECEIVING TD LEADERS', totalUnit: 'TD', perGameUnit: null, showBoth: false },
    sacks: { title: 'SACK LEADERS', totalUnit: 'SACKS', perGameUnit: null, showBoth: false }
  };
  
  const config = statConfig[stat];
  if (!config) {
    throw new Error(`Unknown stat: ${stat}`);
  }
  
  // Filter players who have this stat and sort by value
  const playersWithStat = players
    .filter(player => player.stats[stat] !== undefined)
    .sort((a, b) => b.stats[stat] - a.stats[stat])
    .slice(0, 6); // Top 6 players
  
  // Use the provided team record map
  
  const teams = playersWithStat.map((player, index) => {
    let value;
    
    if (config.showBoth) {
      // Display both total and per-game
      const totalValue = Math.round(player.stats[stat]);
      const perGameValue = player.games > 0 ? (player.stats[stat] / player.games).toFixed(1) : '0.0';
      value = `${totalValue.toLocaleString()} ${config.totalUnit} <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>${perGameValue}/G</span>`;
    } else {
      // Display total only
      value = `${Math.round(player.stats[stat])} ${config.totalUnit}`;
    }
    
    return {
      rank: index + 1,
      name: player.name,
      team: player.team,
      record: teamRecordMap[player.team] || '0-0',
      value: value
    };
  });
  
  return {
    type: stat,
    title: config.title,
    unit: config.unit,
    teams
  };
}

// Generate HTML for player leaders
function generatePlayerHTML(data) {
  // Try to load and encode the CFB Data logo
  const logoPath = path.join(__dirname, '..', 'assets', 'x_logo.png');
  let logoDataUrl = null;
  try {
    const imageBuffer = fs.readFileSync(logoPath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(logoPath).slice(1);
    logoDataUrl = `data:image/${ext};base64,${base64}`;
  } catch (error) {
    console.warn('⚠️ Could not load logo image:', error.message);
  }
  
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CFB Player Leaders</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        }
        
        .player-bar {
            height: 120px;
        }
        
        .rank-number {
            font-size: 5rem;
            font-weight: 900;
            line-height: 1;
        }
        
        .player-name {
            font-size: 4.5rem;
            font-weight: 800;
            line-height: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .stat-value {
            font-size: 3.5rem;
            font-weight: 700;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .title-text {
            font-size: 7rem;
            font-weight: 900;
            line-height: 0.9;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .footnote-text {
            font-size: 1rem;
            font-weight: 400;
            font-style: italic;
            opacity: 0.7;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .bottom-logo {
            width: 100px;
            height: 100px;
            object-fit: contain;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }
        
        .team-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        
        .team-record {
            font-size: 1.5rem;
            font-weight: 600;
            opacity: 0.9;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            margin-left: 8px;
        }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <div class="container mx-auto px-8 py-12 h-screen flex flex-col">
        
        <!-- Header -->
        <div class="flex flex-col items-center justify-center mb-8">
            <div class="text-center">
                <h1 class="title-text">${data.title}</h1>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 flex flex-col">
            <!-- Players Container -->
            <div class="flex-1 flex flex-col justify-center space-y-4 mb-6">
                ${data.teams.map(player => {
                  const teamInfo = getTeamInfo(player.team);
                  const backgroundColor = teamInfo ? teamInfo.primary : '#666666';
                  
                  // Get team logo
                  const logoFileName = getTeamLogoPath(player.team);
                  const logoPath = logoFileName ? path.join(__dirname, '..', 'assets', 'team icons', logoFileName) : null;
                  const logoDataUrl = logoPath && fs.existsSync(logoPath) ? encodeImageToBase64(logoPath) : null;
                  
                  let logoHtml = '';
                  if (logoDataUrl) {
                    logoHtml = `<img src="${logoDataUrl}" alt="${player.team} Logo" class="team-logo">`;
                  }
                  
                  // Get team record
                  const teamRecord = player.record || '0-0';
                  
                  return `<!-- Player ${player.rank} -->
                <div class="player-bar rounded-lg flex items-center px-8 shadow-lg" style="background-color: ${backgroundColor}">
                    <div class="rank-number text-white mr-8">${player.rank}</div>
                    <div class="flex-1 flex items-center justify-between">
                        <div class="player-name text-white">${player.name.toUpperCase()}</div>
                        <div class="flex items-center">
                            ${logoHtml}
                            <div class="team-record text-white">${teamRecord}</div>
                        </div>
                    </div>
                    <div class="text-white stat-value ml-8">${player.value}</div>
                </div>`;
                }).join('\n')}
            </div>
        </div>
        
        <!-- Footer -->
        <div class="flex items-center justify-between w-full">
            <div class="flex-1"></div>
            <div class="flex-1 flex justify-center">
                ${logoDataUrl ? `<img src="${logoDataUrl}" alt="CFB Data" class="bottom-logo">` : ''}
            </div>
            <div class="flex-1 flex justify-end">
                <p class="footnote-text">power 5</p>
            </div>
        </div>
        
    </div>
</body>
</html>`;

  return template;
}

// Generate PNG from HTML
async function generatePNG(data, outputPath) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport size for taller graphic to fit all 6 players
  await page.setViewportSize({ width: 1600, height: 1200 });
  
  // Generate HTML content
  const htmlContent = generatePlayerHTML(data);
  
  // Write HTML to temporary file for proper logo loading
  const tempHtmlPath = path.join(__dirname, '..', 'output', 'temp-player-graphic.html');
  fs.writeFileSync(tempHtmlPath, htmlContent);
  
  // Load the HTML file directly from its path for proper logo loading
  await page.goto('file://' + tempHtmlPath);
  
  // Wait for fonts to load specifically
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for fonts to load by checking if Inter font is available
  await page.evaluate(() => {
    return document.fonts.ready;
  });
  
  // Additional wait to ensure fonts are rendered
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({
    path: outputPath,
    type: 'png',
    fullPage: false
  });
  
  // Clean up temporary file
  try {
    fs.unlinkSync(tempHtmlPath);
  } catch (error) {
    console.warn('⚠️ Could not delete temporary HTML file:', error.message);
  }
  
  await browser.close();
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Player Leaders generation...');
    console.log('🎨 Generating CFB Player Leaders from CFBD API...');
    console.log(`📊 Player Stats: ${PLAYER_STATS.join(', ')}`);
    
    // Fetch player data for each category (2025 data is available!)
    const allPlayers = [];
    
    // Map our stat names to API categories
    const categoryMap = {
      'rushingYards': 'rushing',
      'rushingTDs': 'rushing', 
      'passingYards': 'passing',
      'passingTDs': 'passing',
      'receivingYards': 'receiving',
      'receivingTDs': 'receiving',
      'sacks': 'defensive'
    };
    
    for (const stat of PLAYER_STATS) {
      const category = categoryMap[stat];
      console.log(`\n📡 Fetching ${stat} players from ${category} category...`);
      const players = await fetchCFBDData(`/stats/player/season?year=2025&category=${category}`);
      allPlayers.push(...players);
      
      // Add delay between API calls to avoid rate limiting
      console.log('⏳ Waiting 3 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Filter for Power 5 teams only
    const power5Players = await filterPower5Players(allPlayers);
    
    // Process data
    const processedPlayers = processPlayerStats(power5Players);
    console.log(`✅ Processed ${processedPlayers.length} Power 5 players`);
    
    // Fetch team records once for all stats
    console.log('📊 Fetching team records...');
    console.log('⏳ Waiting 3 seconds before fetching records...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    const records = await fetchCFBDData('/records?year=2025');
    const teamRecordMap = {};
    records.forEach(team => {
      teamRecordMap[team.team] = `${team.wins}-${team.losses}`;
    });
    console.log(`✅ Loaded records for ${Object.keys(teamRecordMap).length} teams`);
    
    // Generate graphics for each stat
    for (const stat of PLAYER_STATS) {
      console.log(`\n🎨 Generating ${stat} player leaders...`);
      
      const leadersData = await createPlayerLeadersData(stat, processedPlayers, teamRecordMap);
      
      // Generate HTML
      const htmlContent = generatePlayerHTML(leadersData);
      const htmlPath = path.join(__dirname, '..', 'output', `player-${stat}-2025.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`✅ HTML: ${htmlPath}`);
      
      // Generate PNG
      const pngPath = path.join(__dirname, '..', 'output', `player-${stat}-2025.png`);
      await generatePNG(leadersData, pngPath);
      console.log(`✅ PNG: ${pngPath}`);
    }
    
    console.log('\n🎉 All player graphics generated successfully!');
    console.log('📁 Check the output folder for HTML and PNG files');
    
  } catch (error) {
    console.error('💥 Error generating player graphics:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { generatePlayerHTML, generatePNG, getTeamInfo, createPlayerLeadersData, processPlayerStats, main };
