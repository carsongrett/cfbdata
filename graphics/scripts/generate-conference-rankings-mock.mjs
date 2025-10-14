import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data for Power 5 conferences with different team counts
const MOCK_CONFERENCES = [
  {
    name: 'SEC',
    fullName: 'SEC CONFERENCE',
    displayName: 'SEC RANKINGS',
    teams: [
      { name: 'Georgia', record: '11-1', pointsDiff: '+285', wins: 11, losses: 1 },
      { name: 'Alabama', record: '10-2', pointsDiff: '+198', wins: 10, losses: 2 },
      { name: 'LSU', record: '9-3', pointsDiff: '+156', wins: 9, losses: 3 },
      { name: 'Tennessee', record: '9-3', pointsDiff: '+134', wins: 9, losses: 3 },
      { name: 'Texas A&M', record: '8-4', pointsDiff: '+87', wins: 8, losses: 4 },
      { name: 'Ole Miss', record: '8-4', pointsDiff: '+72', wins: 8, losses: 4 },
      { name: 'Auburn', record: '7-5', pointsDiff: '+23', wins: 7, losses: 5 },
      { name: 'Missouri', record: '7-5', pointsDiff: '+15', wins: 7, losses: 5 },
      { name: 'Kentucky', record: '6-6', pointsDiff: '-12', wins: 6, losses: 6 },
      { name: 'South Carolina', record: '6-6', pointsDiff: '-28', wins: 6, losses: 6 },
      { name: 'Florida', record: '5-7', pointsDiff: '-45', wins: 5, losses: 7 },
      { name: 'Arkansas', record: '5-7', pointsDiff: '-52', wins: 5, losses: 7 },
      { name: 'Mississippi State', record: '4-8', pointsDiff: '-89', wins: 4, losses: 8 },
      { name: 'Vanderbilt', record: '2-10', pointsDiff: '-178', wins: 2, losses: 10 }
    ]
  },
  {
    name: 'Big Ten',
    fullName: 'BIG TEN CONFERENCE',
    displayName: 'BIG TEN RANKINGS',
    teams: [
      { name: 'Michigan', record: '12-0', pointsDiff: '+312', wins: 12, losses: 0 },
      { name: 'Ohio State', record: '11-1', pointsDiff: '+267', wins: 11, losses: 1 },
      { name: 'Penn State', record: '10-2', pointsDiff: '+189', wins: 10, losses: 2 },
      { name: 'Iowa', record: '9-3', pointsDiff: '+98', wins: 9, losses: 3 },
      { name: 'Wisconsin', record: '8-4', pointsDiff: '+76', wins: 8, losses: 4 },
      { name: 'Maryland', record: '7-5', pointsDiff: '+34', wins: 7, losses: 5 },
      { name: 'Nebraska', record: '7-5', pointsDiff: '+12', wins: 7, losses: 5 },
      { name: 'Minnesota', record: '6-6', pointsDiff: '-8', wins: 6, losses: 6 },
      { name: 'Illinois', record: '6-6', pointsDiff: '-15', wins: 6, losses: 6 },
      { name: 'Rutgers', record: '5-7', pointsDiff: '-42', wins: 5, losses: 7 },
      { name: 'Northwestern', record: '5-7', pointsDiff: '-58', wins: 5, losses: 7 },
      { name: 'Michigan State', record: '4-8', pointsDiff: '-95', wins: 4, losses: 8 },
      { name: 'Indiana', record: '3-9', pointsDiff: '-134', wins: 3, losses: 9 },
      { name: 'Purdue', record: '2-10', pointsDiff: '-189', wins: 2, losses: 10 }
    ]
  },
  {
    name: 'ACC',
    fullName: 'ACC CONFERENCE',
    displayName: 'ACC RANKINGS',
    teams: [
      { name: 'Florida State', record: '11-1', pointsDiff: '+234', wins: 11, losses: 1 },
      { name: 'Louisville', record: '10-2', pointsDiff: '+167', wins: 10, losses: 2 },
      { name: 'North Carolina', record: '9-3', pointsDiff: '+123', wins: 9, losses: 3 },
      { name: 'NC State', record: '8-4', pointsDiff: '+78', wins: 8, losses: 4 },
      { name: 'Miami', record: '7-5', pointsDiff: '+45', wins: 7, losses: 5 },
      { name: 'Virginia Tech', record: '7-5', pointsDiff: '+28', wins: 7, losses: 5 },
      { name: 'Georgia Tech', record: '6-6', pointsDiff: '-12', wins: 6, losses: 6 },
      { name: 'Boston College', record: '6-6', pointsDiff: '-18', wins: 6, losses: 6 },
      { name: 'Duke', record: '5-7', pointsDiff: '-34', wins: 5, losses: 7 },
      { name: 'Wake Forest', record: '5-7', pointsDiff: '-41', wins: 5, losses: 7 },
      { name: 'Syracuse', record: '4-8', pointsDiff: '-67', wins: 4, losses: 8 },
      { name: 'Pittsburgh', record: '3-9', pointsDiff: '-98', wins: 3, losses: 9 },
      { name: 'Virginia', record: '2-10', pointsDiff: '-156', wins: 2, losses: 10 },
      { name: 'California', record: '1-11', pointsDiff: '-234', wins: 1, losses: 11 }
    ]
  },
  {
    name: 'Big 12',
    fullName: 'BIG 12 CONFERENCE',
    displayName: 'BIG 12 RANKINGS',
    teams: [
      { name: 'Texas', record: '11-1', pointsDiff: '+198', wins: 11, losses: 1 },
      { name: 'Oklahoma', record: '10-2', pointsDiff: '+156', wins: 10, losses: 2 },
      { name: 'Kansas State', record: '9-3', pointsDiff: '+134', wins: 9, losses: 3 },
      { name: 'Oklahoma State', record: '8-4', pointsDiff: '+89', wins: 8, losses: 4 },
      { name: 'Iowa State', record: '8-4', pointsDiff: '+67', wins: 8, losses: 4 },
      { name: 'TCU', record: '7-5', pointsDiff: '+34', wins: 7, losses: 5 },
      { name: 'West Virginia', record: '7-5', pointsDiff: '+12', wins: 7, losses: 5 },
      { name: 'Texas Tech', record: '6-6', pointsDiff: '-15', wins: 6, losses: 6 },
      { name: 'Baylor', record: '6-6', pointsDiff: '-28', wins: 6, losses: 6 },
      { name: 'UCF', record: '5-7', pointsDiff: '-45', wins: 5, losses: 7 },
      { name: 'Houston', record: '5-7', pointsDiff: '-52', wins: 5, losses: 7 },
      { name: 'Cincinnati', record: '4-8', pointsDiff: '-78', wins: 4, losses: 8 },
      { name: 'BYU', record: '3-9', pointsDiff: '-112', wins: 3, losses: 9 },
      { name: 'Kansas', record: '2-10', pointsDiff: '-167', wins: 2, losses: 10 },
      { name: 'Arizona', record: '1-11', pointsDiff: '-198', wins: 1, losses: 11 }
    ]
  },
  {
    name: 'Pac-12',
    fullName: 'PAC-12 CONFERENCE',
    displayName: 'PAC-12 RANKINGS',
    teams: [
      { name: 'Oregon', record: '11-1', pointsDiff: '+267', wins: 11, losses: 1 },
      { name: 'Washington', record: '10-2', pointsDiff: '+189', wins: 10, losses: 2 },
      { name: 'USC', record: '9-3', pointsDiff: '+156', wins: 9, losses: 3 },
      { name: 'UCLA', record: '8-4', pointsDiff: '+98', wins: 8, losses: 4 },
      { name: 'Utah', record: '7-5', pointsDiff: '+45', wins: 7, losses: 5 },
      { name: 'Arizona State', record: '6-6', pointsDiff: '-12', wins: 6, losses: 6 },
      { name: 'Stanford', record: '5-7', pointsDiff: '-34', wins: 5, losses: 7 },
      { name: 'Oregon State', record: '4-8', pointsDiff: '-67', wins: 4, losses: 8 },
      { name: 'Washington State', record: '3-9', pointsDiff: '-98', wins: 3, losses: 9 },
      { name: 'Colorado', record: '2-10', pointsDiff: '-156', wins: 2, losses: 10 },
      { name: 'California', record: '1-11', pointsDiff: '-234', wins: 1, losses: 11 }
    ]
  }
];

// Load team mapping for colors and abbreviations
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

// Function to determine layout based on team count
function getLayoutConfig(teamCount) {
  if (teamCount <= 10) {
    // Smaller conferences get larger logos and more spacing
    return {
      logoSize: '80px',
      teamBarHeight: '80px',
      rankFontSize: '4rem',
      teamNameFontSize: '3.5rem',
      recordFontSize: '2.5rem',
      pointsDiffFontSize: '3rem',
      spacing: '3'
    };
  } else if (teamCount <= 14) {
    // Medium conferences get standard sizing
    return {
      logoSize: '60px',
      teamBarHeight: '70px',
      rankFontSize: '3.5rem',
      teamNameFontSize: '3rem',
      recordFontSize: '2rem',
      pointsDiffFontSize: '2.5rem',
      spacing: '2'
    };
  } else {
    // Larger conferences get smaller logos and tighter spacing
    return {
      logoSize: '50px',
      teamBarHeight: '60px',
      rankFontSize: '3rem',
      teamNameFontSize: '2.5rem',
      recordFontSize: '1.75rem',
      pointsDiffFontSize: '2rem',
      spacing: '1'
    };
  }
}

// Function to generate HTML for conference rankings
function generateConferenceHTML(conference, teams) {
  const layout = getLayoutConfig(teams.length);
  
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
            height: ${layout.teamBarHeight};
            background: linear-gradient(135deg, #e0e0e0 0%, #d3d3d3 100%) !important;
        }
        
        .rank-number {
            font-size: ${layout.rankFontSize};
            font-weight: 900;
            line-height: 1;
        }
        
        .team-name {
            font-size: ${layout.teamNameFontSize};
            font-weight: 800;
            line-height: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .record-text {
            font-size: ${layout.recordFontSize};
            font-weight: 700;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .points-diff {
            font-size: ${layout.pointsDiffFontSize};
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
            width: ${layout.logoSize};
            height: ${layout.logoSize};
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
<body class="m-0 p-0" style="background: #d3d3d3;">
    <div class="w-[1000px] h-[1000px] relative overflow-hidden" style="background: #d3d3d3;">
        <!-- Main Content Container -->
        <div class="p-8 h-full flex flex-col">
            <!-- Header -->
            <div class="mb-6 p-4 rounded-lg relative" style="background-color: #ffffff;">
                <h1 class="conference-title text-gray-900 mb-2 tracking-tight">
                    ${conference.displayName}
                </h1>
                <div class="flex items-center gap-4">
                    <p class="conference-subtitle text-gray-900">
                        MOCK DATA - VIA CFB DATA
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
            <div class="flex-1 flex flex-col justify-start space-y-${layout.spacing}">
                ${teams.map((team, index) => {
                  const teamInfo = getTeamInfo(team.name);
                  
                  // Get team logo
                  const logoFileName = getTeamLogoPath(team.name);
                  const logoPath = logoFileName ? path.join(__dirname, '..', 'assets', 'team icons', logoFileName) : null;
                  const logoDataUrl = logoPath && fs.existsSync(logoPath) ? encodeImageToBase64(logoPath) : null;
                  
                  let logoHtml = '';
                  if (logoDataUrl) {
                    logoHtml = `<img src="${logoDataUrl}" alt="${team.name} Logo" class="team-logo mr-3 object-contain" style="filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));">`;
                  }
                  
                  return `<!-- Team ${index + 1} -->
                <div class="team-bar rounded-lg flex items-center px-4 shadow-lg" style="border: 3px solid ${teamInfo.primary};">
                    <div class="rank-number text-white mr-8">${index + 1}</div>
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
  const htmlContent = generateConferenceHTML(data.conference, data.teams);
  
  // Write HTML to temporary file for proper logo loading
  const tempHtmlPath = path.join(__dirname, '..', 'output', `temp-${data.conference.name.toLowerCase().replace(/\s+/g, '-')}-rankings-mock.html`);
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
    console.log('🚀 Starting Conference Rankings Mock generation...');
    console.log('🎨 Generating CFB Conference Rankings with mock data...');
    
    // Generate rankings for each Power 5 conference
    for (const conference of MOCK_CONFERENCES) {
      console.log(`\n🏈 Generating ${conference.displayName}...`);
      console.log(`📊 ${conference.teams.length} teams in ${conference.name}`);
      
      // Generate HTML
      const htmlContent = generateConferenceHTML(conference, conference.teams);
      const htmlPath = path.join(__dirname, '..', 'output', `${conference.name.toLowerCase().replace(/\s+/g, '-')}-rankings-mock.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`✅ HTML: ${htmlPath}`);
      
      // Generate PNG
      const pngPath = path.join(__dirname, '..', 'output', `${conference.name.toLowerCase().replace(/\s+/g, '-')}-rankings-mock.png`);
      await generatePNG({ conference, teams: conference.teams }, pngPath);
      console.log(`✅ PNG: ${pngPath}`);
    }
    
    console.log('\n🎉 All conference rankings mock graphics generated successfully!');
    console.log('📁 Check the output folder for HTML and PNG files');
    
  } catch (error) {
    console.error('💥 Error generating conference rankings mock:', error);
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

export { generateConferenceHTML, generatePNG, main };
