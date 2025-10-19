// scripts/debug_api_response.mjs
import fs from "node:fs";

const CFBD_API_KEY = "AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN";
const CFBD_BASE = "https://api.collegefootballdata.com";

console.log("=== DEBUGGING CFBD API RESPONSES ===");
console.log(`Current date: ${new Date()}`);
console.log(`Day of week: ${new Date().getDay()} (0=Sunday, 1=Monday, etc.)`);

// Test 1: Calendar API
console.log("\n=== TEST 1: CALENDAR API ===");
try {
  const calendarResponse = await fetch(`${CFBD_BASE}/calendar?year=2025`, {
    headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
  });
  
  console.log(`Calendar API Status: ${calendarResponse.status}`);
  console.log(`Calendar API Headers:`, Object.fromEntries(calendarResponse.headers.entries()));
  
  if (calendarResponse.ok) {
    const calendar = await calendarResponse.json();
    console.log(`Calendar API Response:`, JSON.stringify(calendar, null, 2));
  } else {
    const errorText = await calendarResponse.text();
    console.log(`Calendar API Error:`, errorText);
  }
} catch (error) {
  console.log(`Calendar API Exception:`, error.message);
}

// Test 2: Rankings API (AP Poll)
console.log("\n=== TEST 2: RANKINGS API (AP POLL) ===");
try {
  const rankingsResponse = await fetch(`${CFBD_BASE}/rankings?year=2025&week=4&seasonType=regular`, {
    headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
  });
  
  console.log(`Rankings API Status: ${rankingsResponse.status}`);
  console.log(`Rankings API Headers:`, Object.fromEntries(rankingsResponse.headers.entries()));
  
  if (rankingsResponse.ok) {
    const rankings = await rankingsResponse.json();
    console.log(`Rankings API Response:`, JSON.stringify(rankings, null, 2));
  } else {
    const errorText = await rankingsResponse.text();
    console.log(`Rankings API Error:`, errorText);
  }
} catch (error) {
  console.log(`Rankings API Exception:`, error.message);
}

// Test 3: SP+ Ratings API
console.log("\n=== TEST 3: SP+ RATINGS API ===");
try {
  const spResponse = await fetch(`${CFBD_BASE}/ratings/sp?year=2025&week=4`, {
    headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
  });
  
  console.log(`SP+ API Status: ${spResponse.status}`);
  console.log(`SP+ API Headers:`, Object.fromEntries(spResponse.headers.entries()));
  
  if (spResponse.ok) {
    const sp = await spResponse.json();
    console.log(`SP+ API Response:`, JSON.stringify(sp, null, 2));
  } else {
    const errorText = await spResponse.text();
    console.log(`SP+ API Error:`, errorText);
  }
} catch (error) {
  console.log(`SP+ API Exception:`, error.message);
}

console.log("\n=== DEBUG COMPLETE ===");
