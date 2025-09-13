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
        stats: {}
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
function createPlayerLeadersData(stat, players) {
  const statConfig = {
    rushingYards: { title: 'RUSHING YD LEADERS', unit: 'YDS' },
    rushingTDs: { title: 'RUSHING TD LEADERS', unit: 'TD' },
    passingYards: { title: 'PASSING YD LEADERS', unit: 'YDS' },
    passingTDs: { title: 'PASSING TD LEADERS', unit: 'TD' },
    receivingYards: { title: 'RECEIVING YD LEADERS', unit: 'YDS' },
    receivingTDs: { title: 'RECEIVING TD LEADERS', unit: 'TD' },
    sacks: { title: 'SACK LEADERS', unit: 'SACKS' }
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
  
  const teams = playersWithStat.map((player, index) => ({
    rank: index + 1,
    name: player.name,
    team: player.team,
    value: `${Math.round(player.stats[stat])} ${config.unit}`
  }));
  
  return {
    type: stat,
    title: config.title,
    unit: config.unit,
    teams
  };
}

// Generate HTML for player leaders
function generatePlayerHTML(data) {
  // Try to load and encode the logo
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
        
        .team-bar {
            height: 90px;
        }
        
        .rank-number {
            font-size: 4rem;
            font-weight: 900;
            line-height: 1;
        }
        
        .team-name {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .team-subtext {
            font-size: 1.25rem;
            font-weight: 600;
            opacity: 0.9;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .title-text {
            font-size: 5rem;
            font-weight: 900;
            line-height: 0.9;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .subtitle-text {
            font-size: 2rem;
            font-weight: 700;
            opacity: 0.9;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <div class="container mx-auto px-8 py-12 h-screen flex flex-col">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
            <div class="flex items-center space-x-6">
                ${logoDataUrl ? `<img src="${logoDataUrl}" alt="X Logo" class="h-16 w-16">` : ''}
                <div>
                    <h1 class="title-text">${data.title}</h1>
                    <p class="subtitle-text">2025 SEASON</p>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 flex flex-col">
            <!-- Stats Header -->
            <div class="mb-6">
                <div class="text-center">
                    <div class="text-4xl font-bold text-gray-300 mb-2">TOP 6 PLAYERS</div>
                </div>
            </div>
            
            <!-- Players Container -->
            <div class="flex-1 flex flex-col justify-center space-y-3">
                ${data.teams.map(player => {
                  // Player format: PLAYER NAME + TEAM ABBREV on left, stat on far right
                  const teamInfo = getTeamInfo(player.team);
                  const displayName = teamInfo ? 
                    `${player.name.toUpperCase()} <span class="italic">${teamInfo.abbr}</span>` : 
                    player.name.toUpperCase();
                  const backgroundColor = teamInfo ? teamInfo.primary : '#666666';
                  
                  return `<!-- Player ${player.rank} -->
                <div class="team-bar rounded-lg flex items-center px-8 shadow-lg" style="background-color: ${backgroundColor}">
                    <div class="rank-number text-white mr-8">${player.rank}</div>
                    <div class="flex-1">
                        <div class="team-name text-white">${displayName}</div>
                    </div>
                    <div class="text-white text-5xl font-bold">${player.value}</div>
                </div>`;
                }).join('\n')}
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
  
  // Set viewport size for 1600x900 graphic
  await page.setViewportSize({ width: 1600, height: 900 });
  
  // Block external resources to prevent timeouts
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('cdn.tailwindcss.com') || url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
      route.abort();
    } else {
      route.continue();
    }
  });
  
  const htmlContent = generatePlayerHTML(data);
  
  // Set the HTML content
  await page.setContent(htmlContent);
  
  // Wait for DOM to be ready (shorter timeout)
  await page.waitForLoadState('domcontentloaded');
  
  // Add a small delay to ensure rendering is complete
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({
    path: outputPath,
    type: 'png',
    fullPage: false
  });
  
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
    }
    
    // Process data
    const processedPlayers = processPlayerStats(allPlayers);
    console.log(`✅ Processed ${processedPlayers.length} players`);
    
    // Generate graphics for each stat
    for (const stat of PLAYER_STATS) {
      console.log(`\n🎨 Generating ${stat} player leaders...`);
      
      const leadersData = createPlayerLeadersData(stat, processedPlayers);
      
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
