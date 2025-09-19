import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTML, generatePNG, getTeamColors, generateTeamLogo } from './generate-leaders.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OLD FORMAT (current)
const oldFormatData = {
  title: "TEAM RUSHING LEADERS (OLD FORMAT)",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "rushingYards",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "156.3 YPG"  // OLD: Only per-game
    },
    {
      rank: 2,
      name: "Alabama",
      record: "7-1", 
      conference: "SEC",
      value: "147.5 YPG"
    },
    {
      rank: 3,
      name: "Ohio State",
      record: "8-0",
      conference: "Big Ten", 
      value: "140.0 YPG"
    },
    {
      rank: 4,
      name: "Michigan",
      record: "8-0",
      conference: "Big Ten",
      value: "135.0 YPG"
    },
    {
      rank: 5,
      name: "Texas",
      record: "7-1",
      conference: "SEC",
      value: "130.0 YPG"
    },
    {
      rank: 6,
      name: "Oregon",
      record: "6-2",
      conference: "Pac-12",
      value: "122.5 YPG"
    }
  ]
};

// NEW FORMAT (proposed)
const newFormatData = {
  title: "TEAM RUSHING LEADERS (NEW FORMAT)",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "rushingYards",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "1,250 YDS (156.3 YPG)"  // NEW: Total + Per Game
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
    console.log('🎨 Generating FORMAT COMPARISON graphics...');
    
    // Generate OLD FORMAT
    console.log('📊 Creating OLD FORMAT (YPG only)...');
    const oldHtmlContent = generateHTML(oldFormatData);
    const oldHtmlPath = path.join(__dirname, '..', 'output', 'format-comparison-old.html');
    fs.writeFileSync(oldHtmlPath, oldHtmlContent);
    
    const oldPngPath = path.join(__dirname, '..', 'output', 'format-comparison-old.png');
    await generatePNG(oldFormatData, oldPngPath);
    console.log('✅ OLD FORMAT generated');
    
    // Generate NEW FORMAT
    console.log('📊 Creating NEW FORMAT (YDS + YPG)...');
    const newHtmlContent = generateHTML(newFormatData);
    const newHtmlPath = path.join(__dirname, '..', 'output', 'format-comparison-new.html');
    fs.writeFileSync(newHtmlPath, newHtmlContent);
    
    const newPngPath = path.join(__dirname, '..', 'output', 'format-comparison-new.png');
    await generatePNG(newFormatData, newPngPath);
    console.log('✅ NEW FORMAT generated');
    
    console.log('\n🌐 COMPARISON FILES:');
    console.log(`📁 OLD: ${oldHtmlPath}`);
    console.log(`📁 NEW: ${newHtmlPath}`);
    console.log('\n📊 OLD shows: "156.3 YPG"');
    console.log('📊 NEW shows: "1,250 YDS (156.3 YPG)"');
    console.log('\n🎯 Open both HTML files to compare the formatting!');
    
  } catch (error) {
    console.error('❌ Error generating comparison:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
