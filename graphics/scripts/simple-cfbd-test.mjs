import fetch from 'node-fetch';

const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = process.env.CFBD_API_KEY;

console.log('🧪 Simple CFBD API Test');
console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'NOT SET'}`);

if (!API_KEY) {
  console.error('❌ CFBD_API_KEY environment variable is required');
  process.exit(1);
}

async function testEndpoint(endpoint) {
  const url = `${CFBD_BASE}${endpoint}`;
  console.log(`\n📡 Testing: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success: ${Array.isArray(data) ? data.length : 'N/A'} records`);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('Sample record keys:', Object.keys(data[0]));
      }
    } else {
      console.log(`❌ Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`❌ Network error:`, error.message);
  }
}

async function main() {
  try {
    // Test categories endpoint
    await testEndpoint('/stats/categories');
    
    // Test team stats endpoint
    await testEndpoint('/stats/team/season?year=2024');
    
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();

