import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load poll data from cache
function loadPollData() {
  try {
    const pollCachePath = path.join(__dirname, '..', '..', 'public', 'poll_cache.json');
    const pollData = JSON.parse(fs.readFileSync(pollCachePath, 'utf8'));
    
    console.log(`📊 Loaded poll data for Week ${pollData.lastWeek}, Season ${pollData.lastSeason}`);
    
    // Get the most recent coaches poll
    const weeks = Object.keys(pollData.coachesPolls).sort((a, b) => parseInt(b) - parseInt(a));
    const latestWeek = weeks[0];
    const coachesPoll = pollData.coachesPolls[latestWeek];
    
    console.log(`🏆 Latest Coaches Poll (Week ${latestWeek}): ${coachesPoll.length} teams`);
    
    return {
      week: parseInt(latestWeek),
      season: pollData.lastSeason,
      coachesPoll: coachesPoll
    };
  } catch (error) {
    console.error('❌ Error loading poll data:', error.message);
    return null;
  }
}

// Function to apply CFB Data's rank swaps
function applyCFBDataSwaps(teams) {
  console.log('🔄 Applying CFB Data rank swaps...');
  
  // Create a copy of the teams array
  const swappedTeams = [...teams];
  
  // Define the swaps: [rank1, rank2] - teams at these positions will swap
  const swaps = [
    [8, 10],   // Swap #8 and #10
    [4, 5],    // Swap #4 and #5  
    [18, 13],  // Swap #18 and #13
    [22, 25]   // Swap #22 and #25
  ];
  
  swaps.forEach(([rank1, rank2]) => {
    // Find teams at these ranks (0-indexed, so subtract 1)
    const team1Index = swappedTeams.findIndex(team => team.rank === rank1);
    const team2Index = swappedTeams.findIndex(team => team.rank === rank2);
    
    if (team1Index !== -1 && team2Index !== -1) {
      // Swap the teams
      [swappedTeams[team1Index], swappedTeams[team2Index]] = [swappedTeams[team2Index], swappedTeams[team1Index]];
      
      // Update their ranks
      swappedTeams[team1Index].rank = rank1;
      swappedTeams[team2Index].rank = rank2;
      
      console.log(`   Swapped #${rank1} ${swappedTeams[team2Index].school} ↔ #${rank2} ${swappedTeams[team1Index].school}`);
    }
  });
  
  // Sort by new rank order
  swappedTeams.sort((a, b) => a.rank - b.rank);
  
  return swappedTeams;
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
    'Missouri': '#F1B82D',
    'Clemson': '#F66733',
    'North Carolina': '#7BAFD4',
    'Iowa': '#000000',
    'Oklahoma State': '#FF7300',
    'Kansas State': '#512888',
    'Arizona': '#003366',
    'Louisville': '#AD0000',
    'Iowa State': '#F1C232',
    'West Virginia': '#FFC72C',
    'Kansas': '#0051BA',
    'SMU': '#C8102E',
    'California': '#FDB515',
    'Stanford': '#8C1515',
    'UCLA': '#2774AE',
    'Arizona State': '#8C1515',
    'Colorado': '#CFB87C',
    'Oregon State': '#D73F09',
    'Washington State': '#981E32',
    'BYU': '#002255',
    'Cincinnati': '#E00122',
    'Houston': '#C8102E',
    'UCF': '#FFC904',
    'TCU': '#4D1979',
    'Baylor': '#003015',
    'Texas Tech': '#CC0000',
    'Virginia Tech': '#630031',
    'Duke': '#001A57',
    'North Carolina State': '#CC0000',
    'Pittsburgh': '#003594',
    'Syracuse': '#F76900',
    'Virginia': '#232D4B',
    'Wake Forest': '#9E1B32',
    'Boston College': '#891B2E',
    'Florida': '#FA4616',
    'Kentucky': '#0033A0',
    'Arkansas': '#9D2235',
    'Mississippi State': '#660000',
    'Nebraska': '#F20000',
    'Minnesota': '#7A0019',
    'Northwestern': '#4E2A84',
    'Purdue': '#CEB888',
    'Rutgers': '#CC0033',
    'Wisconsin': '#C8102E',
    'Indiana': '#990000',
    'Maryland': '#E03A3E',
    'Michigan State': '#18453B'
  };
  
  return teamColors[teamName] || '#666666';
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
    'Missouri': 'Missouri_Tigers_logo-300x300.png',
    'Clemson': 'Clemson_Tigers_logo-300x300.png',
    'North Carolina': 'North_Carolina_Tar_Heels_logo-300x300.png',
    'Iowa': 'Iowa_Hawkeyes_logo-300x300.png',
    'Oklahoma State': 'Oklahoma_State_Cowboys_logo-300x300.png',
    'Kansas State': 'Kansas_State_Wildcats_logo-300x300.png',
    'Arizona': 'Arizona_Wildcats_logo-300x300.png',
    'Louisville': 'Louisville_Cardinals_logo-300x300.png',
    'Iowa State': 'Iowa_State_Cyclones_logo-300x300.png',
    'West Virginia': 'West_Virginia_Mountaineers_logo-300x300.png',
    'Kansas': 'Kansas_Jayhawks_logo-300x300.png',
    'SMU': 'SMU_Mustang_logo-300x300.png',
    'California': 'California_Golden_Bears_logo-300x300.png',
    'Stanford': 'Stanford_Cardinal_logo-300x300.png',
    'UCLA': 'UCLA_Bruins-300x300.png',
    'Arizona State': 'Arizona_State_Sun_Devils_logo-300x300.png',
    'Colorado': 'Colorado_Buffaloes_logo-300x300.png',
    'Oregon State': 'Oregon_State_Beavers_logo-300x300.png',
    'Washington State': 'Washington_State_Cougars_logo-300x300.png',
    'BYU': 'BYU_Cougars_logo-300x300.png',
    'Cincinnati': 'Cincinnati_Bearcats_logo-300x300.png',
    'Houston': 'Houston_Cougars_logo-300x300.png',
    'UCF': 'UCF_Knights_logo-300x300.png',
    'TCU': 'TCU_Horned_Frogs_logo-300x300.png',
    'Baylor': 'Baylor_Bears_logo-300x300.png',
    'Virginia Tech': 'Virginia_Tech_Hokies_logo-300x300.png',
    'Duke': 'Duke_Blue_Devils_logo-300x300.png',
    'North Carolina State': 'North_Carolina_State_Wolfpack_logo-300x300.png',
    'Pittsburgh': 'Pitt_Panthers_logo-300x300.png',
    'Syracuse': 'Syracuse_Orange_logo-300x300.png',
    'Virginia': 'Virginia_Cavaliers_logo-300x300.png',
    'Wake Forest': 'Wake_Forest_Demon_Deacons_logo-300x300.png',
    'Boston College': 'Boston_College_Eagles_logo-300x300.png',
    'Florida': 'Florida_Gators_logo-300x300.png',
    'Kentucky': 'Kentucky_Wildcats_logo-300x300.png',
    'Arkansas': 'Arkansas_Razorbacks_logo-300x300.png',
    'Mississippi State': 'Mississippi_State_Bulldogs_logo-300x300.png',
    'Nebraska': 'Nebraska_Cornhuskers_logo-300x300.png',
    'Minnesota': 'Minnesota_Golden_Gophers_logo-300x300.png',
    'Northwestern': 'Northwestern_Wildcats_logo-300x300.png',
    'Purdue': 'Purdue_Boilermakers_logo-300x300.png',
    'Rutgers': 'Rutgers_Scarlet_Knights_logo-300x300.png',
    'Wisconsin': 'Wisconsin_Badgers_logo-300x300.png',
    'Indiana': 'Indiana_Hoosiers_logo-300x300.png',
    'Maryland': 'Maryland_Terrapins_logo-300x300.png',
    'Michigan State': 'Michigan_State_Spartans_logo-300x300.png'
  };
  
  return teamMappings[teamName] || null;
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

// Function to generate HTML template
function generateHTMLTemplate(teams, week) {
  // Get your logo
  const yourLogoPath = path.join(__dirname, '..', 'assets', 'x_logo.png');
  const yourLogoDataUrl = encodeImageToBase64(yourLogoPath);
  
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=960, height=1200, initial-scale=1.0">
    <title>CFB Data's Top 25 - Week ${week}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; }
        
        .team-card {
            background: var(--team-color);
            border: 2px solid var(--team-color-dark);
            border-radius: 12px;
            height: 120px;
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            padding: 8px;
        }
        
        .rank-badge {
            position: absolute;
            top: 8px;
            left: 8px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 1.2rem;
            z-index: 10;
        }
        
        .logo-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 70px;
            height: 70px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            z-index: 5;
        }
        
        .team-logo-text {
            color: #000;
            font-weight: 800;
            font-size: 1.5rem;
            text-align: center;
            line-height: 1;
        }
        
        .team-info {
            position: absolute;
            bottom: 4px;
            left: 0;
            right: 0;
            text-align: center;
            z-index: 10;
        }
        
        .team-name {
            color: white;
            font-weight: 800;
            font-size: 0.9rem;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
            line-height: 1;
        }
        
        .grid-container {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
            padding: 0 20px;
        }
        
        .my-logo {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #1DA1F2;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 900;
            font-size: 1.2rem;
            color: #92400e;
            z-index: 20;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .header-section {
            height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            padding-right: 80px; /* Space for logo */
            margin-bottom: 10px; /* Minimal spacing to first row */
        }
    </style>
</head>
<body class="bg-black text-white m-0 p-0">
    <div class="w-[960px] h-[1200px] bg-black relative overflow-hidden">
        <!-- Header -->
        <div class="header-section">
            <h1 class="text-6xl font-black text-white mb-1 tracking-tight text-left px-6">
                CFB DATA'S TOP 25
            </h1>
            <p class="text-4xl font-bold text-yellow-400 text-left px-6" style="font-size: 2.5rem;">
                WEEK ${week}
            </p>
            <div class="my-logo">
                ${yourLogoDataUrl ? `<img src="${yourLogoDataUrl}" alt="CFB Data" style="width: 100%; height: 100%; object-fit: contain;" />` : 'LOGO'}
            </div>
        </div>
        
        <!-- Top 25 Grid -->
        <div class="grid-container">
            ${teams.map(team => {
              const teamColor = getTeamColor(team.school);
              const teamColorDark = teamColor + 'CC'; // Add transparency for darker shade
              
              // Get team logo
              const logoFileName = getTeamLogoPath(team.school);
              const logoPath = logoFileName ? path.join(__dirname, '..', 'assets', 'team icons', logoFileName) : null;
              const logoDataUrl = logoPath && fs.existsSync(logoPath) ? encodeImageToBase64(logoPath) : null;
              
              let logoHtml = '';
              if (logoDataUrl) {
                logoHtml = `<img src="${logoDataUrl}" alt="${team.school} Logo" style="max-width: 90%; max-height: 90%; object-fit: contain;" />`;
              } else {
                logoHtml = `<div class="team-logo-text">${team.school.substring(0, 3).toUpperCase()}</div>`;
              }
              
              return `
            <div class="team-card" style="--team-color: ${teamColor}; --team-color-dark: ${teamColorDark};">
                <div class="rank-badge">${team.rank}</div>
                <div class="logo-container">
                    ${logoHtml}
                </div>
                <div class="team-info">
                    <div class="team-name">${team.school.toUpperCase()}</div>
                </div>
            </div>`;
            }).join('\n')}
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
  await page.setViewportSize({ width: 960, height: 1200 });
  
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

async function generateCFBDataTop25() {
  console.log('🚀 Starting CFB Data Top 25 generation...\n');
  
  try {
    // Load poll data from cache
    const pollData = loadPollData();
    if (!pollData) {
      console.error('❌ Could not load poll data');
      return;
    }
    
    // Apply CFB Data's rank swaps
    const cfbDataRankings = applyCFBDataSwaps(pollData.coachesPoll);
    
    console.log(`\n🎨 Generating CFB Data Top 25 graphic for Week ${pollData.week}...`);
    const htmlContent = generateHTMLTemplate(cfbDataRankings, pollData.week);
    
    const htmlPath = path.join(__dirname, '..', '..', 'cfb-data-top25-real.html');
    const pngPath = path.join(__dirname, '..', '..', 'cfb-data-top25-real.png');
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ HTML: ${htmlPath}`);
    
    await generatePNG(htmlContent, pngPath);
    console.log(`✅ PNG: ${pngPath}`);
    
    console.log('\n🎉 CFB Data Top 25 graphic generated successfully!');
    console.log('📁 Check the output folder for HTML and PNG files');
    
  } catch (error) {
    console.error('❌ Error generating CFB Data Top 25:', error.message);
  }
}

// Run the generation
generateCFBDataTop25().then(() => {
  console.log('\n✅ CFB Data Top 25 generation completed!');
}).catch(error => {
  console.error('\n❌ CFB Data Top 25 generation failed:', error.message);
});