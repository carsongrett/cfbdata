// Debug ESPN HTML structure

const ESPN_URL = 'https://www.espn.com/college-football/stats/_/view/team/season/2024';

async function debugESPN() {
  try {
    console.log('🔍 Debugging ESPN HTML structure...');
    
    const response = await fetch(ESPN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = await response.text();
    
    // Look for specific patterns that might contain team data
    const patterns = [
      /<tr[^>]*>.*?<td[^>]*>.*?<a[^>]*href="[^"]*team[^"]*"[^>]*>(.*?)<\/a>.*?<\/td>.*?<\/tr>/gi,
      /<tr[^>]*>.*?<td[^>]*>.*?<span[^>]*>(.*?)<\/span>.*?<\/td>.*?<\/tr>/gi,
      /"teamName":\s*"(.*?)"/gi,
      /"name":\s*"(.*?)"/gi
    ];
    
    patterns.forEach((pattern, index) => {
      const matches = html.match(pattern);
      if (matches) {
        console.log(`\n✅ Pattern ${index + 1} found ${matches.length} matches:`);
        matches.slice(0, 5).forEach((match, i) => {
          console.log(`  ${i + 1}. ${match.substring(0, 100)}...`);
        });
      } else {
        console.log(`\n❌ Pattern ${index + 1}: No matches`);
      }
    });
    
    // Look for JSON data
    const jsonPatterns = [
      /window\.__INITIAL_STATE__\s*=\s*({.*?});/gi,
      /window\.__APOLLO_STATE__\s*=\s*({.*?});/gi,
      /"stats":\s*\[(.*?)\]/gi
    ];
    
    console.log('\n🔍 Looking for JSON data...');
    jsonPatterns.forEach((pattern, index) => {
      const matches = html.match(pattern);
      if (matches) {
        console.log(`✅ JSON Pattern ${index + 1} found: ${matches.length} matches`);
        if (matches[0].length < 1000) {
          console.log(`   Sample: ${matches[0].substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ JSON Pattern ${index + 1}: No matches`);
      }
    });
    
    // Save a sample of the HTML for manual inspection
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const samplePath = path.join(__dirname, '..', 'data', 'espn-html-sample.html');
    fs.writeFileSync(samplePath, html.substring(0, 50000)); // First 50k chars
    console.log(`\n💾 HTML sample saved to: ${samplePath}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugESPN();

