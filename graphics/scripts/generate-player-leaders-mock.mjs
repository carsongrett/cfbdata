import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Function to create a subtle version of team color
function createSubtleBackgroundColor(teamColor) {
  // Convert hex to RGB
  const hex = teamColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Create a very subtle version (about 15% opacity)
  return `rgba(${r}, ${g}, ${b}, 0.15)`;
}

// Function to create a slightly more visible border color (about 30% opacity)
function createSubtleBorderColor(teamColor) {
  const hex = teamColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, 0.3)`;
}

// Mock player data for testing
const mockPlayerData = {
  rushingYards: {
    type: 'rushingYards',
    title: 'RUSHING YD LEADERS',
    teams: [
      { rank: 1, name: 'Ahmad Hardy', team: 'Washington', record: '3-0', value: '1,234 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>411/G</span>' },
      { rank: 2, name: 'Daylan Smothers', team: 'Nebraska', record: '2-1', value: '1,156 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>385/G</span>' },
      { rank: 3, name: 'Justice Haynes', team: 'Alabama', record: '3-0', value: '1,089 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>363/G</span>' },
      { rank: 4, name: 'LJ Martin', team: 'BYU', record: '2-1', value: '987 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>329/G</span>' },
      { rank: 5, name: 'Emmett Johnson', team: 'Nebraska', record: '2-1', value: '945 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>315/G</span>' },
      { rank: 6, name: 'Cameron Dickey', team: 'Texas Tech', record: '1-2', value: '892 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>297/G</span>' },
      { rank: 7, name: 'Kewan Lacy', team: 'LSU', record: '2-1', value: '834 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>278/G</span>' },
      { rank: 8, name: 'Waymond Jordan', team: 'Auburn', record: '2-1', value: '789 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>263/G</span>' },
      { rank: 9, name: 'Raleek Brown', team: 'USC', record: '1-2', value: '756 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>252/G</span>' },
      { rank: 10, name: 'Antwan Raymond', team: 'Texas Tech', record: '1-2', value: '723 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>YDS</span> <span style=\'font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);\'>241/G</span>' }
    ]
  },
  rushingTDs: {
    type: 'rushingTDs',
    title: 'RUSHING TD LEADERS',
    teams: [
      { rank: 1, name: 'Jonah Coleman', team: 'Arizona', record: '2-1', value: '8 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' },
      { rank: 2, name: 'Haynes King', team: 'Georgia Tech', record: '1-2', value: '7 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' },
      { rank: 3, name: 'Ahmad Hardy', team: 'Washington', record: '3-0', value: '6 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' },
      { rank: 4, name: 'Antwan Raymond', team: 'Texas Tech', record: '1-2', value: '6 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' },
      { rank: 5, name: 'Mark Gronowski', team: 'South Dakota State', record: '3-0', value: '5 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' },
      { rank: 6, name: 'J\'Mari Taylor', team: 'Oklahoma', record: '2-1', value: '5 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' },
      { rank: 7, name: 'Demond Claiborne', team: 'Wake Forest', record: '1-2', value: '4 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' },
      { rank: 8, name: 'Justice Haynes', team: 'Alabama', record: '3-0', value: '4 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' },
      { rank: 9, name: 'Kewan Lacy', team: 'LSU', record: '2-1', value: '4 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' },
      { rank: 10, name: 'Cameron Dickey', team: 'Texas Tech', record: '1-2', value: '3 <span style=\'font-size: 0.6em; color: rgba(255,255,255,0.8);\'>TD</span>' }
    ]
  }
};

// Function to create a fallback logo placeholder SVG
function createFallbackLogo(teamName, backgroundColor) {
  const initials = teamName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const svg = `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="60" fill="${backgroundColor}" opacity="0.2"/>
    <text x="30" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
          fill="${backgroundColor}" text-anchor="middle">${initials}</text>
  </svg>`;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Generate HTML for player leaders with subtle team colors
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
    <title>CFB Player Leaders - Mock</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        }
        
        .player-bar {
            height: 70px;
            /* Remove hardcoded background - will use inline styles */
        }
        
        .rank-number {
            font-size: 4rem;
            font-weight: 900;
            line-height: 1;
        }
        
        .player-name {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .player-name-compact {
            font-size: 2.8rem;
            font-weight: 800;
            line-height: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .stat-value {
            font-size: 3rem;
            font-weight: 700;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .stat-number {
            font-size: 4rem;
            font-weight: 800;
        }
        
        .stat-unit {
            font-size: 2rem;
            font-weight: 600;
            opacity: 0.9;
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
            width: 60px;
            height: 60px;
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
<body class="m-0 p-0" style="background: #3a3a3a;">
    <div class="w-[1200px] h-[1000px] relative overflow-hidden" style="background: #3a3a3a;">
        <!-- Main Content Container -->
        <div class="p-8 h-full flex flex-col">
        
        <!-- Header -->
        <div class="mb-6 p-4 rounded-lg relative" style="background-color: #ffffff;">
            <h1 class="text-7xl font-black text-gray-900 mb-2 tracking-tight">
                ${data.title}
            </h1>
            <div class="flex items-center gap-4">
                <p class="text-2xl font-semibold text-gray-900">
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
        
        <!-- Players Container -->
        <div class="flex-1 flex flex-col justify-start space-y-2">
                ${data.teams.map(player => {
                  const teamInfo = getTeamInfo(player.team);
                  const teamColor = teamInfo ? teamInfo.primary : '#666666';
                  
                  // Create subtle background and border colors
                  const subtleBackground = createSubtleBackgroundColor(teamColor);
                  const subtleBorder = createSubtleBorderColor(teamColor);
                  
                  // Create fallback logo
                  const logoDataUrl = createFallbackLogo(player.team, teamColor);
                  const logoHtml = `<img src="${logoDataUrl}" alt="${player.team} Logo" class="w-12 h-12 mr-3 object-contain" style="filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));">`;
                  
                  // Use full player name
                  const displayName = player.name.toUpperCase();
                  
                  return `<!-- Player ${player.rank} -->
                <div class="player-bar rounded-lg flex items-center px-6 shadow-lg" style="background: ${subtleBackground}; border: 3px solid ${subtleBorder};">
                    <div class="rank-number text-white mr-8">${player.rank}</div>
                    <div class="mr-6">${logoHtml}</div>
                    <div class="flex-1">
                        <div class="player-name text-white">${displayName}</div>
                    </div>
                    <div class="text-white text-5xl font-bold ml-4">${player.value}</div>
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
  await page.setViewportSize({ width: 1200, height: 1000 });
  
  // Generate HTML content
  const htmlContent = generatePlayerHTML(data);
  
  // Write HTML to temporary file for proper logo loading
  const tempHtmlPath = path.join(__dirname, '..', 'output', 'temp-player-graphic-mock.html');
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
    console.log('🚀 Starting Player Leaders Mock generation...');
    console.log('🎨 Testing subtle team color backgrounds...');
    
    // Generate graphics for each stat
    for (const [statKey, data] of Object.entries(mockPlayerData)) {
      console.log(`\n🎨 Generating ${statKey} player leaders mock...`);
      
      // Generate HTML
      const htmlContent = generatePlayerHTML(data);
      const htmlPath = path.join(__dirname, '..', 'output', `player-${statKey}-mock.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`✅ HTML: ${htmlPath}`);
      
      // Generate PNG
      const pngPath = path.join(__dirname, '..', 'output', `player-${statKey}-mock.png`);
      await generatePNG(data, pngPath);
      console.log(`✅ PNG: ${pngPath}`);
    }
    
    console.log('\n🎉 All player graphics mocks generated successfully!');
    console.log('📁 Check the output folder for HTML and PNG files');
    console.log('🎨 Testing subtle team color backgrounds with 15% opacity');
    
  } catch (error) {
    console.error('💥 Error generating player graphics mock:', error);
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

export { generatePlayerHTML, generatePNG, createSubtleBackgroundColor, createSubtleBorderColor, main };
