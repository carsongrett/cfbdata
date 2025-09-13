import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CFBD API configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = process.env.CFBD_API_KEY;

if (!API_KEY) {
  console.error('❌ CFBD_API_KEY environment variable is required');
  console.log('Set it with: $env:CFBD_API_KEY="your-api-key"');
  process.exit(1);
}

// Function to make API requests
async function fetchCFBDData(endpoint) {
  const url = `${CFBD_BASE}${endpoint}`;
  console.log(`📡 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Success: ${data.length || 'N/A'} records`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error.message);
    return null;
  }
}

// Function to analyze team stats data
function analyzeTeamStats(data) {
  if (!data || data.length === 0) {
    console.log('❌ No team stats data available');
    return;
  }
  
  console.log('\n📊 Team Stats Analysis:');
  console.log(`Total teams: ${data.length}`);
  
  // Show sample record
  const sample = data[0];
  console.log('\n📋 Sample team record:');
  console.log(JSON.stringify(sample, null, 2));
  
  // Analyze available fields
  const fields = Object.keys(sample);
  console.log('\n🔍 Available fields:');
  fields.forEach(field => {
    const value = sample[field];
    const type = typeof value;
    console.log(`  - ${field}: ${type} (${Array.isArray(value) ? `array[${value.length}]` : value})`);
  });
  
  // Check for offensive stats
  const offensiveFields = fields.filter(f => 
    f.toLowerCase().includes('offense') || 
    f.toLowerCase().includes('passing') || 
    f.toLowerCase().includes('rushing') ||
    f.toLowerCase().includes('points') ||
    f.toLowerCase().includes('yards')
  );
  
  if (offensiveFields.length > 0) {
    console.log('\n⚡ Offensive-related fields:');
    offensiveFields.forEach(field => console.log(`  - ${field}`));
  }
  
  // Check for defensive stats
  const defensiveFields = fields.filter(f => 
    f.toLowerCase().includes('defense') || 
    f.toLowerCase().includes('allowed') ||
    f.toLowerCase().includes('against')
  );
  
  if (defensiveFields.length > 0) {
    console.log('\n🛡️ Defensive-related fields:');
    defensiveFields.forEach(field => console.log(`  - ${field}`));
  }
}

// Function to analyze season stats
function analyzeSeasonStats(data) {
  if (!data || data.length === 0) {
    console.log('❌ No season stats data available');
    return;
  }
  
  console.log('\n📊 Season Stats Analysis:');
  console.log(`Total records: ${data.length}`);
  
  // Show sample record
  const sample = data[0];
  console.log('\n📋 Sample season record:');
  console.log(JSON.stringify(sample, null, 2));
  
  // Analyze available fields
  const fields = Object.keys(sample);
  console.log('\n🔍 Available fields:');
  fields.forEach(field => {
    const value = sample[field];
    const type = typeof value;
    console.log(`  - ${field}: ${type} (${Array.isArray(value) ? `array[${value.length}]` : value})`);
  });
}

// Function to analyze categories
function analyzeCategories(data) {
  if (!data || data.length === 0) {
    console.log('❌ No categories data available');
    return;
  }
  
  console.log('\n📊 Categories Analysis:');
  console.log(`Total categories: ${data.length}`);
  
  // Show all categories
  data.forEach((category, index) => {
    console.log(`\n${index + 1}. ${category.name || category.category || 'Unknown'}`);
    if (category.description) {
      console.log(`   Description: ${category.description}`);
    }
    if (category.fields) {
      console.log(`   Fields: ${category.fields.join(', ')}`);
    }
  });
}

// Main function
async function main() {
  try {
    console.log('🧪 Testing CFBD API endpoints for graphics data...');
    console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
    console.log('');
    
    let apiCalls = 0;
    const maxCalls = 15;
    
    // Test 1: Get categories (1 call)
    console.log('1️⃣ Testing /stats/categories...');
    const categories = await fetchCFBDData('/stats/categories');
    apiCalls++;
    if (categories) {
      analyzeCategories(categories);
    }
    
    // Test 2: Get team stats for 2024 (1 call)
    console.log('\n2️⃣ Testing /stats/team/season?year=2024...');
    const teamStats = await fetchCFBDData('/stats/team/season?year=2024');
    apiCalls++;
    if (teamStats) {
      analyzeTeamStats(teamStats);
    }
    
    // Test 3: Get season stats for 2024 (1 call)
    console.log('\n3️⃣ Testing /stats/season?year=2024...');
    const seasonStats = await fetchCFBDData('/stats/season?year=2024');
    apiCalls++;
    if (seasonStats) {
      analyzeSeasonStats(seasonStats);
    }
    
    // Test 4: Get advanced season stats (1 call)
    console.log('\n4️⃣ Testing /stats/season/advanced?year=2024...');
    const advancedStats = await fetchCFBDData('/stats/season/advanced?year=2024');
    apiCalls++;
    if (advancedStats) {
      console.log('\n📊 Advanced Season Stats Analysis:');
      console.log(`Total records: ${advancedStats.length}`);
      
      if (advancedStats.length > 0) {
        const sample = advancedStats[0];
        console.log('\n📋 Sample advanced record:');
        console.log(JSON.stringify(sample, null, 2));
        
        const fields = Object.keys(sample);
        console.log('\n🔍 Available fields:');
        fields.forEach(field => {
          const value = sample[field];
          const type = typeof value;
          console.log(`  - ${field}: ${type} (${Array.isArray(value) ? `array[${value.length}]` : value})`);
        });
      }
    }
    
    // Test 5: Get team records for 2024 (1 call)
    console.log('\n5️⃣ Testing /records?year=2024...');
    const records = await fetchCFBDData('/records?year=2024');
    apiCalls++;
    if (records) {
      console.log('\n📊 Records Analysis:');
      console.log(`Total teams: ${records.length}`);
      
      if (records.length > 0) {
        const sample = records[0];
        console.log('\n📋 Sample record:');
        console.log(JSON.stringify(sample, null, 2));
      }
    }
    
    console.log(`\n✅ API calls used: ${apiCalls}/${maxCalls}`);
    
    // Save sample data for analysis
    const sampleData = {
      categories,
      teamStats: teamStats?.slice(0, 5) || [],
      seasonStats: seasonStats?.slice(0, 5) || [],
      advancedStats: advancedStats?.slice(0, 5) || [],
      records: records?.slice(0, 5) || []
    };
    
    const outputPath = path.join(__dirname, '..', 'data', 'cfbd-sample-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));
    console.log(`\n💾 Sample data saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting CFBD API endpoint testing...');
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

