import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load team colors data
const teamColorsPath = path.join(__dirname, '..', 'data', 'team_colors.json');
const teamColors = JSON.parse(fs.readFileSync(teamColorsPath, 'utf8'));

// Function to get team colors by name
function getTeamColors(teamName) {
  // Try exact match first
  let team = teamColors.find(t => t.name === teamName);
  
  // If no exact match, try partial matching
  if (!team) {
    // Try to find by first word (e.g., "Indiana" matches "Indiana Hoosiers")
    const firstWord = teamName.split(' ')[0];
    team = teamColors.find(t => t.name.startsWith(firstWord));
  }
  
  // If still no match, try reverse matching (e.g., "Indiana Hoosiers" contains "Indiana")
  if (!team) {
    team = teamColors.find(t => t.name.includes(teamName));
  }
  
  return team ? { primary: team.primary, secondary: team.secondary } : { primary: '#666666', secondary: '#FFFFFF' };
}

// Function to generate team logo text (first letter of each word)
function generateTeamLogo(teamName) {
  const words = teamName.split(' ');
  if (words.length === 1) {
    return words[0].charAt(0);
  }
  // For multi-word names, take first letter of each word
  return words.map(word => word.charAt(0)).join('');
}

// Function to get team logo path
function getTeamLogoPath(teamName) {
  // Team name mappings to actual logo file names
  const logoMappings = {
    'Alabama': 'Alabama_Crimson_Tide_logo-300x300.png',
    'Alabama Crimson Tide': 'Alabama_Crimson_Tide_logo-300x300.png',
    'Auburn': 'Auburn_Tigers_logo-300x300.png',
    'Auburn Tigers': 'Auburn_Tigers_logo-300x300.png',
    'Florida': 'Florida_Gators_logo-300x300.png',
    'Florida Gators': 'Florida_Gators_logo-300x300.png',
    'Georgia': 'Georgia_Bulldogs_logo-300x300.png',
    'Georgia Bulldogs': 'Georgia_Bulldogs_logo-300x300.png',
    'Kentucky': 'Kentucky_Wildcats_logo-300x300.png',
    'LSU': 'LSU_Tigers-300x300.png',
    'Mississippi State': 'Mississippi_State_Bulldogs_logo-300x300.png',
    'Missouri': 'Missouri_Tigers_logo-300x300.png',
    'Ole Miss': 'Ole_Miss_Rebels_logo-300x300.png',
    'South Carolina': 'South_Carolina_Gamecocks_logo-300x300.png',
    'Tennessee': 'Tennessee_Volunteers_logo-300x300.png',
    'Texas': 'Texas_Longhorns_logo-300x300.png',
    'Texas Longhorns': 'Texas_Longhorns_logo-300x300.png',
    'Texas A&M': 'Texas_AM_University_logo-300x300.png',
    'Texas A&M Aggies': 'Texas_AM_University_logo-300x300.png',
    'Vanderbilt': 'Vanderbilt_Commodores_logo-300x300.png',
    'Oklahoma': 'Oklahoma_Sooners_logo-300x300.png',
    'Arkansas': 'Arkansas_Razorbacks_logo-300x300.png',
    
    'Illinois': 'Illinois_Fighting_Illini_logo-300x300.png',
    'Indiana': 'Indiana_Hoosiers_logo-300x300.png',
    'Iowa': 'Iowa_Hawkeyes_logo-300x300.png',
    'Maryland': 'Maryland_Terrapins_logo-300x300.png',
    'Michigan': 'Michigan_Wolverines_logo-300x300.png',
    'Michigan Wolverines': 'Michigan_Wolverines_logo-300x300.png',
    'Michigan State': 'Michigan_State_Spartans_logo-300x300.png',
    'Michigan State Spartans': 'Michigan_State_Spartans_logo-300x300.png',
    'Minnesota': 'Minnesota_Golden_Gophers_logo-300x300.png',
    'Nebraska': 'Nebraska_Cornhuskers_logo-300x300.png',
    'Northwestern': 'Northwestern_Wildcats_logo-300x300.png',
    'Ohio State': 'Ohio_State_Buckeyes_logo-300x300.png',
    'Ohio State Buckeyes': 'Ohio_State_Buckeyes_logo-300x300.png',
    'Penn State': 'Penn_State_Nittany_Lions_logo-300x300.png',
    'Penn State Nittany Lions': 'Penn_State_Nittany_Lions_logo-300x300.png',
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
    'Memphis Tigers': 'Memphis_Tigers_logo-300x300.png',
    'USF': 'South_Florida_Bulls_logo-300x300.png',
    'South Florida': 'South_Florida_Bulls_logo-300x300.png',
    'South Florida Bulls': 'South_Florida_Bulls_logo-300x300.png'
  };
  
  return logoMappings[teamName] || null;
}

// Function to encode image to base64
function encodeImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).slice(1);
    return `data:image/${ext};base64,${base64}`;
  } catch (error) {
    console.warn('⚠️ Could not load logo image:', error.message);
    return null;
  }
}

// Function to generate HTML content
function generateHTML(data, teamIdMapping = null) {
  // Try to load and encode the logo
  const logoPath = path.join(__dirname, '..', 'assets', 'x_logo.png');
  const logoDataUrl = encodeImageToBase64(logoPath);
  
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CFB Leaders</title>
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
        
        .team-subtext {
            font-size: 1.25rem;
            font-weight: 600;
            opacity: 0.9;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .team-logo {
            font-size: 3rem;
            font-weight: 900;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .cfb-logo {
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: 0.1em;
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
<body class="m-0 p-0" style="background: #708090;">
    <div class="w-[1000px] h-[1000px] relative overflow-hidden" style="background: #708090;">
        <!-- Main Content Container -->
        <div class="p-8 h-full flex flex-col">
            <!-- Header -->
            <div class="mb-6 p-4 rounded-lg relative" style="background-color: #ffffff;">
                <h1 class="text-7xl font-black text-gray-900 mb-2 tracking-tight">
                    ${data.title}
                </h1>
                <div class="flex items-center gap-4">
                    <p class="text-2xl font-semibold text-gray-900">
                        ${data.subtitle}
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
                  const colors = getTeamColors(team.name);
                  const logo = generateTeamLogo(team.name);
                  
                  // Get team logo
                  const logoFileName = getTeamLogoPath(team.name);
                  const logoPath = logoFileName ? path.join(__dirname, '..', 'assets', 'team icons', logoFileName) : null;
                  const logoDataUrl = logoPath && fs.existsSync(logoPath) ? encodeImageToBase64(logoPath) : null;
                  
                  let logoHtml = '';
                  if (logoDataUrl) {
                    logoHtml = `<img src="${logoDataUrl}" alt="${team.name} Logo" class="w-12 h-12 mr-3 object-contain" style="filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));">`;
                  }
                  
                  // ALL graphics now use the same format: logo + team name + record on left, stat on far right
                  return `<!-- Team ${team.rank} -->
                <div class="team-bar rounded-lg flex items-center px-4 shadow-lg" style="border: 3px solid ${colors.primary};">
                    <div class="rank-number text-white mr-8">${team.rank}</div>
                    <div class="flex-1 flex items-center">
                        ${logoHtml}
                        <div>
                            <div class="team-name text-white">${team.name.toUpperCase()} ${data.showRecords ? `<span class="text-4xl font-bold">${team.record}</span>` : ''}</div>
                        </div>
                    </div>
                    <div class="text-white text-4xl font-bold">${team.value || team.record}</div>
                </div>`;
                }).join('\n')}
            </div>
        </div>
        
    </div>
</body>
</html>`;

  return template;
}

// Function to generate PNG using Playwright
async function generatePNG(data, outputPath, teamIdMapping = null) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to match our graphic dimensions
  await page.setViewportSize({ width: 1000, height: 1000 });
  
  // Allow all resources to load (including fonts and CDN)
  // No route blocking to ensure fonts load properly
  
  // Generate HTML content
  const htmlContent = generateHTML(data, teamIdMapping);
  
  // Set the HTML content
  await page.setContent(htmlContent);
  
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
  
  await browser.close();
}

// Function to create different leader types
function createLeadersData(type, teams) {
  const templates = {
    power_rankings: {
      title: "CFB POWER RANKINGS",
      subtitle: "VIA CFB DATA"
    },
    points_scorers: {
      title: "TOP 5 POINTS SCORERS",
      subtitle: "VIA CFB DATA"
    },
    offensive_yards: {
      title: "TOP 5 OFFENSIVE YARDS",
      subtitle: "VIA CFB DATA"
    },
    defensive_yards: {
      title: "LEAST YARDS ALLOWED",
      subtitle: "VIA CFB DATA"
    }
  };

  const template = templates[type] || templates.power_rankings;
  
  return {
    ...template,
    showRecords: true,
    type: type,
    teams: teams.map((team, index) => ({
      rank: index + 1,
      name: team.name,
      record: team.record || team.value || "",
      conference: team.conference || "",
      value: team.value || team.record || ""
    }))
  };
}

// Main function
async function main() {
  try {
    console.log('🎨 Generating CFB Leaders graphic...');
    
    // Load template data
    const templatePath = path.join(__dirname, '..', 'data', 'leaders-template.json');
    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // Generate HTML file
    const htmlContent = generateHTML(templateData);
    const htmlOutputPath = path.join(__dirname, '..', 'output', 'leaders.html');
    fs.writeFileSync(htmlOutputPath, htmlContent);
    console.log('✅ HTML generated successfully!');
    console.log(`📁 HTML Output: ${htmlOutputPath}`);
    
    // Generate PNG file
    console.log('📸 Generating PNG...');
    const pngOutputPath = path.join(__dirname, '..', 'output', 'leaders.png');
    await generatePNG(templateData, pngOutputPath);
    console.log('✅ PNG generated successfully!');
    console.log(`📁 PNG Output: ${pngOutputPath}`);
    
    console.log('🌐 Open the HTML file in a browser to preview');
    
  } catch (error) {
    console.error('❌ Error generating graphic:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting Leaders generation script...');
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
} else {
  // Also run if this is the main module
  console.log('🚀 Starting Leaders generation script (fallback)...');
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { generateHTML, generatePNG, getTeamColors, generateTeamLogo, createLeadersData };
