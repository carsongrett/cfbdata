import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateMockPNG() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to match our graphic dimensions
  await page.setViewportSize({ width: 960, height: 960 });
  
  // Read the mock HTML file
  const htmlPath = path.join(__dirname, '..', 'output', 'ranked-matchups-mock-formatting.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Set the HTML content
  await page.setContent(htmlContent);
  
  // Wait for fonts to load
  await page.waitForTimeout(2000);
  
  // Take screenshot
  const outputPath = path.join(__dirname, '..', 'output', 'ranked-matchups-mock-formatting.png');
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    type: 'png'
  });
  
  await browser.close();
  console.log(`✅ Mock PNG generated: ${outputPath}`);
}

generateMockPNG().catch(console.error);
