// ESPN Leaders Scraper - Extract team stats from ESPN stats page

const ESPN_URL = 'https://www.espn.com/college-football/stats/_/view/team/season/2024';

console.log('🏈 ESPN College Football Leaders Scraper');

async function scrapeESPNLeaders() {
  try {
    console.log('\n📡 Fetching ESPN stats page...');
    
    const response = await fetch(ESPN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`✅ Success: ${html.length} characters received`);
    
    // Extract stats from different tables
    const stats = {
      totalYards: extractTableStats(html, 'Total Yards'),
      passingYards: extractTableStats(html, 'Passing'),
      rushingYards: extractTableStats(html, 'Rushing'),
      pointsAllowed: extractTableStats(html, 'Points Allowed'),
      sacks: extractTableStats(html, 'Sacks')
    };
    
    console.log('\n📊 Extracted Stats Summary:');
    Object.entries(stats).forEach(([statType, data]) => {
      console.log(`${statType}: ${data.length} teams`);
    });
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

function extractTableStats(html, tableTitle) {
  const stats = [];
  
  // Find the table with the specific title
  const tableRegex = new RegExp(`<th[^>]*>${tableTitle}</th>.*?<table[^>]*>(.*?)</table>`, 'gis');
  const tableMatch = html.match(tableRegex);
  
  if (!tableMatch) {
    console.log(`❌ Table "${tableTitle}" not found`);
    return stats;
  }
  
  const tableHTML = tableMatch[1];
  console.log(`✅ Found table: ${tableTitle}`);
  
  // Extract rows with team data
  const rowRegex = /<tr[^>]*data-idx="(\d+)"[^>]*>(.*?)<\/tr>/gis;
  const rows = tableHTML.match(rowRegex) || [];
  
  rows.forEach(row => {
    // Extract team name from first cell
    const teamNameMatch = row.match(/<td[^>]*>.*?<a[^>]*href="[^"]*team[^"]*"[^>]*>(.*?)<\/a>.*?<\/td>/i);
    if (!teamNameMatch) return;
    
    const teamName = teamNameMatch[1].trim();
    
    // Extract stat values from remaining cells
    const cellRegex = /<td[^>]*>(.*?)<\/td>/gi;
    const cells = row.match(cellRegex) || [];
    
    if (cells.length >= 3) {
      // Skip first cell (team name), get stat values
      const statValues = cells.slice(1).map(cell => {
        const value = cell.replace(/<[^>]*>/g, '').trim();
        return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
      });
      
      if (statValues.length > 0) {
        stats.push({
          team: teamName,
          value: statValues[0], // First stat value (usually per game)
          total: statValues[1] || statValues[0] // Total or same as per game
        });
      }
    }
  });
  
  return stats;
}

// Create leaderboard data for graphics
function createLeaderboardData(stats, statType, title, isDefensive = false) {
  // Sort by value (ascending for defensive stats, descending for offensive)
  const sorted = stats.sort((a, b) => isDefensive ? a.value - b.value : b.value - a.value);
  
  return {
    title: title,
    subtitle: 'VIA ESPN',
    showRecords: true,
    type: statType,
    teams: sorted.slice(0, 5).map((team, index) => ({
      rank: index + 1,
      name: team.team,
      record: '0-0', // ESPN doesn't show records on stats page
      conference: 'Unknown',
      value: `${team.value.toFixed(1)} ${isDefensive ? 'PPG' : 'YPG'}`
    }))
  };
}

// Test the scraper
async function main() {
  const stats = await scrapeESPNLeaders();
  
  if (stats) {
    console.log('\n🎉 Scraping completed successfully!');
    
    // Show sample data
    Object.entries(stats).forEach(([statType, data]) => {
      console.log(`\n${statType.toUpperCase()}:`);
      data.slice(0, 3).forEach(team => {
        console.log(`  ${team.team}: ${team.value}`);
      });
    });
    
    // Save data
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const outputPath = path.join(__dirname, '..', 'data', 'espn-leaders.json');
    fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
    console.log(`\n💾 Data saved to: ${outputPath}`);
  }
}

main();

