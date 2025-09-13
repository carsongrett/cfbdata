// Test ESPN stats page scraping

const ESPN_URL = 'https://www.espn.com/college-football/stats/_/view/team/season/2024';

console.log('🧪 Testing ESPN Stats Page Scraping');
console.log(`URL: ${ESPN_URL}`);

async function testESPNScraping() {
  try {
    console.log('\n📡 Fetching ESPN stats page...');
    
    const response = await fetch(ESPN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`✅ Success: ${html.length} characters received`);
      
      // Look for common patterns in ESPN stats pages
      const patterns = [
        /<table[^>]*class="[^"]*Table[^"]*"[^>]*>/gi,
        /<div[^>]*class="[^"]*Table[^"]*"[^>]*>/gi,
        /<script[^>]*>.*?window\.__INITIAL_STATE__.*?<\/script>/gi,
        /<script[^>]*>.*?window\.__APOLLO_STATE__.*?<\/script>/gi,
        /"stats":\s*\[.*?\]/gi,
        /"teams":\s*\[.*?\]/gi
      ];
      
      console.log('\n🔍 Looking for data patterns...');
      patterns.forEach((pattern, index) => {
        const matches = html.match(pattern);
        if (matches) {
          console.log(`✅ Pattern ${index + 1} found: ${matches.length} matches`);
          if (matches[0].length < 500) {
            console.log(`   Sample: ${matches[0].substring(0, 200)}...`);
          }
        } else {
          console.log(`❌ Pattern ${index + 1}: No matches`);
        }
      });
      
      // Look for specific stat categories
      const statCategories = [
        'Points Per Game',
        'Rushing Yards',
        'Total Offense',
        'Defensive Points',
        'Sacks',
        'Defensive Yards'
      ];
      
      console.log('\n📊 Looking for stat categories...');
      statCategories.forEach(category => {
        const found = html.includes(category);
        console.log(`${found ? '✅' : '❌'} ${category}: ${found ? 'Found' : 'Not found'}`);
      });
      
    } else {
      console.log(`❌ Error: ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testESPNScraping();

