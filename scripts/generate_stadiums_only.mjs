// scripts/generate_stadiums_only.mjs
import fs from "node:fs";

// --- CONFIG ---
const VENUES_FILE = "data/venues_fbs.json";
const TEAM_HASHTAGS_FILE = "public/team_hashtags.json";

// --- LOAD PREVIOUSLY POSTED ---
const nowIso = new Date().toISOString();
const posted = readJson("posted_ids.json", { ids: [] });

// --- LOAD DATA ---
const venues = readJson(VENUES_FILE, []);
const teamHashtags = readJson(TEAM_HASHTAGS_FILE, []);

// --- PROCESS STADIUMS ---
console.log("Processing stadium posts...");
const stadiumPosts = await processStadiums();
console.log(`Stadium posts generated: ${stadiumPosts.length}`);

// --- WRITE OUTPUT ---
// Read existing queue to preserve other posts
const existingQueue = readJson("public/cfb_queue.json", { posts: [] });
const existingPosts = existingQueue.posts || [];

// For stadiums, we want to replace old stadium posts with new ones
// Filter out old stadium posts and add new ones
const nonStadiumPosts = existingPosts.filter(post => 
  !post.kind.includes('stadiums')
);

const allPosts = [...nonStadiumPosts, ...stadiumPosts];

writeJson("public/cfb_queue.json", { generatedAt: nowIso, posts: allPosts });
writeJson("posted_ids.json", { ids: [...posted.ids, ...stadiumPosts.map(d => d.id)] });

// --- STADIUM PROCESSING FUNCTIONS ---
async function processStadiums() {
  try {
    // Filter for FBS stadiums with good data
    const fbsStadiums = venues.filter(venue => 
      venue.capacity && 
      venue.capacity >= 30000 && // Only stadiums with 30k+ capacity
      venue.name && 
      venue.city && 
      venue.state && 
      venue.surface &&
      venue.elevation !== null
    );

    console.log(`Found ${fbsStadiums.length} FBS stadiums with complete data`);

    // Select interesting stadiums to feature
    const featuredStadiums = selectFeaturedStadiums(fbsStadiums);
    console.log(`Selected ${featuredStadiums.length} stadiums to feature`);

    // Generate posts
    const posts = [];
    for (const stadium of featuredStadiums) {
      const post = createStadiumPost(stadium);
      if (post) {
        posts.push(post);
      }
    }

    return posts;
  } catch (error) {
    console.error("Error processing stadiums:", error);
    return [];
  }
}

function selectFeaturedStadiums(stadiums) {
  // Sort by capacity (largest first) and select diverse stadiums
  const sorted = stadiums.sort((a, b) => b.capacity - a.capacity);
  
  // Select a mix of:
  // - Top 10 largest stadiums
  // - Random selection from top 50
  // - Some unique/interesting ones
  
  const selected = [];
  
  // Top 10 largest
  selected.push(...sorted.slice(0, 10));
  
  // Random 10 from top 50
  const top50 = sorted.slice(10, 50);
  const random10 = top50.sort(() => 0.5 - Math.random()).slice(0, 10);
  selected.push(...random10);
  
  // Remove duplicates
  const unique = selected.filter((stadium, index, self) => 
    index === self.findIndex(s => s.id === stadium.id)
  );
  
  return unique.slice(0, 15); // Limit to 15 posts
}

function createStadiumPost(stadium) {
  // Get team hashtag if available
  const teamHashtag = getTeamHashtag(stadium);
  
  // Format elevation
  const elevation = stadium.elevation ? 
    `${Math.round(parseFloat(stadium.elevation))} ft` : 
    'Unknown';
  
  // Create post text
  const text = `🏟️ Stadium Spotlight: ${stadium.name}
• Team: ${stadium.primaryTeam || 'Various'}
• Capacity: ${stadium.capacity.toLocaleString()}
• Location: ${stadium.city}, ${stadium.state}
• Surface: ${stadium.surface}
• Elevation: ${elevation}

${teamHashtag} #CFB`;
  
  // Check if already posted
  const id = `stadium_${stadium.id}`;
  if (posted.ids.includes(id)) {
    console.log(`Stadium post for ${stadium.name} already posted`);
    return null;
  }
  
  return {
    id,
    kind: "stadiums",
    text: text.slice(0, 280),
    link: "",
    expiresAt: new Date(Date.now() + 7 * 24 * 3600e3).toISOString(), // 7 days
    source: "venues",
    generatedAt: new Date().toISOString()
  };
}

function getTeamHashtag(stadium) {
  if (!stadium.primaryTeam) {
    return "#CFB";
  }
  
  // Try to find team hashtag
  const team = teamHashtags.find(t => 
    t.team.toLowerCase().includes(stadium.primaryTeam.toLowerCase()) ||
    stadium.primaryTeam.toLowerCase().includes(t.team.toLowerCase())
  );
  
  return team ? team.hashtag : "#CFB";
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
