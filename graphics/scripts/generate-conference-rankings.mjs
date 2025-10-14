import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CFBD API configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = process.env.CFBD_API_KEY || 'vWJ5SPrCVwGbFMQEb+qepkkcU+GVRy+cQLg6QqN2v0+1DHxVEPDUR01WWulIfji2';

// Power 5 conferences
const POWER5_CONFERENCES = [
  { name: 'SEC', fullName: 'SEC CONFERENCE', displayName: 'SEC RANKINGS' },
  { name: 'Big Ten', fullName: 'BIG TEN CONFERENCE', displayName: 'BIG TEN RANKINGS' },
  { name: 'ACC', fullName: 'ACC CONFERENCE', displayName: 'ACC RANKINGS' },
  { name: 'Big 12', fullName: 'BIG 12 CONFERENCE', displayName: 'BIG 12 RANKINGS' },
  { name: 'Pac-12', fullName: 'PAC-12 CONFERENCE', displayName: 'PAC-12 RANKINGS' }
];

// Load team mapping for colors and abbreviations
const teamMappingPath = path.join(__dirname, '..', 'data', 'team_mapping.json');
const teamMapping = JSON.parse(fs.readFileSync(teamMappingPath, 'utf8'));

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
  
  // No mapping found - return default colors
  return { primary: '#666666', secondary: '#FFFFFF', abbr: 'N/A' };
}

// Function to get team logo path
function getTeamLogoPath(teamName) {
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
    'Washington State': 'Washington_State_Cougars_logo-300x300.png',
    
    // Group of 5 teams
    'Memphis': 'Memphis_Tigers_logo-300x300.png',
    'USF': 'South_Florida_Bulls_logo-300x300.png',
    'South Florida': 'South_Florida_Bulls_logo-300x300.png'
  };
  
  return logoMappings[teamName] || null;
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

// Function to rank teams within a conference
function rankConferenceTeams(teams) {
  return teams.sort((a, b) => {
    // Primary sort: Win percentage
    const aWinPct = a.wins / (a.wins + a.losses);
    const bWinPct = b.wins / (b.wins + b.losses);
    
    if (aWinPct !== bWinPct) {
      return bWinPct - aWinPct;
    }
    
    // Secondary sort: Total wins
    if (a.wins !== b.wins) {
      return b.wins - a.wins;
    }
    
    // Tertiary sort: Points differential
    const aDiff = (a.pointsFor || 0) - (a.pointsAgainst || 0);
    const bDiff = (b.pointsFor || 0) - (b.pointsAgainst || 0);
    
    return bDiff - aDiff;
  });
}

// Function to create conference rankings data
function createConferenceRankingsData(conferenceName, teams) {
  const rankedTeams = rankConferenceTeams(teams);
  
  return {
    conference: conferenceName,
    teams: rankedTeams.map((team, index) => {
      const teamInfo = getTeamInfo(team.team);
      const record = `${team.wins || 0}-${team.losses || 0}`;
      const pointsDiff = (team.pointsFor || 0) - (team.pointsAgainst || 0);
      const pointsDiffStr = pointsDiff > 0 ? `+${pointsDiff}` : `${pointsDiff}`;
      
      return {
        rank: index + 1,
        name: team.team,
        record: record,
        pointsFor: team.pointsFor || 0,
        pointsAgainst: team.pointsAgainst || 0,
        pointsDiff: pointsDiffStr,
        wins: team.wins || 0,
        losses: team.losses || 0,
        colors: teamInfo
      };
    })
  };
}

// Function to generate HTML for conference rankings
function generateConferenceHTML(conference, data) {
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
    <title>${conference.displayName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .team-bar {
            height: 70px;
            background: linear-gradient(135deg, #8a9ba8 0%, #708090 100%) !important;
        }
        
        .rank-number {
            font-size: 3.5rem;
            font-weight: 900;
            line-height: 1;
        }
        
        .team-name {
            font-size: 3rem;
            font-weight: 800;
            line-height: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .record-text {
            font-size: 2rem;
            font-weight: 700;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .points-diff {
            font-size: 2.5rem;
            font-weight: 700;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .conference-title {
            font-size: 6rem;
            font-weight: 900;
            line-height: 0.9;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .conference-subtitle {
            font-size: 2.5rem;
            font-weight: 600;
            opacity: 0.9;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .team-logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        
        .logo-container {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .logo-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
        }
        
        .stats-container {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
        }
    </style>
</head>
<body class="m-0 p-0" style="background: #708090;">
    <div class="w-[1000px] h-[1000px] relative overflow-hidden" style="background: #708090;">
        <!-- Main Content Container -->
        <div class="p-8 h-full flex flex-col">
            <!-- Header -->
            <div class="mb-6 p-4 rounded-lg relative" style="background-color: #ffffff;">
                <h1 class="conference-title text-gray-900 mb-2 tracking-tight">
                    ${conference.displayName}
                </h1>
                <div class="flex items-center gap-4">
                    <p class="conference-subtitle text-gray-900">
                        VIA CFB DATA
                    </p>
                </div>
                <!-- Logo in top right corner -->
                <div class="absolute top-4 right-4">
                    <div class="logo-container">
                        ${logoDataUrl ? `<img src="${logoDataUrl}" alt="" class="logo-image" />` : '<div class="logo-image" style="background: #ccc; display: flex; align-items: center; justify-content: center; color: #666; font-weight: bold;">LOGO</div>'}
                    </div>
                </div>
            </div>
            
            <!-- Teams Container -->
            <div class="flex-1 flex flex-col justify-start space-y-2">
                ${data.teams.map(team => {
                  // Get team logo
                  const logoFileName = getTeamLogoPath(team.name);
                  const logoPath = logoFileName ? path.join(__dirname, '..', 'assets', 'team icons', logoFileName) : null;
                  const logoDataUrl = logoPath && fs.existsSync(logoPath) ? encodeImageToBase64(logoPath) : null;
                  
                  let logoHtml = '';
                  if (logoDataUrl) {
                    logoHtml = `<img src="${logoDataUrl}" alt="${team.name} Logo" class="team-logo mr-3 object-contain" style="filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));">`;
                  }
                  
                  return `<!-- Team ${team.rank} -->
                <div class="team-bar rounded-lg flex items-center px-4 shadow-lg" style="border: 3px solid ${team.colors.primary};">
                    <div class="rank-number text-white mr-8">${team.rank}</div>
                    <div class="mr-6">${logoHtml}</div>
                    <div class="flex-1">
                        <div class="team-name text-white">${team.name.toUpperCase()}</div>
                    </div>
                    <div class="stats-container">
                        <div class="record-text text-white">${team.record}</div>
                        <div class="points-diff text-white" style="color: ${team.pointsDiff.startsWith('+') ? '#10B981' : team.pointsDiff.startsWith('-') ? '#EF4444' : '#FFFFFF'}">${team.pointsDiff}</div>
                    </div>
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
  
  // Set viewport to match our graphic dimensions
  await page.setViewportSize({ width: 1000, height: 1000 });
  
  // Generate HTML content
  const htmlContent = generateConferenceHTML(data.conference, data);
  
  // Write HTML to temporary file for proper logo loading
  const tempHtmlPath = path.join(__dirname, '..', 'output', `temp-${data.conference.name.toLowerCase().replace(/\s+/g, '-')}-rankings.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent);
  
  // Load the HTML file directly from its path for proper logo loading
  await page.goto('file://' + tempHtmlPath);
  
  // Wait for fonts to load specifically
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for fonts to load by checking if fonts are available
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
    console.log('🚀 Starting Conference Rankings generation...');
    console.log('🎨 Generating CFB Conference Rankings from CFBD API...');
    
    // Fetch team records
    console.log('📊 Fetching team records...');
    const records = await fetchCFBDData('/records?year=2025');
    console.log(`✅ Loaded records for ${records.length} teams`);
    
    // Generate rankings for each Power 5 conference
    for (const conference of POWER5_CONFERENCES) {
      console.log(`\n🏈 Generating ${conference.displayName}...`);
      
      // Filter teams for this conference
      const conferenceTeams = records.filter(team => team.conference === conference.name);
      
      if (conferenceTeams.length === 0) {
        console.warn(`⚠️ No teams found for ${conference.name}`);
        continue;
      }
      
      console.log(`📊 Found ${conferenceTeams.length} teams in ${conference.name}`);
      
      // Create rankings data
      const rankingsData = createConferenceRankingsData(conference, conferenceTeams);
      
      // Generate HTML
      const htmlContent = generateConferenceHTML(conference, rankingsData);
      const htmlPath = path.join(__dirname, '..', 'output', `${conference.name.toLowerCase().replace(/\s+/g, '-')}-rankings-2025.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`✅ HTML: ${htmlPath}`);
      
      // Generate PNG
      const pngPath = path.join(__dirname, '..', 'output', `${conference.name.toLowerCase().replace(/\s+/g, '-')}-rankings-2025.png`);
      await generatePNG({ conference, ...rankingsData }, pngPath);
      console.log(`✅ PNG: ${pngPath}`);
    }
    
    console.log('\n🎉 All conference rankings generated successfully!');
    console.log('📁 Check the output folder for HTML and PNG files');
    
  } catch (error) {
    console.error('💥 Error generating conference rankings:', error);
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

export { generateConferenceHTML, generatePNG, createConferenceRankingsData, main };
