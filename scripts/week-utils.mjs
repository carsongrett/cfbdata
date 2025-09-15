// scripts/week-utils.mjs
// Shared utility for date-based week calculation

export function getCurrentWeekFromDate() {
  const seasonStart = new Date('2025-08-25'); // Week 1 start (Sunday)
  const now = new Date();
  
  // Calculate weeks since season start (Sunday to Sunday)
  const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
  
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
