// scripts/generate_polls_only.mjs
import fs from "node:fs";
import { getCurrentWeek } from "./week-utils.mjs";

// --- CONFIG ---
const CFBD_API_KEY = process.env.CFBD_API_KEY;
const CFBD_BASE = "https://api.collegefootballdata.com";

// --- LOAD PREVIOUSLY POSTED ---
const nowIso = new Date().toISOString();
const posted = readJson("posted_ids.json", { ids: [] });

// --- LOAD POLL CACHE ---
const pollCache = readJson("public/poll_cache.json", {
  lastFetch: null,
  lastWeek: null,
  lastSeason: null,
  apPolls: {}, // Store AP polls by week: { "1": [...], "2": [...], "3": [...] }
  coachesPolls: {}, // Store Coaches polls by week: { "1": [...], "2": [...], "3": [...] }
  spRatings: {} // Store SP+ ratings by week: { "1": [...], "2": [...], "3": [...] }
});

// --- PROCESS POLLS ---
console.log("Processing polls sequentially to avoid API rate limits...");
const apPollPosts = await processAPPoll();
console.log(`AP Poll posts generated: ${apPollPosts.length}`);

// Small delay to avoid rate limits
await new Promise(resolve => setTimeout(resolve, 1000));

const coachesPollPosts = await processCoachesPoll();
console.log(`Coaches Poll posts generated: ${coachesPollPosts.length}`);

// Small delay to avoid rate limits
await new Promise(resolve => setTimeout(resolve, 1000));

const spRatingsPosts = await processSPRatings();
console.log(`SP+ Ratings posts generated: ${spRatingsPosts.length}`);

// --- BUILD POSTS ARRAY ---
const drafts = [...apPollPosts, ...coachesPollPosts, ...spRatingsPosts];

// --- WRITE OUTPUT ---
// Read existing queue to preserve other posts
const existingQueue = readJson("public/cfb_queue.json", { posts: [] });
const existingPosts = existingQueue.posts || [];

// For polls, we want to replace old week polls with new week polls
// Filter out old poll posts and add new ones
const nonPollPosts = existingPosts.filter(post => 
  !post.kind.includes('poll') && 
  !post.kind.includes('top10') && 
  !post.kind.includes('movers')
);

const allPosts = [...nonPollPosts, ...drafts];

writeJson("public/cfb_queue.json", { generatedAt: nowIso, posts: allPosts });
writeJson("posted_ids.json", { ids: [...posted.ids, ...drafts.map(d => d.id)] });

// --- POLL PROCESSING FUNCTIONS ---
async function processAPPoll() {
  try {
    // Get current season and week
    const currentSeason = new Date().getFullYear(); // 2025
    const currentWeek = await getCurrentWeek(currentSeason);
    
    if (!currentWeek) {
      console.log("No current week found, skipping AP poll");
      return [];
    }
    
    console.log(`Using Week ${currentWeek} for polls (API-based - most recent with data)`);

    // Always fetch fresh data instead of using cache
    console.log(`Fetching fresh AP poll data for Week ${currentWeek}`);

    // Fetch current AP poll
    const currentPoll = await fetchAPPoll(currentSeason, currentWeek);
    if (!currentPoll || !currentPoll.length) {
      console.log("No AP poll data found for current week");
      return [];
    }

    // Fetch previous week's poll for comparison
    const previousWeek = currentWeek > 1 ? currentWeek - 1 : null;
    let previousPoll = null;
    if (previousWeek) {
      // Add delay before previous week call
      await new Promise(resolve => setTimeout(resolve, 1000));
      previousPoll = await fetchAPPoll(currentSeason, previousWeek);
    }

    // Generate posts
    const posts = [];
    
    // Top 10 post
    const top10Post = formatTop10Post(currentPoll, currentWeek);
    if (top10Post) {
      posts.push(top10Post);
    }

    // Movers post (only if we have previous data)
    if (previousPoll) {
      const moversPost = formatMoversPost(currentPoll, previousPoll, currentWeek);
      if (moversPost) {
        posts.push(moversPost);
      }
    }

    // Update cache with current week's poll
    pollCache.lastFetch = new Date().toISOString();
    pollCache.lastWeek = currentWeek;
    pollCache.lastSeason = currentSeason;
    const weekKey = currentWeek.toString();
    pollCache.apPolls[weekKey] = currentPoll;
    
    // Also fetch and cache previous week if we don't have it
    const previousWeekKey = (currentWeek - 1).toString();
    if (!pollCache.apPolls[previousWeekKey] && currentWeek > 1) {
      console.log(`Fetching previous week ${currentWeek - 1} for movers comparison...`);
      // Add delay before previous week call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const previousPoll = await fetchAPPoll(currentSeason, currentWeek - 1);
      if (previousPoll && previousPoll.length) {
        pollCache.apPolls[previousWeekKey] = previousPoll;
        console.log(`Cached Week ${currentWeek - 1} AP poll data`);
      }
    }
    
    writeJson("public/poll_cache.json", pollCache);

    return posts;
  } catch (error) {
    console.error("Error processing AP poll:", error);
    return [];
  }
}

async function processCoachesPoll() {
  try {
    // Get current season and week
    const currentSeason = new Date().getFullYear(); // 2025
    const currentWeek = await getCurrentWeek(currentSeason);
    
    if (!currentWeek) {
      console.log("No current week found, skipping Coaches poll");
      return [];
    }
    
    console.log(`Using Week ${currentWeek} for polls (API-based - most recent with data)`);

    // Always fetch fresh data instead of using cache
    console.log(`Fetching fresh Coaches poll data for Week ${currentWeek}`);

    // Fetch current Coaches poll
    const currentPoll = await fetchCoachesPoll(currentSeason, currentWeek);
    if (!currentPoll || !currentPoll.length) {
      console.log("No Coaches poll data found for current week");
      return [];
    }

    // Fetch previous week's poll for comparison
    const previousWeek = currentWeek > 1 ? currentWeek - 1 : null;
    let previousPoll = null;
    if (previousWeek) {
      // Add delay before previous week call
      await new Promise(resolve => setTimeout(resolve, 1000));
      previousPoll = await fetchCoachesPoll(currentSeason, previousWeek);
    }

    // Generate posts
    const posts = [];
    
    // Top 10 post
    const top10Post = formatCoachesTop10Post(currentPoll, currentWeek);
    if (top10Post) {
      posts.push(top10Post);
    }

    // Movers post (only if we have previous data)
    if (previousPoll) {
      const moversPost = formatCoachesMoversPost(currentPoll, previousPoll, currentWeek);
      if (moversPost) {
        posts.push(moversPost);
      }
    }

    // Update cache with current week's poll
    pollCache.lastFetch = new Date().toISOString();
    pollCache.lastWeek = currentWeek;
    pollCache.lastSeason = currentSeason;
    const weekKey = currentWeek.toString();
    pollCache.coachesPolls[weekKey] = currentPoll;
    
    // Also fetch and cache previous week if we don't have it
    const previousWeekKey = (currentWeek - 1).toString();
    if (!pollCache.coachesPolls[previousWeekKey] && currentWeek > 1) {
      console.log(`Fetching previous week ${currentWeek - 1} for movers comparison...`);
      // Add delay before previous week call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const previousPoll = await fetchCoachesPoll(currentSeason, currentWeek - 1);
      if (previousPoll && previousPoll.length) {
        pollCache.coachesPolls[previousWeekKey] = previousPoll;
        console.log(`Cached Week ${currentWeek - 1} Coaches poll data`);
      }
    }
    
    writeJson("public/poll_cache.json", pollCache);

    return posts;
  } catch (error) {
    console.error("Error processing Coaches poll:", error);
    return [];
  }
}

async function processSPRatings() {
  try {
    // Get current season and week
    const currentSeason = new Date().getFullYear(); // 2025
    const currentWeek = await getCurrentWeek(currentSeason);
    
    if (!currentWeek) {
      console.log("No current week found, skipping SP+ ratings");
      return [];
    }
    
    console.log(`Using Week ${currentWeek} for polls (API-based - most recent with data)`);

    // Always fetch fresh data instead of using cache
    console.log(`Fetching fresh SP+ ratings data for Week ${currentWeek}`);

    // Fetch current SP+ ratings
    const currentRatings = await fetchSPRatings(currentSeason, currentWeek);
    if (!currentRatings || !currentRatings.length) {
      console.log("No SP+ ratings data found for current week");
      return [];
    }

    // Fetch previous week's ratings for comparison
    const previousWeek = currentWeek > 1 ? currentWeek - 1 : null;
    let previousRatings = null;
    if (previousWeek) {
      // Add delay before previous week call
      await new Promise(resolve => setTimeout(resolve, 1000));
      previousRatings = await fetchSPRatings(currentSeason, previousWeek);
    }

    // Generate posts
    const posts = [];
    
    // Top 10 post
    const top10Post = formatSPTop10Post(currentRatings, currentWeek);
    if (top10Post) {
      posts.push(top10Post);
    }

    // Movers post (only if we have previous data)
    if (previousRatings) {
      const moversPost = formatSPMoversPost(currentRatings, previousRatings, currentWeek);
      if (moversPost) {
        posts.push(moversPost);
      }
    }

    // Update cache with current week's ratings
    pollCache.lastFetch = new Date().toISOString();
    pollCache.lastWeek = currentWeek;
    pollCache.lastSeason = currentSeason;
    if (!pollCache.spRatings) pollCache.spRatings = {};
    const weekKey = currentWeek.toString();
    pollCache.spRatings[weekKey] = currentRatings;
    
    // Also fetch and cache previous week if we don't have it
    const previousWeekKey = (currentWeek - 1).toString();
    if (!pollCache.spRatings[previousWeekKey] && currentWeek > 1) {
      console.log(`Fetching previous week ${currentWeek - 1} for movers comparison...`);
      // Add delay before previous week call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const previousRatings = await fetchSPRatings(currentSeason, currentWeek - 1);
      if (previousRatings && previousRatings.length) {
        pollCache.spRatings[previousWeekKey] = previousRatings;
        console.log(`Cached Week ${currentWeek - 1} SP+ ratings data`);
      }
    }
    
    writeJson("public/poll_cache.json", pollCache);

    return posts;
  } catch (error) {
    console.error("Error processing SP+ ratings:", error);
    return [];
  }
}


async function fetchAPPoll(season, week) {
  try {
    console.log(`Fetching AP poll for season ${season}, week ${week}...`);
    const response = await fetch(`${CFBD_BASE}/rankings?year=${season}&week=${week}&seasonType=regular`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    console.log(`Rankings response status: ${response.status}`);
    if (!response.ok) {
      console.error(`Rankings API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const rankings = await response.json();
    console.log(`Rankings data:`, JSON.stringify(rankings, null, 2));
    
    // Find AP poll in the polls array
    const polls = rankings[0]?.polls || [];
    console.log(`Available polls:`, polls.map(p => p.poll));
    const apPoll = polls.find(poll => poll.poll === "AP Top 25");
    console.log(`AP Poll found:`, apPoll);
    return apPoll ? apPoll.ranks : null;
  } catch (error) {
    console.error("Error fetching AP poll:", error);
    return null;
  }
}

async function fetchCoachesPoll(season, week) {
  try {
    console.log(`Fetching Coaches poll for season ${season}, week ${week}...`);
    const response = await fetch(`${CFBD_BASE}/rankings?year=${season}&week=${week}&seasonType=regular`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    console.log(`Rankings response status: ${response.status}`);
    if (!response.ok) {
      console.error(`Rankings API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const rankings = await response.json();
    console.log(`Rankings data:`, JSON.stringify(rankings, null, 2));
    
    // Find Coaches poll in the polls array
    const polls = rankings[0]?.polls || [];
    console.log(`Available polls:`, polls.map(p => p.poll));
    const coachesPoll = polls.find(poll => poll.poll === "Coaches Poll");
    console.log(`Coaches Poll found:`, coachesPoll);
    return coachesPoll ? coachesPoll.ranks : null;
  } catch (error) {
    console.error("Error fetching Coaches poll:", error);
    return null;
  }
}

async function fetchSPRatings(season, week) {
  try {
    console.log(`Fetching SP+ ratings for season ${season}, week ${week}...`);
    const response = await fetch(`${CFBD_BASE}/ratings/sp?year=${season}&week=${week}`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    console.log(`SP+ response status: ${response.status}`);
    if (!response.ok) {
      console.error(`SP+ API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const ratings = await response.json();
    console.log(`SP+ data length: ${ratings.length}`);
    
    // Filter out entries with null rankings (like nationalAverages)
    const validRatings = ratings.filter(team => team.ranking !== null && team.ranking !== undefined);
    
    // Sort by ranking to ensure proper order
    const sortedRatings = validRatings.sort((a, b) => a.ranking - b.ranking);
    console.log(`SP+ top 5:`, sortedRatings.slice(0, 5).map(t => `${t.ranking}. ${t.team} (${t.rating})`));
    
    return sortedRatings;
  } catch (error) {
    console.error("Error fetching SP+ ratings:", error);
    return null;
  }
}

function formatTop10Post(rankings, week) {
  if (!rankings || rankings.length < 10) return null;

  const top10 = rankings.slice(0, 10);
  let text = `AP Top 10 - Week ${week}\n`;
  
  top10.forEach((team, index) => {
    text += `${index + 1}. ${team.school}\n`;
  });
  
  text += `\n#APTop25 #CFB`;

  return {
    id: `ap_top10_week${week}`,
    kind: "poll_top10",
    text: text.slice(0, 240),
    link: "",
    expiresAt: new Date(Date.now() + 7 * 24 * 3600e3).toISOString(), // 7 days
    source: "cfbd",
    generatedAt: new Date().toISOString()
  };
}

function formatCoachesTop10Post(rankings, week) {
  if (!rankings || rankings.length < 10) return null;

  const top10 = rankings.slice(0, 10);
  let text = `Coaches Poll Top 10 - Week ${week}\n`;
  
  top10.forEach((team, index) => {
    text += `${index + 1}. ${team.school}\n`;
  });
  
  text += `\n#CoachesPoll #CFB`;

  return {
    id: `coaches_top10_week${week}`,
    kind: "poll_top10",
    text: text.slice(0, 240),
    link: "",
    expiresAt: new Date(Date.now() + 7 * 24 * 3600e3).toISOString(), // 7 days
    source: "cfbd",
    generatedAt: new Date().toISOString()
  };
}

function formatMoversPost(currentRankings, previousRankings, week) {
  if (!currentRankings || !previousRankings) return null;

  // Create lookup for previous rankings
  const previousLookup = {};
  previousRankings.forEach(team => {
    previousLookup[team.school] = team.rank;
  });

  const movers = [];
  const newEntries = [];

  // Find movers and new entries
  currentRankings.forEach(team => {
    const previousRank = previousLookup[team.school];
    const currentRank = team.rank;
    
    if (previousRank === undefined) {
      // New entry
      newEntries.push({ team: team.school, rank: currentRank });
    } else {
      const change = previousRank - currentRank; // Positive = moved up
      if (Math.abs(change) >= 3) {
        movers.push({
          team: team.school,
          currentRank,
          previousRank,
          change
        });
      }
    }
  });

  // Sort movers by biggest change first
  movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  // Combine movers and new entries, cap at 9
  const allChanges = [
    ...movers.slice(0, 9 - newEntries.length),
    ...newEntries.map(entry => ({ ...entry, change: 'NEW' }))
  ];

  if (allChanges.length === 0) return null;

  let text = `AP Poll Movers - Week ${week}\n`;
  
  allChanges.forEach(change => {
    if (change.change === 'NEW') {
      text += `NEW: #${change.rank} ${change.team}\n`;
    } else {
      const arrow = change.change > 0 ? '⬆️' : '⬇️';
      const moveText = change.change > 0 ? `+${change.change}` : `${change.change}`;
      text += `${arrow}${moveText} ${change.team} (${change.previousRank}→${change.currentRank})\n`;
    }
  });
  
  text += `\n#APTop25 #CFB`;

  return {
    id: `ap_movers_week${week}`,
    kind: "poll_movers", 
    text: text.slice(0, 240),
    link: "",
    expiresAt: new Date(Date.now() + 7 * 24 * 3600e3).toISOString(), // 7 days
    source: "cfbd",
    generatedAt: new Date().toISOString()
  };
}

function formatCoachesMoversPost(currentRankings, previousRankings, week) {
  if (!currentRankings || !previousRankings) return null;

  // Create lookup for previous rankings
  const previousLookup = {};
  previousRankings.forEach(team => {
    previousLookup[team.school] = team.rank;
  });

  const movers = [];
  const newEntries = [];

  // Find movers and new entries
  currentRankings.forEach(team => {
    const previousRank = previousLookup[team.school];
    const currentRank = team.rank;
    
    if (previousRank === undefined) {
      // New entry
      newEntries.push({ team: team.school, rank: currentRank });
    } else {
      const change = previousRank - currentRank; // Positive = moved up
      if (Math.abs(change) >= 3) {
        movers.push({
          team: team.school,
          currentRank,
          previousRank,
          change
        });
      }
    }
  });

  // Sort movers by biggest change first
  movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  // Combine movers and new entries, cap at 9
  const allChanges = [
    ...movers.slice(0, 9 - newEntries.length),
    ...newEntries.map(entry => ({ ...entry, change: 'NEW' }))
  ];

  if (allChanges.length === 0) return null;

  let text = `Coaches Poll Movers - Week ${week}\n`;
  
  allChanges.forEach(change => {
    if (change.change === 'NEW') {
      text += `NEW: #${change.rank} ${change.team}\n`;
    } else {
      const arrow = change.change > 0 ? '⬆️' : '⬇️';
      const moveText = change.change > 0 ? `+${change.change}` : `${change.change}`;
      text += `${arrow}${moveText} ${change.team} (${change.previousRank}→${change.currentRank})\n`;
    }
  });
  
  text += `\n#CoachesPoll #CFB`;

  return {
    id: `coaches_movers_week${week}`,
    kind: "poll_movers", 
    text: text.slice(0, 240),
    link: "",
    expiresAt: new Date(Date.now() + 7 * 24 * 3600e3).toISOString(), // 7 days
    source: "cfbd",
    generatedAt: new Date().toISOString()
  };
}

function formatSPTop10Post(ratings, week) {
  if (!ratings || ratings.length < 10) return null;

  const top10 = ratings.slice(0, 10);
  let text = `SP+ Power Rankings - Week ${week}\n`;
  
  top10.forEach((team, index) => {
    text += `${index + 1}. ${team.team} (${team.rating})\n`;
  });
  
  text += `\n#SPPlus #CFB`;

  return {
    id: `sp_top10_week${week}`,
    kind: "poll_top10",
    text: text.slice(0, 240),
    link: "",
    expiresAt: new Date(Date.now() + 7 * 24 * 3600e3).toISOString(), // 7 days
    source: "cfbd",
    generatedAt: new Date().toISOString()
  };
}

function formatSPMoversPost(currentRatings, previousRatings, week) {
  if (!currentRatings || !previousRatings) return null;

  // Create lookup for previous rankings
  const previousLookup = {};
  previousRatings.forEach(team => {
    previousLookup[team.team] = team.ranking;
  });

  const movers = [];
  const newEntries = [];

  // Find movers and new entries
  currentRatings.forEach(team => {
    const previousRank = previousLookup[team.team];
    const currentRank = team.ranking;
    
    if (previousRank === undefined) {
      // New entry (top 25)
      if (currentRank <= 25) {
        newEntries.push({ team: team.team, rank: currentRank });
      }
    } else {
      const change = previousRank - currentRank; // Positive = moved up
      if (Math.abs(change) >= 3) {
        movers.push({
          team: team.team,
          currentRank,
          previousRank,
          change
        });
      }
    }
  });

  // Sort movers by biggest change first
  movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  // Combine movers and new entries, cap at 9
  const allChanges = [
    ...movers.slice(0, 9 - newEntries.length),
    ...newEntries.map(entry => ({ ...entry, change: 'NEW' }))
  ];

  if (allChanges.length === 0) return null;

  let text = `SP+ Power Rankings Movers - Week ${week}\n`;
  
  allChanges.forEach(change => {
    if (change.change === 'NEW') {
      text += `NEW: #${change.rank} ${change.team}\n`;
    } else {
      const arrow = change.change > 0 ? '⬆️' : '⬇️';
      const moveText = change.change > 0 ? `+${change.change}` : `${change.change}`;
      text += `${arrow}${moveText} ${change.team} (${change.previousRank}→${change.currentRank})\n`;
    }
  });
  
  text += `\n#SPPlus #CFB`;

  return {
    id: `sp_movers_week${week}`,
    kind: "poll_movers", 
    text: text.slice(0, 240),
    link: "",
    expiresAt: new Date(Date.now() + 7 * 24 * 3600e3).toISOString(), // 7 days
    source: "cfbd",
    generatedAt: new Date().toISOString()
  };
}

// --- HELPERS ---
function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { return fallback; }
}
function writeJson(p, obj) {
  fs.mkdirSync(p.split("/").slice(0, -1).join("/") || ".", { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}
