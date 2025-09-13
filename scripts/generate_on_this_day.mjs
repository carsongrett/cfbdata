#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const SEASONS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
const TIMEZONE = 'America/Chicago';

// Get API key from environment
const apiKey = process.env.CFBD_API_KEY;
if (!apiKey) {
  console.error('Error: CFBD_API_KEY environment variable is required');
  process.exit(1);
}

/**
 * Format date as MM-DD
 */
function formatMMDD(date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Get date from command line argument or default to today
 */
function getTargetDate() {
  const args = process.argv.slice(2);
  const dateArg = args.find(arg => arg.startsWith('--date='));
  
  if (dateArg) {
    const dateStr = dateArg.split('=')[1];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error('Error: Invalid date format. Use YYYY-MM-DD');
      process.exit(1);
    }
    return date;
  }
  
  // Default to today in Chicago timezone
  return new Date();
}

/**
 * Fetch games for a specific season and date
 */
async function fetchGamesForDate(season, mmdd) {
  const fullDate = `${season}-${mmdd}`;
  const url = `${CFBD_BASE}/games?date=${fullDate}&division=fbs`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Warning: Failed to fetch games for ${fullDate} (HTTP ${response.status})`);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Warning: Error fetching games for ${fullDate}:`, error.message);
    return [];
  }
}

/**
 * Process games and extract highlights
 */
function processGames(allGames) {
  const validGames = allGames.filter(game => 
    game.homePoints !== null && 
    game.awayPoints !== null && 
    typeof game.homePoints === 'number' && 
    typeof game.awayPoints === 'number'
  );
  
  if (validGames.length === 0) {
    return { closest: null, blowout: null };
  }
  
  // Process each game
  const gameData = validGames.map(game => {
    const homeScore = game.homePoints;
    const awayScore = game.awayPoints;
    const margin = Math.abs(homeScore - awayScore);
    const total = homeScore + awayScore;
    
    const winner = homeScore > awayScore ? game.homeTeam : game.awayTeam;
    const loser = homeScore > awayScore ? game.awayTeam : game.homeTeam;
    const wScore = Math.max(homeScore, awayScore);
    const lScore = Math.min(homeScore, awayScore);
    
    return {
      winner,
      loser,
      wScore,
      lScore,
      margin,
      total,
      startDate: game.startDate,
      year: new Date(game.startDate).getFullYear()
    };
  });
  
  // Find closest finish (smallest margin)
  const closest = gameData
    .filter(game => game.margin > 0) // Exclude ties
    .sort((a, b) => {
      if (a.margin !== b.margin) return a.margin - b.margin; // Smallest margin first
      if (a.startDate !== b.startDate) return b.startDate.localeCompare(a.startDate); // Latest date first
      return b.total - a.total; // Highest total first
    })[0];
  
  // Find biggest blowout (largest margin)
  const blowout = gameData
    .sort((a, b) => {
      if (a.margin !== b.margin) return b.margin - a.margin; // Largest margin first
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate); // Earliest date first
      return b.total - a.total; // Highest total first
    })[0];
  
  return { closest, blowout };
}

/**
 * Format a single highlight
 */
function formatHighlight(game, suffix) {
  return `${game.year}: ${game.winner} ${game.wScore}-${game.lScore} over ${game.loser} — ${suffix}`;
}

/**
 * Generate On This Day content for a single date
 */
async function generateOnThisDay(date) {
  const mmdd = formatMMDD(date);
  
  // Fetch games for all seasons
  const allGames = [];
  for (const season of SEASONS) {
    const games = await fetchGamesForDate(season, mmdd);
    allGames.push(...games);
  }
  
  // Process games to find highlights
  const { closest, blowout } = processGames(allGames);
  
  // Build the post
  const lines = [`On This Day in CFB (${mmdd.replace('-', '/')})`];
  
  if (closest) {
    lines.push(`• ${formatHighlight(closest, '1-score classic')}`);
  }
  
  if (blowout && (!closest || closest !== blowout)) {
    lines.push(`• ${formatHighlight(blowout, 'biggest blowout')}`);
  }
  
  lines.push(''); // Blank line
  lines.push('#OnThisDay #CFBHistory');
  
  return lines.join('\n');
}

/**
 * Generate content for the entire month of September
 */
async function generateSeptemberContent() {
  const content = {};
  
  // Generate for September 12-30
  for (let day = 12; day <= 30; day++) {
    const date = new Date(2024, 8, day); // Month is 0-indexed
    const mmdd = formatMMDD(date);
    
    try {
      const post = await generateOnThisDay(date);
      content[mmdd] = {
        kind: 'on_this_day',
        content: post,
        date: date.toISOString().split('T')[0],
        priority: 75
      };
    } catch (error) {
      console.error(`Error generating content for ${mmdd}:`, error.message);
      // Continue with other dates
    }
  }
  
  return content;
}

/**
 * Save content to cache file and merge into main queue
 */
function saveToCache(content) {
  const cacheFile = 'public/on_this_day_cache.json';
  fs.writeFileSync(cacheFile, JSON.stringify(content, null, 2));
  console.error(`Saved ${Object.keys(content).length} On This Day posts to ${cacheFile}`);
  
  // Also merge into main queue file
  mergeIntoMainQueue(content);
}

/**
 * Merge On This Day content into the main cfb_queue.json
 */
function mergeIntoMainQueue(onThisDayContent) {
  const queueFile = 'public/cfb_queue.json';
  
  // Read existing queue or create new structure
  let queueData;
  if (fs.existsSync(queueFile)) {
    try {
      queueData = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    } catch (error) {
      console.error('Error reading existing queue file:', error.message);
      queueData = { posts: [], generatedAt: new Date().toISOString() };
    }
  } else {
    queueData = { posts: [], generatedAt: new Date().toISOString() };
  }
  
  // Remove any existing on_this_day posts
  queueData.posts = queueData.posts.filter(post => post.kind !== 'on_this_day');
  
  // Add new On This Day posts
  const onThisDayPosts = Object.values(onThisDayContent).map((post, index) => ({
    ...post,
    id: `on_this_day_${index}_${Date.now()}`,
    text: post.content
  }));
  
  queueData.posts.push(...onThisDayPosts);
  
  // Update generated timestamp
  queueData.generatedAt = new Date().toISOString();
  
  // Write back to queue file
  fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));
  console.error(`Merged ${onThisDayPosts.length} On This Day posts into main queue`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Check if we're generating for a single date or the whole month
  if (args.includes('--monthly')) {
    // Generate content for entire September
    const content = await generateSeptemberContent();
    saveToCache(content);
  } else {
    // Generate for single date
    const date = getTargetDate();
    const post = await generateOnThisDay(date);
    console.log(post);
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
