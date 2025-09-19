import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTML, generatePNG, getTeamColors, generateTeamLogo } from './generate-leaders.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data for testing the new format
const mockRushingData = {
  title: "TEAM RUSHING LEADERS",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "rushingYards",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "1,250 YDS (156.3 YPG)"  // NEW FORMAT: Total + Per Game
    },
    {
      rank: 2,
      name: "Alabama",
      record: "7-1", 
      conference: "SEC",
      value: "1,180 YDS (147.5 YPG)"
    },
    {
      rank: 3,
      name: "Ohio State",
      record: "8-0",
      conference: "Big Ten", 
      value: "1,120 YDS (140.0 YPG)"
    },
    {
      rank: 4,
      name: "Michigan",
      record: "8-0",
      conference: "Big Ten",
      value: "1,080 YDS (135.0 YPG)"
    },
    {
      rank: 5,
      name: "Texas",
      record: "7-1",
      conference: "SEC",
      value: "1,040 YDS (130.0 YPG)"
    },
    {
      rank: 6,
      name: "Oregon",
      record: "6-2",
      conference: "Pac-12",
      value: "980 YDS (122.5 YPG)"
    }
  ]
};

// Main function
async function main() {
  try {
    console.log('🎨 Generating MOCK Rushing Leaders graphic with new format...');
    
    // Generate HTML file
    const htmlContent = generateHTML(mockRushingData);
    const htmlOutputPath = path.join(__dirname, '..', 'output', 'test-rushing-format.html');
    fs.writeFileSync(htmlOutputPath, htmlContent);
    console.log('✅ HTML generated successfully!');
    console.log(`📁 HTML Output: ${htmlOutputPath}`);
    
    // Generate PNG file
    console.log('📸 Generating PNG...');
    const pngOutputPath = path.join(__dirname, '..', 'output', 'test-rushing-format.png');
    await generatePNG(mockRushingData, pngOutputPath);
    console.log('✅ PNG generated successfully!');
    console.log(`📁 PNG Output: ${pngOutputPath}`);
    
    console.log('🌐 Open the HTML file in a browser to preview the new format');
    console.log('📊 This shows: "1,250 YDS (156.3 YPG)" format');
    
  } catch (error) {
    console.error('❌ Error generating mock graphic:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
