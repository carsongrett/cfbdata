// scripts/debug_week.mjs
import fs from "node:fs";

const CFBD_API_KEY = "AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN";
const CFBD_BASE = "https://api.collegefootballdata.com";

console.log("=== WEEK DEBUG ===");
console.log(`Current date: ${new Date()}`);
console.log(`Day of week: ${new Date().getDay()} (0=Sunday, 1=Monday, etc.)`);

try {
  const response = await fetch(`${CFBD_BASE}/calendar?year=2025`, {
    headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
  });
  
  if (!response.ok) {
    console.error(`API error: ${response.status}`);
    return;
  }
  
  const calendar = await response.json();
  console.log("\n=== CALENDAR DATA ===");
  calendar.forEach(week => {
    const startDate = new Date(week.startDate);
    const endDate = new Date(week.endDate);
    const today = new Date();
    const isCurrentWeek = today >= startDate && today <= endDate;
    const isCompleted = today > endDate;
    
    console.log(`Week ${week.week}: ${week.startDate} to ${week.endDate} (Current: ${isCurrentWeek}, Completed: ${isCompleted})`);
  });
  
  // Test the week detection logic
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  console.log(`\n=== WEEK DETECTION LOGIC ===`);
  console.log(`Today is day ${dayOfWeek} (0=Sunday, 1=Monday, etc.)`);
  
  if (dayOfWeek === 0) {
    console.log("Sunday: Should use current week for polls");
    const currentWeek = calendar.find(week => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      return today >= startDate && today <= endDate;
    });
    console.log(`Current week found: ${currentWeek ? currentWeek.week : 'None'}`);
  } else {
    console.log("Weekday: Should use week after most recent completed week");
    const completedWeeks = calendar.filter(week => {
      const endDate = new Date(week.endDate);
      return today > endDate;
    });
    console.log(`Completed weeks: ${completedWeeks.map(w => w.week).join(', ')}`);
    
    if (completedWeeks.length > 0) {
      const lastCompleted = completedWeeks[completedWeeks.length - 1];
      const pollWeek = lastCompleted.week + 1;
      console.log(`Last completed week: ${lastCompleted.week}`);
      console.log(`Poll week should be: ${pollWeek}`);
    }
  }
  
} catch (error) {
  console.error("Error:", error);
}
