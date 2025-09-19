import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTML, generatePNG, getTeamColors, generateTeamLogo } from './generate-leaders.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced format with better styling
const enhancedFormatData = {
  title: "TEAM RUSHING LEADERS (ENHANCED FORMAT)",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "rushingYards",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "1,250 YDS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(156.3 YPG)</span>"
    },
    {
      rank: 2,
      name: "Alabama",
      record: "7-1", 
      conference: "SEC",
      value: "1,180 YDS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(147.5 YPG)</span>"
    },
    {
      rank: 3,
      name: "Ohio State",
      record: "8-0",
      conference: "Big Ten", 
      value: "1,120 YDS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(140.0 YPG)</span>"
    },
    {
      rank: 4,
      name: "Michigan",
      record: "8-0",
      conference: "Big Ten",
      value: "1,080 YDS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(135.0 YPG)</span>"
    },
    {
      rank: 5,
      name: "Texas",
      record: "7-1",
      conference: "SEC",
      value: "1,040 YDS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(130.0 YPG)</span>"
    },
    {
      rank: 6,
      name: "Oregon",
      record: "6-2",
      conference: "Pac-12",
      value: "980 YDS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(122.5 YPG)</span>"
    }
  ]
};

// Different stat types to show rounding examples
const mixedStatsData = {
  title: "MIXED STATS FORMATTING TEST",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "mixed",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "1,250 YDS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(156.3 YPG)</span>"
    },
    {
      rank: 2,
      name: "Alabama",
      record: "7-1", 
      conference: "SEC",
      value: "28 SACKS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(3.5 PG)</span>"
    },
    {
      rank: 3,
      name: "Ohio State",
      record: "8-0",
      conference: "Big Ten", 
      value: "2,800 YDS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(350.0 YPG)</span>"
    },
    {
      rank: 4,
      name: "Michigan",
      record: "8-0",
      conference: "Big Ten",
      value: "15 TO <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(1.9 PG)</span>"
    },
    {
      rank: 5,
      name: "Texas",
      record: "7-1",
      conference: "SEC",
      value: "45 CONV <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(5.6 PG)</span>"
    },
    {
      rank: 6,
      name: "Oregon",
      record: "6-2",
      conference: "Pac-12",
      value: "4,200 YDS <span style='font-style: italic; font-size: 0.8em; color: rgba(255,255,255,0.8);'>(525.0 YPG)</span>"
    }
  ]
};

// Main function
async function main() {
  try {
    console.log('🎨 Generating ENHANCED FORMAT mock graphics...');
    
    // Generate Enhanced Rushing Format
    console.log('📊 Creating Enhanced Rushing Format...');
    const rushingHtmlContent = generateHTML(enhancedFormatData);
    const rushingHtmlPath = path.join(__dirname, '..', 'output', 'enhanced-rushing-format.html');
    fs.writeFileSync(rushingHtmlPath, rushingHtmlContent);
    
    const rushingPngPath = path.join(__dirname, '..', 'output', 'enhanced-rushing-format.png');
    await generatePNG(enhancedFormatData, rushingPngPath);
    console.log('✅ Enhanced Rushing Format generated');
    
    // Generate Mixed Stats Format
    console.log('📊 Creating Mixed Stats Format...');
    const mixedHtmlContent = generateHTML(mixedStatsData);
    const mixedHtmlPath = path.join(__dirname, '..', 'output', 'enhanced-mixed-stats.html');
    fs.writeFileSync(mixedHtmlPath, mixedHtmlContent);
    
    const mixedPngPath = path.join(__dirname, '..', 'output', 'enhanced-mixed-stats.png');
    await generatePNG(mixedStatsData, mixedPngPath);
    console.log('✅ Mixed Stats Format generated');
    
    console.log('\n🌐 ENHANCED FORMAT FILES:');
    console.log(`📁 Rushing: ${rushingHtmlPath}`);
    console.log(`📁 Mixed: ${mixedHtmlPath}`);
    console.log('\n📊 NEW FORMAT FEATURES:');
    console.log('• Main stat: Bold and prominent');
    console.log('• Per-game: Italic, smaller, subtle color');
    console.log('• Rounded numbers (no unnecessary decimals)');
    console.log('• YPG keeps 1 decimal, others are whole numbers');
    console.log('\n🎯 Open both HTML files to see the enhanced formatting!');
    
  } catch (error) {
    console.error('❌ Error generating enhanced format:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
