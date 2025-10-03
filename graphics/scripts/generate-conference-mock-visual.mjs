import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple mock data for visual testing
const MOCK_CONFERENCES = [
  {
    name: 'SEC',
    displayName: 'SEC RANKINGS',
    teams: [
      { name: 'Georgia', record: '11-1', pointsDiff: '+285' },
      { name: 'Alabama', record: '10-2', pointsDiff: '+198' },
      { name: 'LSU', record: '9-3', pointsDiff: '+156' },
      { name: 'Tennessee', record: '9-3', pointsDiff: '+134' },
      { name: 'Texas A&M', record: '8-4', pointsDiff: '+87' },
      { name: 'Ole Miss', record: '8-4', pointsDiff: '+72' },
      { name: 'Auburn', record: '7-5', pointsDiff: '+23' },
      { name: 'Missouri', record: '7-5', pointsDiff: '+15' },
      { name: 'Kentucky', record: '6-6', pointsDiff: '-12' },
      { name: 'South Carolina', record: '6-6', pointsDiff: '-28' },
      { name: 'Florida', record: '5-7', pointsDiff: '-45' },
      { name: 'Arkansas', record: '5-7', pointsDiff: '-52' },
      { name: 'Mississippi State', record: '4-8', pointsDiff: '-89' },
      { name: 'Vanderbilt', record: '2-10', pointsDiff: '-178' }
    ]
  },
  {
    name: 'Pac-12',
    displayName: 'PAC-12 RANKINGS',
    teams: [
      { name: 'Oregon', record: '11-1', pointsDiff: '+267' },
      { name: 'Washington', record: '10-2', pointsDiff: '+189' },
      { name: 'USC', record: '9-3', pointsDiff: '+156' },
      { name: 'UCLA', record: '8-4', pointsDiff: '+98' },
      { name: 'Utah', record: '7-5', pointsDiff: '+45' },
      { name: 'Arizona State', record: '6-6', pointsDiff: '-12' },
      { name: 'Stanford', record: '5-7', pointsDiff: '-34' },
      { name: 'Oregon State', record: '4-8', pointsDiff: '-67' },
      { name: 'Washington State', record: '3-9', pointsDiff: '-98' },
      { name: 'Colorado', record: '2-10', pointsDiff: '-156' },
      { name: 'California', record: '1-11', pointsDiff: '-234' }
    ]
  }
];

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
    'Texas A&M': 'Texas_AM_University_logo-300x300.png',
    'Vanderbilt': 'Vanderbilt_Commodores_logo-300x300.png',
    'Arkansas': 'Arkansas_Razorbacks_logo-300x300.png',
    'USC': 'USC_Trojans_logo-300x300.png',
    'UCLA': 'UCLA_Bruins-300x300.png',
    'Oregon': 'Oregon_Ducks_logo-300x300.png',
    'Washington': 'Washington_Huskies_logo-300x300.png',
    'Arizona State': 'Arizona_State_Sun_Devils_logo-300x300.png',
    'Stanford': 'Stanford_Cardinal_logo-300x300.png',
    'Oregon State': 'Oregon_State_Beavers_logo-300x300.png',
    'Washington State': 'Washington_State_Cougars_logo-300x300.png',
    'Colorado': 'Colorado_Buffaloes_logo-300x300.png',
    'California': 'California_Golden_Bears_logo-300x300.png',
    'Utah': 'Utah_Utes_logo-300x300.png'
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

// Function to get layout based on team count
function getLayoutConfig(teamCount) {
  if (teamCount <= 10) {
    return {
      logoSize: '80px',
      teamBarHeight: '80px',
      rankFontSize: '4rem',
      teamNameFontSize: '3.5rem',
      recordFontSize: '2.5rem',
      pointsDiffFontSize: '3rem',
      spacing: '3'
    };
  } else {
    return {
      logoSize: '60px',
      teamBarHeight: '70px',
      rankFontSize: '3.5rem',
      teamNameFontSize: '3rem',
      recordFontSize: '2rem',
      pointsDiffFontSize: '2.5rem',
      spacing: '2'
    };
  }
}

// Function to generate HTML
function generateHTML(conference, teams) {
  const layout = getLayoutConfig(teams.length);
  
  // Load CFB logo
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
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conference.displayName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
        
        body {
            font-family: 'Oswald', sans-serif;
        }
        
        .team-bar {
            height: ${layout.teamBarHeight};
            background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%) !important;
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
<body class="m-0 p-0" style="background: #1a1a1a;">
    <div class="w-[1000px] h-[1000px] relative overflow-hidden" style="background: #1a1a1a;">
        <div class="p-8 h-full flex flex-col">
            <!-- Header -->
            <div class="mb-6 p-4 rounded-lg relative" style="background-color: #ffffff;">
                <h1 class="conference-title text-gray-900 mb-2 tracking-tight">
                    ${conference.displayName}
                </h1>
                <div class="flex items-center gap-4">
                    <p class="conference-subtitle text-gray-900">
                        VISUAL MOCK - VIA CFB DATA
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
                  // Get team logo
                  const logoFileName = getTeamLogoPath(team.name);
                  const logoPath = logoFileName ? path.join(__dirname, '..', 'assets', 'team icons', logoFileName) : null;
                  const logoDataUrl = logoPath && fs.existsSync(logoPath) ? encodeImageToBase64(logoPath) : null;
                  
                  let logoHtml = '';
                  if (logoDataUrl) {
                    logoHtml = `<img src="${logoDataUrl}" alt="${team.name} Logo" class="team-logo mr-3 object-contain" style="filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));">`;
                  }
                  
                  // Simple color scheme - alternating colors
                  const colors = index % 2 === 0 ? '#9E1B32' : '#00274C'; // Alabama red or Michigan blue
                  
                  return `<!-- Team ${index + 1} -->
                <div class="team-bar rounded-lg flex items-center px-4 shadow-lg" style="border: 3px solid ${colors};">
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
}

// Generate PNG
async function generatePNG(data, outputPath) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1000, height: 1000 });
  
  const htmlContent = generateHTML(data.conference, data.teams);
  
  const tempHtmlPath = path.join(__dirname, '..', 'output', `temp-${data.conference.name.toLowerCase()}-visual-mock.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent);
  
  await page.goto('file://' + tempHtmlPath);
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3000);
  
  await page.screenshot({
    path: outputPath,
    type: 'png',
    fullPage: false
  });
  
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
    console.log('🎨 Generating Conference Rankings Visual Mock...');
    console.log('Current working directory:', process.cwd());
    
    for (const conference of MOCK_CONFERENCES) {
      console.log(`\n📊 Generating ${conference.displayName} (${conference.teams.length} teams)...`);
      
      // Generate HTML
      const htmlContent = generateHTML(conference, conference.teams);
      const htmlPath = path.join(__dirname, '..', 'output', `${conference.name.toLowerCase()}-visual-mock.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`✅ HTML: ${htmlPath}`);
      
      // Generate PNG
      const pngPath = path.join(__dirname, '..', 'output', `${conference.name.toLowerCase()}-visual-mock.png`);
      await generatePNG({ conference, teams: conference.teams }, pngPath);
      console.log(`✅ PNG: ${pngPath}`);
    }
    
    console.log('\n🎉 Visual mock graphics generated!');
    
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
}

// Run it
console.log('Script loaded, running main function...');
main().catch(console.error);

export { generateHTML, generatePNG, main };
