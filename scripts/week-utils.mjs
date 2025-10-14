// scripts/week-utils.mjs
// Shared utility for week calculation

const CFBD_API_KEY = process.env.CFBD_API_KEY;
const CFBD_BASE = "https://api.collegefootballdata.com";

// API-based week detection - finds the most recent week with available poll data
export async function getCurrentWeek(season) {
  try {
    console.log(`Fetching calendar for season ${season}...`);
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
    
    // Find the current week based on today's date
    const today = new Date();
    const currentWeek = calendar.find(week => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      return today >= startDate && today <= endDate;
    });
    
    if (currentWeek) {
      console.log(`Current week: ${currentWeek.week}`);
      return currentWeek.week;
    } else {
      // If we're between weeks, find the most recent week with poll data
      console.log("No current week found, searching for most recent week with poll data...");
      
      // Get all available week numbers and sort them in descending order
      const availableWeeks = calendar
        .filter(week => week.week && typeof week.week === 'number')
        .map(week => week.week)
        .sort((a, b) => b - a); // Sort descending (highest first)
      
      console.log(`Available weeks: ${availableWeeks.join(', ')}`);
      
      // Try each week in descending order until we find one with poll data
      for (const week of availableWeeks) {
        console.log(`Testing week ${week} for poll data...`);
        
        try {
          const pollResponse = await fetch(`${CFBD_BASE}/rankings?year=${season}&week=${week}&seasonType=regular`, {
            headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
          });
          
          if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            if (pollData && pollData.length > 0) {
              const polls = pollData[0]?.polls || [];
              if (polls.length > 0) {
                console.log(`Found poll data for week ${week}:`, polls.map(p => p.poll));
                console.log(`Using week ${week} for polls (most recent with data)`);
                return week;
              }
            }
          }
          console.log(`Week ${week} has no poll data`);
        } catch (error) {
          console.log(`Error testing week ${week}:`, error.message);
        }
      }
      
      console.log("No weeks found with poll data");
      return null;
    }
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
