// Using built-in fetch (Node.js 18+)

const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = 'AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN';

console.log('🧪 Testing Team Stats Endpoints');

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
        console.log('Sample record:', JSON.stringify(data[0], null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${response.statusText}`);
      console.log(`Response (first 200 chars): ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.error(`❌ Network error:`, error.message);
  }
}

async function main() {
  try {
    // Test different team stats endpoints
    await testEndpoint('/stats/team/season?year=2024');
    await testEndpoint('/stats/season?year=2024');
    await testEndpoint('/stats/season/advanced?year=2024');
    await testEndpoint('/records?year=2024');
    
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();

