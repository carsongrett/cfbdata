import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTML, generatePNG, getTeamColors, generateTeamLogo } from './generate-leaders.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Final format: Short tags, ultra compact, no parentheses
const finalFormatData = {
  title: "TEAM RUSHING LEADERS (FINAL FORMAT)",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "rushingYards",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "1,250 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>156.3/G</span>"
    },
    {
      rank: 2,
      name: "Alabama",
      record: "7-1", 
      conference: "SEC",
      value: "1,180 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>147.5/G</span>"
    },
    {
      rank: 3,
      name: "Ohio State",
      record: "8-0",
      conference: "Big Ten", 
      value: "1,120 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>140.0/G</span>"
    },
    {
      rank: 4,
      name: "Michigan",
      record: "8-0",
      conference: "Big Ten",
      value: "1,080 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>135.0/G</span>"
    },
    {
      rank: 5,
      name: "Texas",
      record: "7-1",
      conference: "SEC",
      value: "1,040 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>130.0/G</span>"
    },
    {
      rank: 6,
      name: "Oregon",
      record: "6-2",
      conference: "Pac-12",
      value: "980 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>122.5/G</span>"
    }
  ]
};

// Mixed stats with the final format
const mixedFinalData = {
  title: "MIXED STATS (FINAL FORMAT)",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "mixed",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "1,250 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>156.3/G</span>"
    },
    {
      rank: 2,
      name: "Alabama",
      record: "7-1", 
      conference: "SEC",
      value: "28 SACKS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>3.5/G</span>"
    },
    {
      rank: 3,
      name: "Ohio State",
      record: "8-0",
      conference: "Big Ten", 
      value: "2,800 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>350.0/G</span>"
    },
    {
      rank: 4,
      name: "Michigan",
      record: "8-0",
      conference: "Big Ten",
      value: "15 TO <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>1.9/G</span>"
    },
    {
      rank: 5,
      name: "Texas",
      record: "7-1",
      conference: "SEC",
      value: "45 CONV <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>5.6/G</span>"
    },
    {
      rank: 6,
      name: "Oregon",
      record: "6-2",
      conference: "Pac-12",
      value: "4,200 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>525.0/G</span>"
    }
  ]
};

// Main function
async function main() {
  try {
    console.log('🎨 Generating FINAL FORMAT mock graphics...');
    
    // Generate Final Rushing Format
    console.log('📊 Creating Final Rushing Format...');
    const rushingHtmlContent = generateHTML(finalFormatData);
    const rushingHtmlPath = path.join(__dirname, '..', 'output', 'final-rushing-format.html');
    fs.writeFileSync(rushingHtmlPath, rushingHtmlContent);
    
    const rushingPngPath = path.join(__dirname, '..', 'output', 'final-rushing-format.png');
    await generatePNG(finalFormatData, rushingPngPath);
    console.log('✅ Final Rushing Format generated');
    
    // Generate Mixed Stats Final Format
    console.log('📊 Creating Mixed Stats Final Format...');
    const mixedHtmlContent = generateHTML(mixedFinalData);
    const mixedHtmlPath = path.join(__dirname, '..', 'output', 'final-mixed-stats.html');
    fs.writeFileSync(mixedHtmlPath, mixedHtmlContent);
    
    const mixedPngPath = path.join(__dirname, '..', 'output', 'final-mixed-stats.png');
    await generatePNG(mixedFinalData, mixedPngPath);
    console.log('✅ Mixed Stats Final Format generated');
    
    console.log('\n🌐 FINAL FORMAT FILES:');
    console.log(`📁 Rushing: ${rushingHtmlPath}`);
    console.log(`📁 Mixed: ${mixedHtmlPath}`);
    console.log('\n📊 FINAL FORMAT FEATURES:');
    console.log('• Main stat: Bold and prominent');
    console.log('• Per-game: 156.3/G (no parentheses)');
    console.log('• Font size: 0.6em (ultra compact)');
    console.log('• Style: Italic, subtle color');
    console.log('• Width: Minimal space usage');
    console.log('\n🎯 Open both HTML files to see the final formatting!');
    
  } catch (error) {
    console.error('❌ Error generating final format:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
