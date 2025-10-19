import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load team colors data
const teamColorsPath = path.join(__dirname, '..', 'data', 'team_colors.json');
const teamColors = JSON.parse(fs.readFileSync(teamColorsPath, 'utf8'));

// Load sample rankings data
const sampleDataPath = path.join(__dirname, '..', 'data', 'sample-rankings.json');
const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

// Function to get team colors by name
function getTeamColors(teamName) {
  const team = teamColors.find(t => t.name === teamName);
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

// Function to generate HTML content
function generateHTML(data) {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CFB Power Rankings</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .team-bar {
            height: 100px;
        }
        
        .rank-number {
            font-size: 4rem;
            font-weight: 900;
            line-height: 1;
        }
        
        .team-name {
            font-size: 2.5rem;
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
            width: 80px;
            height: 80px;
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
        }
    </style>
</head>
<body class="bg-gray-100 m-0 p-0">
    <div class="w-[1200px] h-[900px] bg-gray-100 relative overflow-hidden">
        <!-- Main Content Container -->
        <div class="p-12 h-full flex flex-col">
            <!-- Header -->
            <div class="mb-1 p-4 rounded-lg" style="background-color: #20A142;">
                <h1 class="text-6xl font-black text-white mb-2 tracking-tight">
                    ${data.title}
                </h1>
                <div class="flex items-center gap-4">
                    <p class="text-2xl font-semibold text-white">
                        ${data.subtitle}
                    </p>
                    <div class="logo-container">
                        <img src="../assets/x_logo.png" alt="" class="logo-image" />
                    </div>
                </div>
            </div>
            
            <!-- Teams Container -->
            <div class="flex-1 flex flex-col justify-center space-y-2">
                ${data.teams.map(team => {
                  const colors = getTeamColors(team.name);
                  const logo = generateTeamLogo(team.name);
                  
                  return `<!-- Team ${team.rank} -->
                <div class="team-bar rounded-lg flex items-center px-8 shadow-lg" style="background-color: ${colors.primary}">
                    <div class="rank-number text-white mr-8">${team.rank}</div>
                    <div class="flex-1">
                        <div class="team-name text-white">${team.name.toUpperCase()}</div>
                        ${data.showRecords ? `<div class="team-subtext text-white">${team.record}</div>` : ''}
                    </div>
                    <div class="team-logo text-white">${logo}</div>
                </div>`;
                }).join('\n')}
            </div>
        </div>
        
    </div>
</body>
</html>`;

  return template;
}

// Main function
function main() {
  try {
    console.log('🎨 Generating CFB Power Rankings graphic...');
    
    // Generate HTML content
    const htmlContent = generateHTML(sampleData);
    
    // Write to output file
    const outputPath = path.join(__dirname, '..', 'output', 'power-rankings.html');
    fs.writeFileSync(outputPath, htmlContent);
    
    console.log('✅ HTML generated successfully!');
    console.log(`📁 Output: ${outputPath}`);
    console.log('🌐 Open the HTML file in a browser to preview');
    
  } catch (error) {
    console.error('❌ Error generating graphic:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateHTML, getTeamColors, generateTeamLogo };
