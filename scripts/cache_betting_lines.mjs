// scripts/cache_betting_lines.mjs
import fs from "node:fs";

const CFBD_API_KEY = "AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN";
const CFBD_BASE = "https://api.collegefootballdata.com";

// Cache file path
const CACHE_FILE = "public/betting_lines_cache.json";

// Load existing cache
function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return {
      lastFetch: null,
      week3: null,
      week2: null,
      week1: null
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
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} games with betting lines for Week ${week}`);
    return data;
  } catch (error) {
    console.error(`Error fetching Week ${week} data:`, error.message);
    return null;
  }
}

// Main function
async function cacheBettingLines() {
  const cache = loadCache();
  const currentYear = 2025;
  const currentWeek = await getCurrentWeek(currentYear);
  
  if (!currentWeek) {
    console.log("No current week found, skipping betting lines cache");
    return null;
  }
  
  console.log(`Checking betting lines cache for Week ${currentWeek}...`);
  
  // Check if we already have data for this week
  const weekKey = `week${currentWeek}`;
  if (cache[weekKey] && cache[weekKey].length > 0) {
    console.log(`Week ${currentWeek} data already cached (${cache[weekKey].length} games)`);
    console.log("Using cached data - no API calls needed");
    return cache[weekKey];
  }
  
  console.log(`Week ${currentWeek} data not found in cache, fetching from API...`);
  
  // Fetch data for current week
  const weekData = await fetchBettingLines(currentYear, currentWeek);
  
  if (weekData && weekData.length > 0) {
    // Update cache
    cache[weekKey] = weekData;
    cache.lastFetch = new Date().toISOString();
    saveCache(cache);
    
    console.log(`Cached ${weekData.length} games for Week ${currentWeek}`);
    return weekData;
  } else {
    console.log(`No data found for Week ${currentWeek}`);
    return null;
  }
}

async function getCurrentWeek(season) {
  try {
    console.log(`Finding most recent week with betting data for season ${season}...`);
    
    // Get all available weeks from calendar
    const response = await fetch(`${CFBD_BASE}/calendar?year=${season}`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    console.log(`Calendar response status: ${response.status}`);
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
            console.log(`Using week ${week} for betting lines cache (most recent with data)`);
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

// Run the caching function
cacheBettingLines().then(data => {
  if (data) {
    console.log("✅ Betting lines cache updated successfully");
  } else {
    console.log("❌ Failed to cache betting lines data");
  }
});
