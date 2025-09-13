// Simple ESPN Scraper - Extract team stats

const ESPN_URL = 'https://www.espn.com/college-football/stats/_/view/team/season/2024';

console.log('🏈 Simple ESPN Scraper');

async function scrapeESPN() {
  try {
    console.log('\n📡 Fetching ESPN stats page...');
    
    const response = await fetch(ESPN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = await response.text();
    console.log(`✅ Success: ${html.length} characters received`);
    
    // Look for team names and stats in a simpler way
    const teamStats = extractTeamStats(html);
    
    console.log(`\n📊 Found ${teamStats.length} teams with stats`);
    
    // Show sample
    teamStats.slice(0, 5).forEach(team => {
      console.log(`\n${team.team}:`);
      Object.entries(team.stats).forEach(([stat, value]) => {
        console.log(`  ${stat}: ${value}`);
      });
    });
    
    return teamStats;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

function extractTeamStats(html) {
  const teams = {};
  
  // Look for team names in links
  const teamLinkRegex = /<a[^>]*href="[^"]*team[^"]*"[^>]*>([^<]+)<\/a>/gi;
  const teamMatches = html.match(teamLinkRegex) || [];
  
  console.log(`Found ${teamMatches.length} team links`);
  
  // Look for stat values near team names
  const statValueRegex = /(\d+\.?\d*)/g;
  
  // Find table rows with team data
  const rowRegex = /<tr[^>]*data-idx="\d+"[^>]*>.*?<\/tr>/gi;
  const rows = html.match(rowRegex) || [];
  
  console.log(`Found ${rows.length} data rows`);
  
  rows.forEach((row, index) => {
    // Extract team name
    const teamMatch = row.match(/<a[^>]*href="[^"]*team[^"]*"[^>]*>([^<]+)<\/a>/i);
    if (!teamMatch) return;
    
    const teamName = teamMatch[1].trim();
    
    // Extract all numbers from the row
    const numbers = row.match(statValueRegex) || [];
    const numericValues = numbers.map(n => parseFloat(n)).filter(n => !isNaN(n) && n > 0);
    
    if (numericValues.length > 0) {
      if (!teams[teamName]) {
        teams[teamName] = {
          team: teamName,
          stats: {}
        };
      }
      
      // Store the first few numeric values as potential stats
      numericValues.slice(0, 3).forEach((value, i) => {
        const statName = ['value1', 'value2', 'value3'][i];
        teams[teamName].stats[statName] = value;
      });
    }
  });
  
  return Object.values(teams);
}

async function main() {
  const stats = await scrapeESPN();
  
  if (stats) {
    // Save data
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const outputPath = path.join(__dirname, '..', 'data', 'espn-simple-stats.json');
    fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
    console.log(`\n💾 Data saved to: ${outputPath}`);
  }
}

main();

