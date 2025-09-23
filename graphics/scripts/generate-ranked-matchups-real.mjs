import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = 'AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN';

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
  const teamMappings = {
    'Georgia': 'Georgia_Bulldogs_logo-300x300.png',
    'Ohio State': 'Ohio_State_Buckeyes_logo-300x300.png',
    'Michigan': 'Michigan_Wolverines_logo-300x300.png',
    'Texas': 'Texas_Longhorns_logo-300x300.png',
    'Alabama': 'Alabama_Crimson_Tide_logo-300x300.png',
    'Penn State': 'Penn_State_Nittany_Lions_logo-300x300.png',
    'LSU': 'LSU_Tigers-300x300.png',
    'Oregon': 'Oregon_Ducks_logo-300x300.png',
    'Notre Dame': 'Notre_Dame_Fighting_Irish_logo-300x300.png',
    'Florida State': 'Florida_State_Seminoles_logo-300x300.png',
    'Auburn': 'Auburn_Tigers_logo-300x300.png',
    'Oklahoma': 'Oklahoma_Sooners_logo-300x300.png',
    'Washington': 'Washington_Huskies_logo-300x300.png',
    'USC': 'USC_Trojans_logo-300x300.png',
    'Tennessee': 'Tennessee_Volunteers_logo-300x300.png',
    'Miami': 'Miami_Hurricanes_logo-300x300.png',
    'Illinois': 'Illinois_Fighting_Illini_logo-300x300.png',
    'Texas A&M': 'Texas_AM_University_logo-300x300.png',
    'Ole Miss': 'Ole_Miss_Rebels_logo-300x300.png',
    'Utah': 'Utah_Utes_logo-300x300.png',
    'Texas Tech': 'Texas_Tech_Red_Raiders_logo-300x300.png',
    'Georgia Tech': 'Georgia_Tech_Yellow_Jackets_logo-300x300.png',
    'Vanderbilt': 'Vanderbilt_Commodores_logo-300x300.png',
    'South Carolina': 'South_Carolina_Gamecocks_logo-300x300.png',
    'Missouri': 'Missouri_Tigers_logo-300x300.png'
  };
  
  return teamMappings[teamName] || null;
}

// Function to truncate team names for display
function truncateTeamName(teamName) {
  const maxLength = 10;
  
  if (teamName.length <= maxLength) {
    return teamName;
  }
  
  // Common truncations for long team names
  const truncations = {
    'PENN STATE': 'PENN ST',
    'WASHINGTON': 'WASH',
    'FLORIDA STATE': 'FSU',
    'NOTRE DAME': 'ND',
    'OHIO STATE': 'OHIO ST',
    'MISSISSIPPI STATE': 'MSU',
    'TEXAS A&M': 'TEXAS A&M',
    'NORTH CAROLINA': 'UNC',
    'SOUTH CAROLINA': 'SCAR',
    'WEST VIRGINIA': 'WVU',
    'VIRGINIA TECH': 'VT',
    'GEORGIA TECH': 'GT',
    'CLEMSON': 'CLEMSON',
    'AUBURN': 'AUBURN',
    'VANDERBILT': 'VANDY'
  };
  
  const upperName = teamName.toUpperCase();
  return truncations[upperName] || teamName.substring(0, maxLength);
}

// Function to get team primary color
function getTeamColor(teamName) {
  const teamColors = {
    'Georgia': '#BA0C2F',
    'Ohio State': '#1F4E79',
    'Michigan': '#00274C',
    'Texas': '#BF5700',
    'Alabama': '#9E1B32',
    'Penn State': '#002147',
    'LSU': '#461D7C',
    'Oregon': '#154733',
    'Notre Dame': '#0C2340',
    'Florida State': '#782F40',
    'Auburn': '#0C2340',
    'Oklahoma': '#841617',
    'Washington': '#4B2E83',
    'USC': '#990000',
    'Tennessee': '#FF8200',
    'Miami': '#F47321',
    'Illinois': '#E84A27',
    'Texas A&M': '#500000',
    'Ole Miss': '#002147',
    'Utah': '#CC0000',
    'Texas Tech': '#CC0000',
    'Georgia Tech': '#B3A369',
    'Vanderbilt': '#866D4B',
    'South Carolina': '#73000A',
    'Missouri': '#F1B82D'
  };
  
  return teamColors[teamName] || '#666666';
}

// Function to load poll data from cache
function loadPollData() {
  try {
    const pollCachePath = path.join(__dirname, '..', '..', 'public', 'poll_cache.json');
    const pollData = JSON.parse(fs.readFileSync(pollCachePath, 'utf8'));
    
    console.log(`📊 Loaded poll data for Week ${pollData.lastWeek}, Season ${pollData.lastSeason}`);
    
    // Get the most recent AP poll
    const weeks = Object.keys(pollData.apPolls).sort((a, b) => parseInt(b) - parseInt(a));
    const latestWeek = weeks[0];
    const apPoll = pollData.apPolls[latestWeek];
    
    console.log(`🏆 Latest AP Poll (Week ${latestWeek}): ${apPoll.length} teams`);
    
    return {
      week: parseInt(latestWeek),
      season: pollData.lastSeason,
      apPoll: apPoll
    };
  } catch (error) {
    console.error('❌ Error loading poll data:', error.message);
    return null;
  }
}

// Function to find ranked matchups
async function findRankedMatchups(pollData) {
  try {
    const { week, season, apPoll } = pollData;
    
    // Create a map of team names to ranks for quick lookup
    const rankedTeams = new Map();
    apPoll.forEach(team => {
      rankedTeams.set(team.school, team.rank);
    });
    
    console.log(`🔍 Looking for games in Week ${week}...`);
    
    // Fetch games for the current week
    const gamesUrl = `/games?year=${season}&week=${week}&seasonType=regular`;
    const games = await fetchCFBDData(gamesUrl);
    
    console.log(`🎮 Found ${games.length} games in Week ${week}`);
    
    // Filter for games where both teams are ranked
    const rankedMatchups = [];
    
    games.forEach(game => {
      const homeRank = rankedTeams.get(game.homeTeam);
      const awayRank = rankedTeams.get(game.awayTeam);
      
      if (homeRank && awayRank) {
        rankedMatchups.push({
          homeTeam: {
            name: game.homeTeam,
            rank: homeRank,
            color: getTeamColor(game.homeTeam)
          },
          awayTeam: {
            name: game.awayTeam,
            rank: awayRank,
            color: getTeamColor(game.awayTeam)
          },
          gameId: game.id,
          date: game.startDate
        });
      }
    });
    
    // Sort by combined rank (lower combined rank = more important matchup)
    rankedMatchups.sort((a, b) => {
      const aCombined = a.homeTeam.rank + a.awayTeam.rank;
      const bCombined = b.homeTeam.rank + b.awayTeam.rank;
      return aCombined - bCombined;
    });
    
    console.log(`🏆 Found ${rankedMatchups.length} ranked matchups`);
    rankedMatchups.forEach(matchup => {
      console.log(`   #${matchup.homeTeam.rank} ${matchup.homeTeam.name} vs #${matchup.awayTeam.rank} ${matchup.awayTeam.name}`);
    });
    
    return rankedMatchups;
    
  } catch (error) {
    console.error('❌ Error finding ranked matchups:', error.message);
    return [];
  }
}

// Function to generate HTML template
function generateHTMLTemplate(matchups, week) {
  // Get your logo
  const yourLogoPath = path.join(__dirname, '..', 'assets', 'x_logo.png');
  const yourLogoDataUrl = encodeImageToBase64(yourLogoPath);
  
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=960, height=960, initial-scale=1.0">
    <title>Week ${week} Ranked Matchups</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .matchup-row {
            display: flex;
            align-items: center;
            background-color: #1f2937;
            border: 2px solid #374151;
            border-radius: 12px;
            margin-bottom: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            height: 140px;
        }
        .team-section {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            height: 100%;
        }
        .team-logo-container {
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
        }
        .team-logo-image {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        }
        .team-logo-text {
            color: #000;
            font-weight: 800;
            font-size: 2rem;
            text-align: center;
        }
        .team-info {
            text-align: left;
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
        }
        .team-rank {
            color: #fbbf24;
            font-size: 3rem;
            font-weight: 900;
            margin-bottom: 8px;
            line-height: 1;
        }
        .team-name {
            color: #fff;
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1;
        }
        .vs-section {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #374151;
            padding: 0 24px;
            min-width: 80px;
        }
        .vs-text {
            color: #fbbf24;
            font-size: 1.5rem;
            font-weight: 900;
        }
    </style>
</head>
<body class="bg-gray-900 text-white m-0 p-0">
    <div class="w-[960px] h-[960px] bg-gray-900 relative overflow-hidden">
        <!-- Main Content Container -->
        <div class="p-8 h-full flex flex-col">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="flex items-center justify-center mb-2">
                    <div class="h-px bg-white flex-1"></div>
                    <span class="text-white font-bold text-lg px-4">WEEK ${week}</span>
                    <div class="h-px bg-white flex-1"></div>
                </div>
                <h1 class="text-6xl font-black text-yellow-400 mb-2 tracking-tight">
                    RANKED MATCHUPS
                </h1>
                <p class="text-xl font-medium text-gray-400">Power 5 Only</p>
            </div>
            
            <!-- Matchups List -->
            <div class="flex-1 flex flex-col justify-center">
                <div class="space-y-4">
                    ${matchups.map((matchup, index) => {
                      const homeLogoFile = getTeamLogoPath(matchup.homeTeam.name);
                      const awayLogoFile = getTeamLogoPath(matchup.awayTeam.name);
                      
                      const homeLogoPath = homeLogoFile ? path.join(__dirname, '..', 'assets', 'team icons', homeLogoFile) : null;
                      const awayLogoPath = awayLogoFile ? path.join(__dirname, '..', 'assets', 'team icons', awayLogoFile) : null;
                      
                      const homeLogoDataUrl = homeLogoPath && fs.existsSync(homeLogoPath) ? encodeImageToBase64(homeLogoPath) : null;
                      const awayLogoDataUrl = awayLogoPath && fs.existsSync(awayLogoPath) ? encodeImageToBase64(awayLogoPath) : null;
                      
                      let homeLogoHtml;
                      if (homeLogoDataUrl) {
                        homeLogoHtml = `<img src="${homeLogoDataUrl}" alt="${matchup.homeTeam.name} Logo" class="team-logo-image" />`;
                      } else {
                        homeLogoHtml = `<div class="team-logo-text">${matchup.homeTeam.name.substring(0, 3).toUpperCase()}</div>`;
                      }
                      
                      let awayLogoHtml;
                      if (awayLogoDataUrl) {
                        awayLogoHtml = `<img src="${awayLogoDataUrl}" alt="${matchup.awayTeam.name} Logo" class="team-logo-image" />`;
                      } else {
                        awayLogoHtml = `<div class="team-logo-text">${matchup.awayTeam.name.substring(0, 3).toUpperCase()}</div>`;
                      }
                      
                      return `
                        <div class="matchup-row">
                            <div class="team-section" style="background-color: ${matchup.homeTeam.color}20;">
                                <div class="team-logo-container">
                                    ${homeLogoHtml}
                                </div>
                                <div class="team-info">
                                    <div class="team-rank">#${matchup.homeTeam.rank}</div>
                                    <div class="team-name">${truncateTeamName(matchup.homeTeam.name)}</div>
                                </div>
                            </div>
                            <div class="vs-section">
                                <div class="vs-text">VS</div>
                            </div>
                            <div class="team-section" style="background-color: ${matchup.awayTeam.color}20;">
                                <div class="team-info">
                                    <div class="team-rank">#${matchup.awayTeam.rank}</div>
                                    <div class="team-name">${truncateTeamName(matchup.awayTeam.name)}</div>
                                </div>
                                <div class="team-logo-container">
                                    ${awayLogoHtml}
                                </div>
                            </div>
                        </div>
                      `;
                    }).join('\n')}
                </div>
            </div>
            
            <!-- Footer -->
            <div class="flex justify-center items-center mt-4">
                <div class="flex items-center gap-2">
                    ${yourLogoDataUrl ? `<img src="${yourLogoDataUrl}" alt="Logo" class="h-20 w-20" />` : ''}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

  return template;
}

// Function to generate PNG from HTML
async function generatePNG(htmlContent, outputPath) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to match our graphic dimensions
  await page.setViewportSize({ width: 960, height: 960 });
  
  // Set the HTML content
  await page.setContent(htmlContent);
  
  // Wait for fonts to load
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    type: 'png'
  });
  
  await browser.close();
}

async function generateRankedMatchupsReal() {
  console.log('🚀 Starting real ranked matchups generation...\n');
  
  try {
    // Load poll data from cache
    const pollData = loadPollData();
    if (!pollData) {
      console.error('❌ Could not load poll data');
      return;
    }
    
    // Find ranked matchups
    const matchups = await findRankedMatchups(pollData);
    
    if (matchups.length === 0) {
      console.log('ℹ️ No ranked matchups found for this week');
      return;
    }
    
    // Limit to top 5 matchups for the graphic
    const topMatchups = matchups.slice(0, 5);
    
    console.log(`\n🎨 Generating ranked matchups graphic for Week ${pollData.week}...`);
    const htmlContent = generateHTMLTemplate(topMatchups, pollData.week);
    
    const htmlPath = path.join(__dirname, '..', 'output', 'ranked-matchups-real.html');
    const pngPath = path.join(__dirname, '..', 'output', 'ranked-matchups-real.png');
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ HTML: ${htmlPath}`);
    
    await generatePNG(htmlContent, pngPath);
    console.log(`✅ PNG: ${pngPath}`);
    
    console.log('\n🎉 Real ranked matchups graphic generated successfully!');
    console.log('📁 Check the output folder for HTML and PNG files');
    
  } catch (error) {
    console.error('❌ Error generating real ranked matchups:', error.message);
  }
}

// Run the generation
generateRankedMatchupsReal().then(() => {
  console.log('\n✅ Real ranked matchups generation completed!');
}).catch(error => {
  console.error('\n❌ Real ranked matchups generation failed:', error.message);
});
