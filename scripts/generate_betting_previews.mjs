// scripts/generate_betting_previews.mjs
import fs from "node:fs";

// --- CONFIG ---
const CFBD_API_KEY = "AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN";
const CFBD_BASE = "https://api.collegefootballdata.com";
const TEAM_HASHTAGS_FILE = "public/team_hashtags.json";
const QUEUE_FILE = "public/cfb_queue.json";
const POSTED_IDS_FILE = "posted_ids.json";

// --- LOAD DATA ---
const teamHashtags = loadJson(TEAM_HASHTAGS_FILE, []);
const posted = loadJson(POSTED_IDS_FILE, { ids: [] });

console.log("Generating betting previews...");

// --- PROCESS GAMES ---
async function getBettingGames() {
  const currentSeason = new Date().getFullYear();
  const currentWeek = await getCurrentWeek(currentSeason);
  
  if (!currentWeek) {
    console.log("No current week found, skipping betting previews");
    return [];
  }
  
  console.log(`Fetching betting lines for Week ${currentWeek}...`);
  return await fetchBettingLines(currentSeason, currentWeek);
}

const games = await getBettingGames();
const conferenceGames = games.filter(game => 
  game.homeConference && 
  game.awayConference && 
  game.homeConference === game.awayConference &&
  game.homeClassification === "fbs" &&
  game.awayClassification === "fbs"
);

console.log(`Found ${conferenceGames.length} conference games`);

const posts = [];
for (const game of conferenceGames) {
  const post = createBettingPreviewPost(game);
  if (post) {
    posts.push(post);
  }
}

console.log(`Generated ${posts.length} betting preview posts`);

// --- WRITE OUTPUT ---
if (posts.length > 0) {
  const existingQueue = loadJson(QUEUE_FILE, { posts: [] });
  const updatedQueue = {
    ...existingQueue,
    generatedAt: new Date().toISOString(),
    posts: [...existingQueue.posts, ...posts]
  };
  
  writeJson(QUEUE_FILE, updatedQueue);
  
  const newPostedIds = posts.map(p => p.id);
  writeJson(POSTED_IDS_FILE, { ids: [...posted.ids, ...newPostedIds] });
  
  console.log(`Added ${posts.length} posts to queue`);
} else {
  console.log("No betting preview posts generated");
}

// --- FUNCTIONS ---

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

function getConferenceHashtag(conference) {
  const conferenceMap = {
    "SEC": "#SEC",
    "Big Ten": "#BIG10", 
    "Big 12": "#BIG12",
    "ACC": "#ACC",
    "Pac-12": "#PAC12",
    "American Athletic": "#AAC",
    "Mountain West": "#MWC",
    "Sun Belt": "#SUNBELT",
    "Conference USA": "#CUSA",
    "Mid-American": "#MAC"
  };
  return conferenceMap[conference] || `#${conference.replace(/\s+/g, '')}`;
}

function createBettingPreviewPost(game) {
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
  
  // Create post text in new format
  const text = `Week 3 ${conferenceName} Betting Preview\n${awayTeamText} @ ${homeTeamText}\nO/U: ${odds.overUnder}\n\n#${awayInfo.hashtag.replace('#', '')} #${homeInfo.hashtag.replace('#', '')}`;
  
  // Check if already posted
  const id = `betting_preview_${game.id}`;
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
    generatedAt: new Date().toISOString()
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


function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, obj) {
  fs.mkdirSync(file.split("/").slice(0, -1).join("/") || ".", { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}
