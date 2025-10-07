// scripts/week-utils.mjs
// Shared utility for date-based week calculation

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
