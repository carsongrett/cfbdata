import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = process.env.CFBD_API_KEY || 'vWJ5SPrCVwGbFMQEb+qepkkcU+GVRy+cQLg6QqN2v0+1DHxVEPDUR01WWulIfji2';

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
  // Team name mappings to actual logo file names
  const teamMappings = {
    'USC': 'USC_Trojans_logo-300x300.png',
    'Georgia Tech': 'Georgia_Tech_Yellow_Jackets_logo-300x300.png',
    'Mississippi State': 'Mississippi_State_Bulldogs_logo-300x300.png',
    'Vanderbilt': 'Vanderbilt_Commodores_logo-300x300.png',
    'Iowa State': 'Iowa_State_Cyclones_logo-300x300.png',
    'Miami': 'Miami_Hurricanes_logo-300x300.png',
    'Maryland': 'Maryland_Terrapins_logo-300x300.png',
    'Missouri': 'Missouri_Tigers_logo-300x300.png',
    'LSU': 'LSU_Tigers-300x300.png',
    'Oregon': 'Oregon_Ducks_logo-300x300.png',
    'Indiana': 'Indiana_Hoosiers_logo-300x300.png',
    'Ole Miss': 'Ole_Miss_Rebels_logo-300x300.png',
    'Texas Tech': 'Texas_Tech_Red_Raiders_logo-300x300.png',
    'Oklahoma': 'Oklahoma_Sooners_logo-300x300.png',
    'BYU': 'BYU_Cougars_logo-300x300.png',
    'Georgia': 'Georgia_Bulldogs_logo-300x300.png',
    'Arizona': 'Arizona_Wildcats_logo-300x300.png',
    'Texas A&M': 'Texas_AM_University_logo-300x300.png',
    'UCF': 'UCF_Knights_logo-300x300.png',
    'Houston': 'Houston_Cougars_logo-300x300.png',
    'Florida State': 'Florida_State_Seminoles_logo-300x300.png',
    'Ohio State': 'Ohio_State_Buckeyes_logo-300x300.png',
    'Washington': 'Washington_Huskies_logo-300x300.png',
    'TCU': 'TCU_Horned_Frogs_logo-300x300.png',
    'Penn State': 'Penn_State_Nittany_Lions_logo-300x300.png',
    'Louisville': 'Louisville_Cardinals_logo-300x300.png',
    'Oregon State': 'Oregon_State_Beavers_logo-300x300.png',
    'UCLA': 'UCLA_Bruins-300x300.png'
  };
  
  return teamMappings[teamName] || null;
}

// Function to generate HTML template
function generateHTMLTemplate(teams, title, subtitle) {
  // Calculate dynamic grid properties
  const teamCount = teams.length;
  let columns, logoSize, gridJustify;
  
  if (teamCount === 2) {
    columns = 2; // Side by side for exactly 2 teams
    logoSize = '250px'; // Much larger for just 2 teams
    gridJustify = 'center';
  } else if (teamCount === 3) {
    columns = 3; // Use exact number of teams for 3
    logoSize = '180px'; // Larger for 3 teams
    gridJustify = 'center';
  } else if (teamCount <= 5) {
    columns = 3;
    logoSize = '150px';
    gridJustify = 'center';
  } else if (teamCount <= 15) {
    columns = 4;
    logoSize = '130px';
    gridJustify = 'start';
  } else {
    columns = 5;
    logoSize = '110px';
    gridJustify = 'start';
  }
  
  // Get your logo
  const yourLogoPath = path.join(__dirname, '..', 'assets', 'x_logo.png');
  const yourLogoDataUrl = encodeImageToBase64(yourLogoPath);
  
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=960, height=960, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .logo-grid {
            display: grid;
            grid-template-columns: repeat(${columns}, minmax(0, 1fr));
            gap: 1.5rem; /* Equivalent to Tailwind's gap-6 */
            width: 100%;
            max-width: 800px; /* Adjust as needed */
            margin: 0 auto;
            justify-content: ${gridJustify};
        }
        .team-logo-container {
            width: ${logoSize};
            height: ${logoSize};
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #fff; /* White background for logos */
            border-radius: 0.75rem; /* Equivalent to Tailwind's rounded-lg */
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Tailwind shadow-md */
        }
        .team-logo-image {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        }
        .team-logo-text {
            color: #000;
            font-weight: 800;
            font-size: 2rem; /* Adjust as needed */
            text-align: center;
        }
    </style>
</head>
<body class="bg-gray-900 text-white m-0 p-0">
    <div class="w-[960px] h-[960px] bg-gray-900 relative overflow-hidden">
        <!-- Main Content Container -->
        <div class="p-8 h-full flex flex-col">
            <!-- Header -->
            <div class="text-center mb-6">
                <h1 class="text-7xl font-black text-white mb-2 tracking-tight">
                    ${title.toUpperCase()}
                </h1>
                <p class="text-xl font-medium text-gray-400 mt-2">Power 5 Only</p>
            </div>
            
            <!-- Teams Grid -->
            <div class="flex-1 flex items-center justify-center">
                <div class="logo-grid">
                    ${teams.map(team => {
                      const logoFileName = getTeamLogoPath(team.team);
                      const logoPath = logoFileName ? path.join(__dirname, '..', 'assets', 'team icons', logoFileName) : null;
                      const logoDataUrl = logoPath && fs.existsSync(logoPath) ? encodeImageToBase64(logoPath) : null;
                      
                      let logoHtml;
                      if (logoDataUrl) {
                        logoHtml = `<img src="${logoDataUrl}" alt="${team.team} Logo" class="team-logo-image" />`;
                      } else {
                        logoHtml = `<div class="team-logo-text">${team.team.substring(0, 3).toUpperCase()}</div>`;
                      }
                      
                      return `
                        <div class="team-logo-container">
                            ${logoHtml}
                        </div>
                      `;
                    }).join('\n')}
                </div>
            </div>
            
            <!-- Footer -->
            <div class="flex justify-end items-center">
                <div class="flex items-center gap-2">
                    ${yourLogoDataUrl ? `<img src="${yourLogoDataUrl}" alt="Logo" class="h-40 w-40" />` : ''}
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

async function generateUndefeatedWinlessGraphics() {
  console.log('🚀 Starting real Undefeated/Winless graphics generation...\n');
  
  try {
    // Fetch 2025 season data
    const currentYear = 2025;
    console.log(`📅 Fetching data for ${currentYear} season...`);
    
    // Get team records directly from records endpoint
    const recordsUrl = `/records?year=${currentYear}`;
    const records = await fetchCFBDData(recordsUrl);
    
    console.log(`📊 Total team records found: ${records.length}`);
    
    // Define Power 5 conferences
    const power5Conferences = ['SEC', 'Big Ten', 'ACC', 'Big 12', 'Pac-12'];
    
    // Filter for Power 5 teams only
    const power5Teams = records.filter(team => 
      power5Conferences.includes(team.conference)
    );
    
    console.log(`🏈 Power 5 teams found: ${power5Teams.length}`);
    
    // Filter for undefeated Power 5 teams (wins > 0, losses = 0)
    const undefeatedTeams = power5Teams
      .filter(team => team.total.wins > 0 && team.total.losses === 0)
      .sort((a, b) => b.total.wins - a.total.wins);
    
    // Filter for winless Power 5 teams (wins = 0, losses > 0)
    const winlessTeams = power5Teams
      .filter(team => team.total.wins === 0 && team.total.losses > 0)
      .sort((a, b) => b.total.losses - a.total.losses);
    
    console.log(`\n🏆 Undefeated Power 5 teams: ${undefeatedTeams.length}`);
    console.log(`😔 Winless Power 5 teams: ${winlessTeams.length}`);
    
    // Generate undefeated teams graphic
    if (undefeatedTeams.length > 0) {
      console.log('\n🎨 Generating undefeated teams graphic...');
      const undefeatedHTML = generateHTMLTemplate(undefeatedTeams, 'Undefeated Teams');
      
      const undefeatedHTMLPath = path.join(__dirname, '..', 'output', 'undefeated-teams-real.html');
      const undefeatedPNGPath = path.join(__dirname, '..', 'output', 'undefeated-teams-real.png');
      
      fs.writeFileSync(undefeatedHTMLPath, undefeatedHTML);
      console.log(`✅ HTML: ${undefeatedHTMLPath}`);
      
      await generatePNG(undefeatedHTML, undefeatedPNGPath);
      console.log(`✅ PNG: ${undefeatedPNGPath}`);
    }
    
    // Generate winless teams graphic
    if (winlessTeams.length > 0) {
      console.log('\n🎨 Generating winless teams graphic...');
      const winlessHTML = generateHTMLTemplate(winlessTeams, 'Winless Teams');
      
      const winlessHTMLPath = path.join(__dirname, '..', 'output', 'winless-teams-real.html');
      const winlessPNGPath = path.join(__dirname, '..', 'output', 'winless-teams-real.png');
      
      fs.writeFileSync(winlessHTMLPath, winlessHTML);
      console.log(`✅ HTML: ${winlessHTMLPath}`);
      
      await generatePNG(winlessHTML, winlessPNGPath);
      console.log(`✅ PNG: ${winlessPNGPath}`);
    }
    
    console.log('\n🎉 All real graphics generated successfully!');
    console.log('📁 Check the output folder for HTML and PNG files');
    
  } catch (error) {
    console.error('❌ Error generating graphics:', error.message);
  }
}

// Run the generation
generateUndefeatedWinlessGraphics().then(() => {
  console.log('\n✅ Graphics generation completed!');
}).catch(error => {
  console.error('\n❌ Graphics generation failed:', error.message);
});
