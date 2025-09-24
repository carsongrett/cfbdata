import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate PNG from HTML file
async function generatePNGFromHTML(htmlPath, outputPath) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport size for taller graphic to fit all 6 players
  await page.setViewportSize({ width: 1600, height: 1200 });
  
  // Load the HTML file directly from its path
  await page.goto('file://' + htmlPath);
  
  // Wait for fonts to load specifically
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for fonts to load by checking if Inter font is available
  await page.evaluate(() => {
    return document.fonts.ready;
  });
  
  // Additional wait to ensure fonts are rendered
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({
    path: outputPath,
    type: 'png',
    fullPage: false
  });
  
  await browser.close();
}

// Main function
async function main() {
  try {
    console.log('🎨 Generating PNG from mock HTML...');
    
    const htmlPath = path.join(__dirname, '..', 'output', 'player-graphics-mock.html');
    const pngPath = path.join(__dirname, '..', 'output', 'player-graphics-mock.png');
    
    // Check if HTML file exists
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML file not found: ${htmlPath}`);
    }
    
    console.log('📸 Converting HTML to PNG...');
    await generatePNGFromHTML(htmlPath, pngPath);
    
    console.log('✅ PNG generated successfully!');
    console.log(`📁 PNG Output: ${pngPath}`);
    
  } catch (error) {
    console.error('❌ Error generating PNG:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
