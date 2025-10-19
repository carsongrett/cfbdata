// ESPN Stats Scraper for College Football Leaderboards

const ESPN_URL = 'https://www.espn.com/college-football/stats/_/view/team/season/2024';

console.log('🏈 ESPN College Football Stats Scraper');
console.log(`URL: ${ESPN_URL}`);

async function scrapeESPNStats() {
  try {
    console.log('\n📡 Fetching ESPN stats page...');
    
    const response = await fetch(ESPN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`✅ Success: ${html.length} characters received`);
    
    // Extract data from HTML tables
    const stats = extractStatsFromHTML(html);
    
    console.log('\n📊 Extracted Stats:');
    console.log(`Total teams found: ${Object.keys(stats).length}`);
    
    // Show sample data
    const sampleTeams = Object.keys(stats).slice(0, 5);
    sampleTeams.forEach(team => {
      console.log(`\n${team}:`);
      Object.entries(stats[team]).forEach(([stat, value]) => {
        console.log(`  ${stat}: ${value}`);
      });
    });
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

function extractStatsFromHTML(html) {
  const stats = {};
  
  // Look for table data patterns
  const tableRegex = /<table[^>]*class="[^"]*Table[^"]*"[^>]*>.*?<\/table>/gis;
  const tables = html.match(tableRegex) || [];
  
  console.log(`\n🔍 Found ${tables.length} tables`);
  
  tables.forEach((table, index) => {
    console.log(`\n📋 Processing table ${index + 1}...`);
    
    // Extract rows
    const rowRegex = /<tr[^>]*>.*?<\/tr>/gis;
    const rows = table.match(rowRegex) || [];
    
    console.log(`  Rows: ${rows.length}`);
    
    // Look for header row to identify stat types
    const headerRow = rows.find(row => 
      row.includes('Points') || 
      row.includes('Rushing') || 
      row.includes('Passing') ||
      row.includes('Total') ||
      row.includes('Sacks') ||
      row.includes('Defense')
    );
    
    if (headerRow) {
      console.log(`  ✅ Found relevant table with headers`);
      
      // Extract stat names from header
      const headerCells = headerRow.match(/<th[^>]*>(.*?)<\/th>/gi) || [];
      const statNames = headerCells.map(cell => {
        const text = cell.replace(/<[^>]*>/g, '').trim();
        return text;
      });
      
      console.log(`  Stat names: ${statNames.join(', ')}`);
      
      // Process data rows
      rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header
        
        const cells = row.match(/<td[^>]*>(.*?)<\/td>/gi) || [];
        if (cells.length >= 2) {
          // Extract team name (usually first cell)
          const teamName = cells[0].replace(/<[^>]*>/g, '').trim();
          
          if (teamName && teamName.length > 0 && !teamName.match(/^\d+$/)) {
            if (!stats[teamName]) {
              stats[teamName] = {};
            }
            
            // Extract stat values
            cells.forEach((cell, cellIndex) => {
              if (cellIndex > 0 && statNames[cellIndex]) {
                const value = cell.replace(/<[^>]*>/g, '').trim();
                const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
                
                if (!isNaN(numericValue)) {
                  stats[teamName][statNames[cellIndex]] = numericValue;
                }
              }
            });
          }
        }
      });
    }
  });
  
  return stats;
}

// Test the scraper
async function main() {
  const stats = await scrapeESPNStats();
  
  if (stats) {
    console.log('\n🎉 Scraping completed successfully!');
    console.log(`Found data for ${Object.keys(stats).length} teams`);
    
    // Save sample data
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const outputPath = path.join(__dirname, '..', 'data', 'espn-stats-sample.json');
    fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
    console.log(`💾 Sample data saved to: ${outputPath}`);
  }
}

main();

