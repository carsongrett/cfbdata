// scripts/generate_betting_previews.mjs
import fs from "node:fs";

// --- CONFIG ---
const CACHE_FILE = "public/betting_lines_cache.json";
const TEAM_HASHTAGS_FILE = "public/team_hashtags.json";
const QUEUE_FILE = "public/cfb_queue.json";
const POSTED_IDS_FILE = "posted_ids.json";

// --- LOAD DATA ---
const cache = loadJson(CACHE_FILE, { week3: [] });
const teamHashtags = loadJson(TEAM_HASHTAGS_FILE, []);
const posted = loadJson(POSTED_IDS_FILE, { ids: [] });

console.log("Generating betting previews for Week 3...");

// --- PROCESS GAMES ---
const games = cache.week3 || [];
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
  
  // Get conference hashtag
  const conferenceTag = getConferenceHashtag(game.homeConference);
  
  // Create post text
  const text = `Week 3 ${conferenceTag} Preview\n${awayTeamText} @ ${homeTeamText}. O/U: ${odds.overUnder}\n#${awayInfo.hashtag.replace('#', '')} #${homeInfo.hashtag.replace('#', '')}`;
  
  // Check if already posted
  const id = `betting_preview_${game.id}`;
  if (posted.ids.includes(id)) {
    console.log(`Betting preview for game ${game.id} already posted`);
    return null;
  }
  
  return {
    id,
    kind: "betting_preview",
    priority: 90,
    text: text.slice(0, 280),
    link: `https://www.espn.com/college-football/game/_/gameId/${game.id}`,
    expiresAt: new Date(Date.now() + 24 * 3600e3).toISOString(), // 24 hours
    source: "cfbd"
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
