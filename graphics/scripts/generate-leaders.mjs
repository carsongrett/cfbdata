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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .team-bar {
            height: 90px;
        }
        
        .rank-number {
            font-size: 4rem;
            font-weight: 900;
            line-height: 1;
        }
        
        .team-name {
            font-size: 3.5rem;
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
<body class="bg-gray-100 m-0 p-0">
    <div class="w-[1200px] h-[800px] bg-gray-100 relative overflow-hidden">
        <!-- Main Content Container -->
        <div class="p-8 h-full flex flex-col">
            <!-- Header -->
            <div class="mb-1 p-4 rounded-lg relative" style="background-color: #20A142;">
                <h1 class="text-7xl font-black text-white mb-2 tracking-tight">
                    ${data.title}
                </h1>
                <div class="flex items-center gap-4">
                    <p class="text-2xl font-semibold text-white">
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
            <div class="flex-1 flex flex-col justify-center space-y-3">
                ${data.teams.map(team => {
                  const colors = getTeamColors(team.name);
                  const logo = generateTeamLogo(team.name);
                  
                  // For rushing yards and passing yards, show rank and move yards to far right
                  if (data.type === 'rushingYards' || data.type === 'passingYards') {
                    return `<!-- Team ${team.rank} -->
                <div class="team-bar rounded-lg flex items-center px-8 shadow-lg" style="background-color: ${colors.primary}">
                    <div class="rank-number text-white mr-8">${team.rank}</div>
                    <div class="flex-1">
                        <div class="team-name text-white">${team.name.toUpperCase()} ${data.showRecords ? `<span class="text-3xl font-bold">${team.record}</span>` : ''}</div>
                    </div>
                    <div class="text-white text-5xl font-bold">${team.value || team.record}</div>
                </div>`;
                  } else {
                    return `<!-- Team ${team.rank} -->
                <div class="team-bar rounded-lg flex items-center px-8 shadow-lg" style="background-color: ${colors.primary}">
                    <div class="rank-number text-white mr-8">${team.rank}</div>
                    <div class="flex-1">
                        <div class="team-name text-white">${team.name.toUpperCase()}</div>
                        ${data.showRecords ? `<div class="team-subtext text-white">${team.value || team.record}</div>` : ''}
                    </div>
                    <div class="team-logo text-white">${logo}</div>
                </div>`;
                  }
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
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to match our graphic dimensions
  await page.setViewportSize({ width: 1200, height: 900 });
  
  // Generate HTML content
  const htmlContent = generateHTML(data, teamIdMapping);
  
  // Set the HTML content
  await page.setContent(htmlContent);
  
  // Wait for fonts and images to load
  await page.waitForLoadState('networkidle');
  
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
