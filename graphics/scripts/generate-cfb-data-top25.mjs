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
    <meta name="viewport" content="width=1000, height=1000, initial-scale=1.0">
    <title>CFB Data's Top 25 - Week ${week}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@400;500;600;700;800;900&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .background-pattern {
            background: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
        }
        
        .team-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }
        
        .team-image {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 12px;
            object-fit: cover;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .team-image:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        
        .rank-badge {
            position: absolute;
            top: 8px;
            left: 8px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 14px;
            z-index: 10;
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }
        
        .team-name {
            font-family: 'Oswald', sans-serif;
            font-size: 11px;
            font-weight: 700;
            text-align: center;
            margin-top: 8px;
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            letter-spacing: 0.5px;
            text-transform: uppercase;
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
    </style>
</head>
<body class="m-0 p-0 background-pattern">
    <div class="w-[1000px] h-[1000px] relative overflow-hidden background-pattern">
        <!-- Main Content Container -->
        <div class="p-8 h-full flex flex-col">
        
        <!-- Header -->
        <div class="mb-6 p-4 rounded-lg relative" style="background-color: #ffffff;">
            <h1 class="text-7xl font-black text-gray-900 mb-2 tracking-tight">
                CFB DATA'S TOP 25
            </h1>
            <div class="flex items-center gap-4">
                <p class="text-2xl font-semibold text-gray-900">
                    WEEK ${week}
                </p>
            </div>
            <!-- Logo in top right corner -->
            <div class="absolute top-4 right-4">
                <div class="logo-container">
                    ${yourLogoDataUrl ? `<img src="${yourLogoDataUrl}" alt="" class="logo-image" />` : '<div class="logo-image" style="background: #ccc; display: flex; align-items: center; justify-content: center; color: #666; font-weight: bold;">LOGO</div>'}
                </div>
            </div>
        </div>
        
        <!-- Teams Grid -->
        <div class="flex-1 grid grid-cols-5 gap-6">
            ${teams.map(team => {
              const teamColor = getTeamColor(team.school);
              
              // Get team logo
              const logoFileName = getTeamLogoPath(team.school);
              const logoPath = logoFileName ? path.join(__dirname, '..', 'assets', 'team icons', logoFileName) : null;
              const logoDataUrl = logoPath && fs.existsSync(logoPath) ? encodeImageToBase64(logoPath) : null;
              
              // Create team abbreviation for fallback
              const teamAbbr = team.school.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase();
              
              return `
            <!-- Team ${team.rank} - ${team.school} -->
            <div class="team-item">
                <div class="rank-badge">${team.rank}</div>
                <div class="team-image" style="background: linear-gradient(135deg, ${teamColor} 0%, ${teamColor}CC 100%); display: flex; align-items: center; justify-content: center;">
                    ${logoDataUrl ? 
                      `<img src="${logoDataUrl}" alt="${team.school} Logo" style="width: 85%; height: 85%; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));" />` :
                      `<div class="text-6xl font-black text-white" style="font-family: 'Oswald', sans-serif;">${teamAbbr}</div>`
                    }
                </div>
                <div class="team-name">${team.school.toUpperCase()}</div>
            </div>`;
            }).join('\n')}
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
  await page.setViewportSize({ width: 1000, height: 1000 });
  
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