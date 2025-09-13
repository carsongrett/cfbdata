#!/usr/bin/env node

console.log('🧪 Testing GitHub Actions Workflow Steps...\n');

// Step 1: Check Node.js version
console.log('1️⃣ Testing Node.js version...');
console.log('Node version:', process.version);
console.log('✅ Node.js OK\n');

// Step 2: Check dependencies
console.log('2️⃣ Testing dependencies...');
try {
  const fs = await import('fs');
  const path = await import('path');
  console.log('✅ fs and path modules OK');
} catch (error) {
  console.error('❌ Basic modules failed:', error.message);
}

// Step 3: Check Playwright
console.log('3️⃣ Testing Playwright...');
try {
  const { chromium } = await import('playwright');
  console.log('✅ Playwright import OK');
} catch (error) {
  console.error('❌ Playwright failed:', error.message);
}

// Step 4: Check script imports
console.log('4️⃣ Testing script imports...');
try {
  const teamScript = await import('./scripts/generate-cfbd-leaders.mjs');
  console.log('✅ Team graphics script import OK');
} catch (error) {
  console.error('❌ Team script import failed:', error.message);
}

try {
  const playerScript = await import('./scripts/generate-player-leaders.mjs');
  console.log('✅ Player graphics script import OK');
} catch (error) {
  console.error('❌ Player script import failed:', error.message);
}

// Step 5: Check output directory
console.log('5️⃣ Testing output directory...');
try {
  const fs = await import('fs');
  const outputDir = './output';
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    console.log(`✅ Output directory exists with ${files.length} files`);
  } else {
    console.log('⚠️ Output directory does not exist (will be created)');
  }
} catch (error) {
  console.error('❌ Output directory check failed:', error.message);
}

console.log('\n🎉 Workflow test complete!');

