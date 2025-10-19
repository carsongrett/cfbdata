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

// Function removed - no longer using team-specific colors

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
    'Michigan State': 'Michigan_State_Spartans_logo-300x300.png',
    'South Florida': 'South_Florida_Bulls_logo-300x300.png'
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CFB Data's Top 25 - Week ${week}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            width: 100%;
            background: rgba(30, 58, 138, 0.9);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: 2px solid #3b82f6;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
        }

        .main-title {
            font-size: 48px;
            font-weight: 900;
            color: #fff;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            margin-bottom: 10px;
            letter-spacing: 1px;
        }

        .week-badge {
            display: inline-block;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #000;
            padding: 8px 24px;
            border-radius: 25px;
            font-size: 24px;
            font-weight: bold;
            text-shadow: none;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
            margin-bottom: 20px;
        }

        .action-buttons {
            position: absolute;
            top: 0;
            right: 0;
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            border: none;
            cursor: pointer;
        }

        .btn-logo {
            background: transparent;
            border: none;
            padding: 0;
            width: 120px;
            height: 60px;
        }

        .btn-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 15px;
            margin-top: 20px;
        }

        .team-card {
            background: #e5e7eb;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            position: relative;
            border: 2px solid transparent;
            min-height: 160px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .rank-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background: #374151;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 2px solid #6b7280;
        }

        .team-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin: 10px 0;
            filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }

        @media (max-width: 768px) {
            .grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }
            
            .main-title {
                font-size: 36px;
            }
            
            .week-badge {
                font-size: 20px;
                padding: 6px 20px;
            }

            .btn-logo {
                width: 100px;
                height: 50px;
            }
        }

        @media (max-width: 480px) {
            .grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .main-title {
                font-size: 28px;
            }

            .btn-logo {
                width: 80px;
                height: 40px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="action-buttons">
                <button class="btn btn-logo">
                    ${yourLogoDataUrl ? `<img src="${yourLogoDataUrl}" alt="CFB Data Logo">` : '<div style="background: #ccc; color: #666; font-weight: bold;">LOGO</div>'}
                </button>
            </div>
            
            <h1 class="main-title">CFB DATA'S TOP 25</h1>
            <div class="week-badge">WEEK ${week}</div>
        </div>

        <div class="grid">
            ${teams.map(team => {
              // Get team logo
              const logoFileName = getTeamLogoPath(team.school);
              const logoPath = logoFileName ? path.join(__dirname, '..', 'assets', 'team icons', logoFileName) : null;
              const logoDataUrl = logoPath && fs.existsSync(logoPath) ? encodeImageToBase64(logoPath) : null;
              
              return `
            <div class="team-card">
                <div class="rank-badge">${team.rank}</div>
                ${logoDataUrl ? 
                  `<img src="${logoDataUrl}" alt="${team.school}" class="team-logo">` :
                  `<div class="team-logo" style="display: flex; align-items: center; justify-content: center; background: #ccc; color: #666; font-weight: bold; font-size: 12px;">${team.school.substring(0, 3).toUpperCase()}</div>`
                }
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
  await page.setViewportSize({ width: 1000, height: 1200 });
  
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
    
    const htmlPath = path.join(__dirname, '..', 'output', 'cfb-data-top25-real.html');
    const pngPath = path.join(__dirname, '..', 'output', 'cfb-data-top25-real.png');
    
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