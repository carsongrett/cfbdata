import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTML, generatePNG, createLeadersData } from './generate-leaders.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load data from file or create from template
function loadLeadersData(dataFile) {
  const dataPath = path.join(__dirname, '..', 'data', dataFile);
  
  if (fs.existsSync(dataPath)) {
    console.log(`📁 Loading data from: ${dataFile}`);
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } else {
    console.log(`⚠️ Data file not found: ${dataFile}`);
    console.log('Available data files:');
    const dataDir = path.join(__dirname, '..', 'data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    files.forEach(file => console.log(`  - ${file}`));
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    // Get data file from command line argument or use default
    const dataFile = process.argv[2] || 'leaders-template.json';
    
    console.log('🎨 Generating CFB Leaders graphic...');
    console.log(`📊 Using data file: ${dataFile}`);
    
    // Load data
    const data = loadLeadersData(dataFile);
    
    // Generate HTML file
    const htmlContent = generateHTML(data);
    const htmlOutputPath = path.join(__dirname, '..', 'output', `${data.type || 'leaders'}.html`);
    fs.writeFileSync(htmlOutputPath, htmlContent);
    console.log('✅ HTML generated successfully!');
    console.log(`📁 HTML Output: ${htmlOutputPath}`);
    
    // Generate PNG file
    console.log('📸 Generating PNG...');
    const pngOutputPath = path.join(__dirname, '..', 'output', `${data.type || 'leaders'}.png`);
    await generatePNG(data, pngOutputPath);
    console.log('✅ PNG generated successfully!');
    console.log(`📁 PNG Output: ${pngOutputPath}`);
    
    console.log('🌐 Open the HTML file in a browser to preview');
    
  } catch (error) {
    console.error('❌ Error generating graphic:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Show usage if no arguments
if (process.argv.length < 3) {
  console.log('🎨 CFB Leaders Graphics Generator');
  console.log('');
  console.log('Usage: node generate-any-leaders.mjs <data-file>');
  console.log('');
  console.log('Available data files:');
  const dataDir = path.join(__dirname, '..', 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  files.forEach(file => console.log(`  - ${file}`));
  console.log('');
  console.log('Examples:');
  console.log('  node generate-any-leaders.mjs leaders-template.json');
  console.log('  node generate-any-leaders.mjs points-scorers.json');
  console.log('  node generate-any-leaders.mjs offensive-yards.json');
  console.log('  node generate-any-leaders.mjs defensive-yards.json');
  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting Leaders generation script...');
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

