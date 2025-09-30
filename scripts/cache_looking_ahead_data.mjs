// scripts/cache_looking_ahead_data.mjs
import fs from "node:fs";

const CFBD_API_KEY = "AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN";
const CFBD_BASE = "https://api.collegefootballdata.com";

// Cache file path
const CACHE_FILE = "public/looking_ahead_cache.json";

// Load existing cache
function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return {
      lastFetch: null,
      currentWeek: null,
      bettingLines: null,
      rankings: null,
      records: null
    };
  }
}

// Save cache
function saveCache(cache) {
  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// Fetch betting lines for a specific week
async function fetchBettingLines(year, week) {
  try {
    console.log(`Fetching betting lines for ${year} Week ${week}...`);
    const response = await fetch(`${CFBD_BASE}/lines?year=${year}&week=${week}`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    if (!response.ok) {
      console.error(`Betting lines API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} games with betting lines for Week ${week}`);
    return data;
  } catch (error) {
    console.error(`Error fetching betting lines for Week ${week}:`, error.message);
    return null;
  }
}

// Fetch rankings for a specific week
async function fetchRankings(year, week) {
  try {
    console.log(`Fetching rankings for ${year} Week ${week}...`);
    const response = await fetch(`${CFBD_BASE}/rankings?year=${year}&week=${week}`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    if (!response.ok) {
      console.error(`Rankings API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} ranking polls for Week ${week}`);
    return data;
  } catch (error) {
    console.error(`Error fetching rankings for Week ${week}:`, error.message);
    return null;
  }
}

// Fetch team records for a specific year
async function fetchTeamRecords(year) {
  try {
    console.log(`Fetching team records for ${year}...`);
    const response = await fetch(`${CFBD_BASE}/records?year=${year}`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    if (!response.ok) {
      console.error(`Records API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} team records for ${year}`);
    return data;
  } catch (error) {
    console.error(`Error fetching team records for ${year}:`, error.message);
    return null;
  }
}

// Get current week with betting data
async function getCurrentWeek(season) {
  try {
    console.log(`Finding most recent week with betting data for season ${season}...`);
    
    // Get all available weeks from calendar
    const response = await fetch(`${CFBD_BASE}/calendar?year=${season}`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    if (!response.ok) {
      console.error(`Calendar API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const calendar = await response.json();
    
    // Get all available week numbers and sort them in descending order
    const availableWeeks = calendar
      .filter(week => week.week && typeof week.week === 'number')
      .map(week => week.week)
      .sort((a, b) => b - a); // Sort descending (highest first)
    
    console.log(`Available weeks: ${availableWeeks.join(', ')}`);
    
    // Try each week in descending order until we find one with betting data
    for (const week of availableWeeks) {
      console.log(`Testing week ${week} for betting data...`);
      
      try {
        const bettingResponse = await fetch(`${CFBD_BASE}/lines?year=${season}&week=${week}`, {
          headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
        });
        
        if (bettingResponse.ok) {
          const bettingData = await bettingResponse.json();
          if (bettingData && bettingData.length > 0) {
            console.log(`Found betting data for week ${week}: ${bettingData.length} games`);
            console.log(`Using week ${week} for looking ahead data (most recent with data)`);
            return week;
          }
        }
        console.log(`Week ${week} has no betting data`);
      } catch (error) {
        console.log(`Error testing week ${week}:`, error.message);
      }
    }
    
    console.log("No weeks found with betting data");
    return null;
  } catch (error) {
    console.error("Error finding current week:", error);
    return null;
  }
}

// Main function
async function cacheLookingAheadData() {
  const cache = loadCache();
  const currentYear = 2025;
  const currentWeek = await getCurrentWeek(currentYear);
  
  if (!currentWeek) {
    console.log("No current week found, skipping looking ahead data cache");
    return null;
  }
  
  console.log(`Caching looking ahead data for Week ${currentWeek}...`);
  
  // Check if we already have fresh data for this week
  if (cache.currentWeek === currentWeek && 
      cache.bettingLines && 
      cache.rankings && 
      cache.records) {
    console.log(`Week ${currentWeek} data already cached and fresh`);
    console.log("Using cached data - no API calls needed");
    return {
      week: currentWeek,
      bettingLines: cache.bettingLines,
      rankings: cache.rankings,
      records: cache.records
    };
  }
  
  console.log(`Week ${currentWeek} data not found in cache or outdated, fetching from API...`);
  
  // Fetch all data in parallel
  const [bettingLines, rankings, records] = await Promise.all([
    fetchBettingLines(currentYear, currentWeek),
    fetchRankings(currentYear, currentWeek),
    fetchTeamRecords(currentYear)
  ]);
  
  if (bettingLines && rankings && records) {
    // Update cache
    cache.currentWeek = currentWeek;
    cache.bettingLines = bettingLines;
    cache.rankings = rankings;
    cache.records = records;
    cache.lastFetch = new Date().toISOString();
    saveCache(cache);
    
    console.log(`✅ Cached looking ahead data for Week ${currentWeek}:`);
    console.log(`   - ${bettingLines.length} games with betting lines`);
    console.log(`   - ${rankings.length} ranking polls`);
    console.log(`   - ${records.length} team records`);
    
    return {
      week: currentWeek,
      bettingLines,
      rankings,
      records
    };
  } else {
    console.log(`❌ Failed to fetch complete data for Week ${currentWeek}`);
    return null;
  }
}

// Run the caching function
cacheLookingAheadData().then(data => {
  if (data) {
    console.log("✅ Looking ahead data cache updated successfully");
  } else {
    console.log("❌ Failed to cache looking ahead data");
  }
});

