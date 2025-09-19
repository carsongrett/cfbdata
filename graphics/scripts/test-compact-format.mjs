import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTML, generatePNG, getTeamColors, generateTeamLogo } from './generate-leaders.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Compact format with smaller YPG tags
const compactFormatData = {
  title: "TEAM RUSHING LEADERS (COMPACT FORMAT)",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "rushingYards",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "1,250 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(156.3 YPG)</span>"
    },
    {
      rank: 2,
      name: "Alabama",
      record: "7-1", 
      conference: "SEC",
      value: "1,180 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(147.5 YPG)</span>"
    },
    {
      rank: 3,
      name: "Ohio State",
      record: "8-0",
      conference: "Big Ten", 
      value: "1,120 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(140.0 YPG)</span>"
    },
    {
      rank: 4,
      name: "Michigan",
      record: "8-0",
      conference: "Big Ten",
      value: "1,080 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(135.0 YPG)</span>"
    },
    {
      rank: 5,
      name: "Texas",
      record: "7-1",
      conference: "SEC",
      value: "1,040 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(130.0 YPG)</span>"
    },
    {
      rank: 6,
      name: "Oregon",
      record: "6-2",
      conference: "Pac-12",
      value: "980 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(122.5 YPG)</span>"
    }
  ]
};

// Even more compact with different YPG tag sizes
const ultraCompactData = {
  title: "TEAM RUSHING LEADERS (ULTRA COMPACT)",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "rushingYards",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "1,250 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>(156.3 YPG)</span>"
    },
    {
      rank: 2,
      name: "Alabama",
      record: "7-1", 
      conference: "SEC",
      value: "1,180 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>(147.5 YPG)</span>"
    },
    {
      rank: 3,
      name: "Ohio State",
      record: "8-0",
      conference: "Big Ten", 
      value: "1,120 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>(140.0 YPG)</span>"
    },
    {
      rank: 4,
      name: "Michigan",
      record: "8-0",
      conference: "Big Ten",
      value: "1,080 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>(135.0 YPG)</span>"
    },
    {
      rank: 5,
      name: "Texas",
      record: "7-1",
      conference: "SEC",
      value: "1,040 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>(130.0 YPG)</span>"
    },
    {
      rank: 6,
      name: "Oregon",
      record: "6-2",
      conference: "Pac-12",
      value: "980 YDS <span style='font-style: italic; font-size: 0.6em; color: rgba(255,255,255,0.8);'>(122.5 YPG)</span>"
    }
  ]
};

// Alternative format with even shorter YPG tags
const shortTagData = {
  title: "TEAM RUSHING LEADERS (SHORT TAGS)",
  subtitle: "VIA CFB DATA",
  showRecords: true,
  type: "rushingYards",
  teams: [
    {
      rank: 1,
      name: "Georgia",
      record: "8-0",
      conference: "SEC",
      value: "1,250 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(156.3/G)</span>"
    },
    {
      rank: 2,
      name: "Alabama",
      record: "7-1", 
      conference: "SEC",
      value: "1,180 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(147.5/G)</span>"
    },
    {
      rank: 3,
      name: "Ohio State",
      record: "8-0",
      conference: "Big Ten", 
      value: "1,120 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(140.0/G)</span>"
    },
    {
      rank: 4,
      name: "Michigan",
      record: "8-0",
      conference: "Big Ten",
      value: "1,080 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(135.0/G)</span>"
    },
    {
      rank: 5,
      name: "Texas",
      record: "7-1",
      conference: "SEC",
      value: "1,040 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(130.0/G)</span>"
    },
    {
      rank: 6,
      name: "Oregon",
      record: "6-2",
      conference: "Pac-12",
      value: "980 YDS <span style='font-style: italic; font-size: 0.7em; color: rgba(255,255,255,0.8);'>(122.5/G)</span>"
    }
  ]
};

// Main function
async function main() {
  try {
    console.log('🎨 Generating COMPACT FORMAT mock graphics...');
    
    // Generate Compact Format (0.7em)
    console.log('📊 Creating Compact Format (0.7em)...');
    const compactHtmlContent = generateHTML(compactFormatData);
    const compactHtmlPath = path.join(__dirname, '..', 'output', 'compact-format.html');
    fs.writeFileSync(compactHtmlPath, compactHtmlContent);
    
    const compactPngPath = path.join(__dirname, '..', 'output', 'compact-format.png');
    await generatePNG(compactFormatData, compactPngPath);
    console.log('✅ Compact Format generated');
    
    // Generate Ultra Compact Format (0.6em)
    console.log('📊 Creating Ultra Compact Format (0.6em)...');
    const ultraHtmlContent = generateHTML(ultraCompactData);
    const ultraHtmlPath = path.join(__dirname, '..', 'output', 'ultra-compact-format.html');
    fs.writeFileSync(ultraHtmlPath, ultraHtmlContent);
    
    const ultraPngPath = path.join(__dirname, '..', 'output', 'ultra-compact-format.png');
    await generatePNG(ultraCompactData, ultraPngPath);
    console.log('✅ Ultra Compact Format generated');
    
    // Generate Short Tags Format
    console.log('📊 Creating Short Tags Format...');
    const shortHtmlContent = generateHTML(shortTagData);
    const shortHtmlPath = path.join(__dirname, '..', 'output', 'short-tags-format.html');
    fs.writeFileSync(shortHtmlPath, shortHtmlContent);
    
    const shortPngPath = path.join(__dirname, '..', 'output', 'short-tags-format.png');
    await generatePNG(shortTagData, shortPngPath);
    console.log('✅ Short Tags Format generated');
    
    console.log('\n🌐 COMPACT FORMAT FILES:');
    console.log(`📁 Compact (0.7em): ${compactHtmlPath}`);
    console.log(`📁 Ultra Compact (0.6em): ${ultraHtmlPath}`);
    console.log(`📁 Short Tags (/G): ${shortHtmlPath}`);
    console.log('\n📊 FORMAT COMPARISON:');
    console.log('• Compact: 1,250 YDS *(156.3 YPG)*');
    console.log('• Ultra: 1,250 YDS *(156.3 YPG)*');
    console.log('• Short: 1,250 YDS *(156.3/G)*');
    console.log('\n🎯 Open all three HTML files to compare width usage!');
    
  } catch (error) {
    console.error('❌ Error generating compact format:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
