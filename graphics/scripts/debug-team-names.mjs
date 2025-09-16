import fs from 'fs';

// Load team colors data
const teamColorsPath = '../data/team_colors.json';
const teamColors = JSON.parse(fs.readFileSync(teamColorsPath, 'utf8'));

console.log('=== TEAM COLORS IN JSON FILE ===');
teamColors.slice(0, 10).forEach(team => {
  console.log(`"${team.name}" -> ${team.primary}`);
});
console.log(`Total teams in JSON: ${teamColors.length}`);

// Function to get team colors by name (same as in generate-leaders.mjs)
function getTeamColors(teamName) {
  // Try exact match first
  let team = teamColors.find(t => t.name === teamName);
  
  // If no exact match, try partial matching
  if (!team) {
    // Try to find by first word (e.g., "Indiana" matches "Indiana Hoosiers")
    const firstWord = teamName.split(' ')[0];
    team = teamColors.find(t => t.name.startsWith(firstWord));
  }
  
  // If still no match, try reverse matching (e.g., "Indiana Hoosiers" contains "Indiana")
  if (!team) {
    team = teamColors.find(t => t.name.includes(teamName));
  }
  
  return team ? { primary: team.primary, secondary: team.secondary } : { primary: '#666666', secondary: '#FFFFFF' };
}

// Test with some team names from the image
const testTeams = ['Navy', 'BYU', 'Indiana', 'Washington', 'Missouri', 'Florida State', 'Boston College', 'Texas Tech', 'Syracuse', 'Baylor', 'Nebraska', 'USC'];

console.log('\n=== TEAM COLOR LOOKUP TEST ===');
testTeams.forEach(teamName => {
  const colors = getTeamColors(teamName);
  const isDefault = colors.primary === '#666666';
  console.log(`"${teamName}" -> ${colors.primary} ${isDefault ? '(DEFAULT - NO MATCH)' : '(MATCHED)'}`);
});
