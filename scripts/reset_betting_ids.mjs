// scripts/reset_betting_ids.mjs
import fs from "node:fs";

// Read current posted IDs
const posted = JSON.parse(fs.readFileSync("posted_ids.json", "utf8"));

// Filter out betting preview IDs
const nonBettingIds = posted.ids.filter(id => !id.startsWith("betting_preview_"));

// Write back only non-betting IDs
fs.writeFileSync("posted_ids.json", JSON.stringify({ ids: nonBettingIds }, null, 2));

console.log(`Removed ${posted.ids.length - nonBettingIds.length} betting preview IDs`);
console.log(`Kept ${nonBettingIds.length} other IDs`);
