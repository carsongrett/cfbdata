// scripts/clear_cache_and_reset.mjs
import fs from "node:fs";

console.log("Clearing all caches and resetting posted IDs...");

// Clear poll cache
const pollCache = {
  lastFetch: null,
  lastWeek: null,
  lastSeason: null,
  apPolls: {},
  coachesPolls: {},
  spRatings: {}
};
writeJson("public/poll_cache.json", pollCache);
console.log("✅ Cleared poll cache");

// Clear betting lines cache
const bettingCache = {};
writeJson("public/betting_lines_cache.json", bettingCache);
console.log("✅ Cleared betting lines cache");

// Reset posted IDs
writeJson("posted_ids.json", { ids: [] });
console.log("✅ Reset posted IDs");

// Clear only dynamic content from the queue (preserve static content like stadiums)
const existingQueue = readJson("public/cfb_queue.json", { posts: [] });
const staticPosts = existingQueue.posts.filter(post => 
  post.kind === "stadiums" || 
  post.kind === "graphics" ||
  post.source === "venues" ||
  post.source === "static"
);
const clearedQueue = {
  generatedAt: new Date().toISOString(),
  posts: staticPosts
};
writeJson("public/cfb_queue.json", clearedQueue);
console.log(`✅ Cleared dynamic content, preserved ${staticPosts.length} static posts`);

console.log("🎉 All caches cleared! Next API calls will be fresh.");

// --- HELPERS ---
function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { return fallback; }
}
function writeJson(p, obj) {
  fs.mkdirSync(p.split("/").slice(0, -1).join("/") || ".", { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}
