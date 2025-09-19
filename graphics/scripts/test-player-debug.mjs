import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Player Debug Test...');

// Test API connection
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = 'AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN';

async function testAPI() {
  try {
    console.log('📡 Testing API connection...');
    const response = await fetch(`${CFBD_BASE}/stats/player/season?year=2025&category=rushing`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API connection successful');
    console.log(`📊 Received ${data.length} player records`);
    console.log('📋 Sample record:', JSON.stringify(data[0], null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ API Error:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const players = await testAPI();
    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
}

main();
