// scripts/week-utils.mjs
// Shared utility for week calculation

const CFBD_API_KEY = process.env.CFBD_API_KEY;
const CFBD_BASE = "https://api.collegefootballdata.com";

// API-based week detection - finds the most recent week with available poll data
// This fetches all rankings data and returns the highest week number with actual poll data
export async function getCurrentWeek(season) {
  try {
    console.log(`Fetching all rankings for season ${season}...`);
    const response = await fetch(`${CFBD_BASE}/rankings?year=${season}&seasonType=regular`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    console.log(`Rankings response status: ${response.status}`);
    if (!response.ok) {
      console.error(`Rankings API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const allRankings = await response.json();
    console.log(`Total ranking entries returned: ${allRankings.length}`);
    
    // Filter for entries that have actual poll data and extract week numbers
    const weeksWithPolls = allRankings
      .filter(item => item.polls && item.polls.length > 0 && item.week)
      .map(item => ({
        week: item.week,
        pollCount: item.polls.length,
        polls: item.polls.map(p => p.poll)
      }))
      .sort((a, b) => b.week - a.week); // Sort descending by week number
    
    if (weeksWithPolls.length === 0) {
      console.log("No weeks found with poll data");
      return null;
    }
    
    // The most recent week is the first one after sorting
    const mostRecentWeek = weeksWithPolls[0];
    console.log(`Most recent week with poll data: Week ${mostRecentWeek.week}`);
    console.log(`  - Polls available: ${mostRecentWeek.polls.join(', ')}`);
    console.log(`  - Total polls: ${mostRecentWeek.pollCount}`);
    
    return mostRecentWeek.week;
  } catch (error) {
    console.error("Error fetching current week:", error);
    return null;
  }
}

// Date-based week calculation (kept for backward compatibility if needed)
export function getCurrentWeekFromDate() {
  const seasonStart = new Date('2025-08-25'); // Week 1 start (Sunday)
  const now = new Date();
  
  // Find the current week's Sunday (poll release day)
  // If today is Sunday, use today; otherwise find the next Sunday
  const daysUntilSunday = now.getDay() === 0 ? 0 : (7 - now.getDay());
  const currentWeekSunday = new Date(now);
  currentWeekSunday.setDate(now.getDate() + daysUntilSunday);
  currentWeekSunday.setHours(0, 0, 0, 0);
  
  // Calculate weeks since season start based on Sundays
  const weeksSinceStart = Math.floor((currentWeekSunday - seasonStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
  
  // Cap at reasonable maximum (Week 15 for regular season)
  return Math.min(Math.max(weeksSinceStart, 1), 15);
}

export function getWeekStartDate(week) {
  const seasonStart = new Date('2025-08-25'); // Week 1 start
  const weekStart = new Date(seasonStart);
  weekStart.setDate(seasonStart.getDate() + (week - 1) * 7);
  return weekStart;
}

export function getWeekEndDate(week) {
  const weekStart = getWeekStartDate(week);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}
