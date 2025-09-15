// scripts/generate_betting_previews_only.mjs
import fs from "node:fs";

// --- CONFIG ---
const CFBD_API_KEY = "AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN";
const CFBD_BASE = "https://api.collegefootballdata.com";

// --- LOAD PREVIOUSLY POSTED ---
const nowIso = new Date().toISOString();
const posted = readJson("posted_ids.json", { ids: [] });

// --- LOAD TEAM HASHTAGS ---
const teamHashtags = readJson("public/team_hashtags.json", []);

// --- PROCESS BETTING PREVIEWS ---
console.log("Processing betting previews...");
const bettingPosts = await processBettingPreviews();
console.log(`Betting preview posts generated: ${bettingPosts.length}`);

// --- WRITE OUTPUT ---
// Read existing queue to preserve other posts
const existingQueue = readJson("public/cfb_queue.json", { posts: [] });
const existingPosts = existingQueue.posts || [];

// For betting previews, we want to replace old week previews with new week previews
// Filter out old betting preview posts and add new ones
const nonBettingPosts = existingPosts.filter(post => 
  !post.kind.includes('betting_preview')
);

const allPosts = [...nonBettingPosts, ...bettingPosts];

writeJson("public/cfb_queue.json", { generatedAt: nowIso, posts: allPosts });
writeJson("posted_ids.json", { ids: [...posted.ids, ...bettingPosts.map(d => d.id)] });

// --- BETTING PREVIEW PROCESSING FUNCTIONS ---
async function processBettingPreviews() {
  try {
    // Get current season and week
    const currentSeason = new Date().getFullYear(); // 2025
    const currentWeek = await getCurrentWeek(currentSeason);
    
    if (!currentWeek) {
      console.log("No current week found, skipping betting previews");
      return [];
    }

    console.log(`Fetching betting lines for Week ${currentWeek}`);

    // Fetch betting lines for current week
    const bettingLines = await fetchBettingLines(currentSeason, currentWeek);
    if (!bettingLines || !bettingLines.length) {
      console.log("No betting lines data found for current week");
      return [];
    }

    // Filter for conference games (FBS vs FBS, same conference)
    const conferenceGames = bettingLines.filter(game => 
      game.homeConference && 
      game.awayConference && 
      game.homeConference === game.awayConference &&
      game.homeClassification === "fbs" &&
      game.awayClassification === "fbs"
    );

    console.log(`Found ${conferenceGames.length} conference games with betting lines`);

    // Generate posts
    const posts = [];
    for (const game of conferenceGames) {
      const post = createBettingPreviewPost(game, currentWeek);
      if (post) {
        posts.push(post);
      }
    }

    return posts;
  } catch (error) {
    console.error("Error processing betting previews:", error);
    return [];
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
    console.log(`Calendar data:`, calendar);
    
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
            console.log(`Using week ${week} for betting previews (most recent with data)`);
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

async function fetchBettingLines(season, week) {
  try {
    console.log(`Fetching betting lines for season ${season}, week ${week}...`);
    const response = await fetch(`${CFBD_BASE}/lines?year=${season}&week=${week}`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    console.log(`Betting lines response status: ${response.status}`);
    if (!response.ok) {
      console.error(`Betting lines API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} games with betting lines`);
    return data;
  } catch (error) {
    console.error("Error fetching betting lines:", error);
    return null;
  }
}

function createBettingPreviewPost(game, week) {
  // Get odds from DraftKings or ESPN Bet
  const odds = getOdds(game);
  if (!odds) {
    console.log(`No valid odds for ${game.awayTeam} @ ${game.homeTeam}`);
    return null;
  }
  
  // Get team info
  const awayInfo = getTeamInfo(game.awayTeam);
  const homeInfo = getTeamInfo(game.homeTeam);
  
  if (!awayInfo || !homeInfo) {
    console.log(`Missing team info for ${game.awayTeam} or ${game.homeTeam}`);
    return null;
  }
  
  // Determine favorite and underdog
  // Positive spread means away team is favorite, negative spread means home team is favorite
  const isAwayFavorite = odds.spread > 0;
  
  // Format teams with appropriate odds
  let awayTeamText, homeTeamText;
  
  if (isAwayFavorite) {
    // Away team is favorite (positive spread) - show spread for away, moneyline for home
    awayTeamText = `${awayInfo.name} (-${odds.spread})`;
    homeTeamText = `${homeInfo.name} (+${odds.homeMoneyline})`;
  } else {
    // Home team is favorite (negative spread) - show spread for home, moneyline for away
    awayTeamText = `${awayInfo.name} (+${odds.awayMoneyline})`;
    homeTeamText = `${homeInfo.name} (-${Math.abs(odds.spread)})`;
  }
  
  // Get conference name (without hashtag)
  const conferenceName = game.homeConference;
  
  // Create post text
  const text = `Week ${week} ${conferenceName} Betting Preview\n${awayTeamText} @ ${homeTeamText}\nO/U: ${odds.overUnder}\n\n#${awayInfo.hashtag.replace('#', '')} #${homeInfo.hashtag.replace('#', '')}`;
  
  // Check if already posted
  const id = `betting_preview_week${week}_${game.id}`;
  if (posted.ids.includes(id)) {
    console.log(`Betting preview for game ${game.id} already posted`);
    return null;
  }
  
  return {
    id,
    kind: "betting_preview",
    text: text.slice(0, 280),
    link: `https://www.espn.com/college-football/game/_/gameId/${game.id}`,
    expiresAt: new Date(Date.now() + 24 * 3600e3).toISOString(), // 24 hours
    source: "cfbd",
    generatedAt: new Date().toISOString(),
    priority: 5 // Medium priority
  };
}

function getOdds(game) {
  if (!game.lines || game.lines.length === 0) {
    return null;
  }
  
  // Try DraftKings first
  let odds = game.lines.find(line => line.provider === "DraftKings");
  
  // Fallback to ESPN Bet
  if (!odds) {
    odds = game.lines.find(line => line.provider === "ESPN Bet");
  }
  
  if (!odds || !odds.spread || !odds.overUnder) {
    return null;
  }
  
  return {
    spread: odds.spread,
    overUnder: odds.overUnder,
    homeMoneyline: odds.homeMoneyline,
    awayMoneyline: odds.awayMoneyline
  };
}

function getTeamInfo(teamName) {
  // Try exact match first
  let team = teamHashtags.find(t => t.team === teamName);
  
  // Try starts-with matching (best for short names like "Tennessee" -> "Tennessee Volunteers")
  if (!team) {
    team = teamHashtags.find(t => 
      t.team.toLowerCase().startsWith(teamName.toLowerCase())
    );
  }
  
  // Fallback to contains matching for cases like "Ohio State" -> "Ohio State Buckeyes"
  if (!team) {
    team = teamHashtags.find(t => 
      t.team.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(t.team.toLowerCase())
    );
  }
  
  if (!team) {
    return null;
  }
  
  return {
    name: team.team,
    hashtag: team.hashtag
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
