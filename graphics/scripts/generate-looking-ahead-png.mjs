import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to encode image to base64
function encodeImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).slice(1);
    return `data:image/${ext};base64,${base64}`;
  } catch (error) {
    console.warn('⚠️ Could not load image:', imagePath, error.message);
    return null;
  }
}

// Function to generate PNG using Playwright
async function generatePNG(htmlPath, outputPath) {
  console.log('📖 Reading HTML file:', htmlPath);
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Convert relative image paths to absolute base64-encoded images
  const graphicsDir = path.join(__dirname, '..', 'assets', 'team icons');
  
  // Find all img src references and convert them
  htmlContent = htmlContent.replace(/src="graphics\/assets\/team icons\/([^"]+\.png)"/g, (match, filename) => {
    const imagePath = path.join(graphicsDir, filename);
    const base64 = encodeImageToBase64(imagePath);
    if (base64) {
      return `src="${base64}"`;
    }
    return match;
  });
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to match our graphic dimensions (900x900)
  await page.setViewportSize({ width: 900, height: 900 });
  
  // Set the HTML content
  await page.setContent(htmlContent);
  
  // Wait for fonts to load
  await page.waitForLoadState('domcontentloaded');
  
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
    console.log('🎨 Generating Looking Ahead graphic PNG...');
    
    const htmlPath = path.join(__dirname, '..', '..', 'looking-ahead-mock.html');
    const pngOutputPath = path.join(__dirname, '..', 'output', 'looking-ahead-mock.png');
    
    // Ensure output directory exists
    const outputDir = path.dirname(pngOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('📸 Generating PNG...');
    await generatePNG(htmlPath, pngOutputPath);
    console.log('✅ PNG generated successfully!');
    console.log(`📁 PNG Output: ${pngOutputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating PNG:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});

