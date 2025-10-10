import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIG ---
const CFBD_API_KEY = "AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN";
const CFBD_BASE = "https://api.collegefootballdata.com";
const SEASON = 2025;
const TARGET_WEEK = 7; // Current week

// --- LOAD EXISTING DATA ---
const teamColorsPath = path.join(__dirname, '..', 'data', 'team_colors.json');
const teamMappingPath = path.join(__dirname, '..', 'data', 'team_mapping.json');
const teamColors = JSON.parse(fs.readFileSync(teamColorsPath, 'utf8'));
const teamMapping = JSON.parse(fs.readFileSync(teamMappingPath, 'utf8'));

console.log('🎨 Generating Looking Ahead graphics for 2025 Season...');

// --- UTILITY FUNCTIONS ---

function loadJson(filePath, defaultValue = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function encodeImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).slice(1);
    return `data:image/${ext};base64,${base64}`;
  } catch (error) {
    console.warn('⚠️ Could not load image:', imagePath, error.message);
    return null;
  }
}

// --- API FUNCTIONS ---

async function fetchTeams() {
  try {
    console.log('📋 Fetching teams data...');
    const response = await fetch(`${CFBD_BASE}/teams`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    if (!response.ok) {
      console.error(`Teams API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const teams = await response.json();
    console.log(`✅ Found ${teams.length} teams`);
    return teams;
  } catch (error) {
    console.error('❌ Error fetching teams:', error.message);
    return null;
  }
}

async function fetchRankings(season, week) {
  try {
    console.log(`📊 Fetching rankings for ${season} Week ${week}...`);
    const response = await fetch(`${CFBD_BASE}/rankings?year=${season}&week=${week}&seasonType=regular`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    if (!response.ok) {
      console.error(`Rankings API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const rankings = await response.json();
    console.log(`✅ Rankings data received`);
    console.log('📊 Rankings structure:', JSON.stringify(rankings, null, 2));
    
    // Find AP poll in the polls array
    const polls = rankings[0]?.polls || [];
    console.log('📊 Available polls:', polls.map(p => p.poll));
    const apPoll = polls.find(poll => poll.poll === "AP Top 25");
    
    if (apPoll) {
      console.log('📊 AP Poll teams:', apPoll.ranks?.slice(0, 10).map(r => `${r.rank}. ${r.school}`));
    }
    
    return apPoll ? apPoll.ranks : null;
  } catch (error) {
    console.error('❌ Error fetching rankings:', error.message);
    return null;
  }
}

async function fetchBettingLines(season, week) {
  try {
    console.log(`💰 Fetching betting lines for ${season} Week ${week}...`);
    const response = await fetch(`${CFBD_BASE}/lines?year=${season}&week=${week}`, {
      headers: { "Authorization": `Bearer ${CFBD_API_KEY}` }
    });
    
    if (!response.ok) {
      console.error(`Betting lines API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const lines = await response.json();
    console.log(`✅ Found ${lines.length} games with betting lines`);
    
    // Debug: Show first few games
    console.log('💰 Sample games:', lines.slice(0, 3).map(g => ({
      home: g.homeTeam,
      away: g.awayTeam,
      spread: g.lines?.[0]?.spread,
      overUnder: g.lines?.[0]?.overUnder
    })));
    
    return lines;
  } catch (error) {
    console.error('❌ Error fetching betting lines:', error.message);
    return null;
  }
}

// --- TEAM MAPPING FUNCTIONS ---

function findTeamLogo(teamName) {
  // Try exact match first
  const exactMatch = teamMapping[teamName];
  if (exactMatch) {
    return exactMatch;
  }
  
  // Try partial matching
  for (const [key, value] of Object.entries(teamMapping)) {
    if (teamName.includes(key) || key.includes(teamName)) {
      return value;
    }
  }
  
  // Try team colors as fallback
  const teamColor = teamColors.find(t => 
    t.name === teamName || 
    t.name.includes(teamName) || 
    teamName.includes(t.name)
  );
  
  if (teamColor) {
    return {
      abbr: teamName.split(' ').map(w => w[0]).join(''),
      primary: teamColor.primary,
      secondary: teamColor.secondary
    };
  }
  
  return null;
}

function getTeamLogoPath(teamName) {
  // Common logo file mappings
  const logoMappings = {
    'Ohio State': 'Ohio_State_Buckeyes_logo-300x300.png',
    'Penn State': 'Penn_State_Nittany_Lions_logo-300x300.png',
    'Georgia': 'Georgia_Bulldogs_logo-300x300.png',
    'Tennessee': 'Tennessee_Volunteers_logo-300x300.png',
    'Texas': 'Texas_Longhorns_logo-300x300.png',
    'Oklahoma': 'Oklahoma_Sooners_logo-300x300.png',
    'Alabama': 'Alabama_Crimson_Tide_logo-300x300.png',
    'LSU': 'LSU_Tigers-300x300.png',
    'Michigan': 'Michigan_Wolverines_logo-300x300.png',
    'Wisconsin': 'Wisconsin_Badgers_logo-300x300.png',
    'Clemson': 'Clemson_Tigers_logo-300x300.png',
    'Florida State': 'Florida_State_Seminoles_logo-300x300.png',
    'Oregon': 'Oregon_Ducks_logo-300x300.png',
    'Washington': 'Washington_Huskies_logo-300x300.png',
    'Notre Dame': 'Notre_Dame_Fighting_Irish_logo-300x300.png',
    'USC': 'USC_Trojans_logo-300x300.png',
    'TCU': 'TCU_Horned_Frogs_logo-300x300.png',
    'Kansas State': 'Kansas_State_Wildcats_logo-300x300.png',
    'BYU': 'BYU_Cougars_logo-300x300.png',
    'Arizona': 'Arizona_Wildcats_logo-300x300.png',
    'Arizona State': 'Arizona_State_Sun_Devils_logo-300x300.png',
    'North Texas': 'North_Texas_Mean_Green_logo-300x300.png',
    'Missouri State': 'Missouri_State_Bears_logo-300x300.png',
    'Middle Tennessee': 'Middle-Tennessee-Blue-Raiders-logo-300x300.png',
    'Northern Illinois': 'Northern_Illinois_Huskies-300x300.png',
    'Eastern Michigan': 'Eastern_Michigan_Eagles_logo-300x300.png',
    'Iowa': 'Iowa_Hawkeyes_logo-300x300.png',
    'Utah': 'Utah_Utes_logo-300x300.png',
    'South Florida': 'South_Florida_Bulls_logo-300x300.png',
    'Texas Tech': 'Texas_Tech_Red_Raiders_logo-300x300.png',
    'Kansas': 'Kansas_Jayhawks_logo-300x300.png',
    'Oklahoma State': 'Oklahoma_State_Cowboys_logo-300x300.png',
    'Baylor': 'Baylor_Bears_logo-300x300.png',
    'West Virginia': 'West_Virginia_Mountaineers_logo-300x300.png',
    'Cincinnati': 'Cincinnati_Bearcats_logo-300x300.png',
    'Houston': 'Houston_Cougars_logo-300x300.png',
    'UCF': 'UCF_Knights_logo-300x300.png',
    'Colorado': 'Colorado_Buffaloes_logo-300x300.png',
    'Indiana': 'Indiana_Hoosiers_logo-300x300.png',
    'Illinois': 'Illinois_Fighting_Illini_logo-300x300.png',
    'Minnesota': 'Minnesota_Golden_Gophers_logo-300x300.png',
    'Nebraska': 'Nebraska_Cornhuskers_logo-300x300.png',
    'Purdue': 'Purdue_Boilermakers_logo-300x300.png',
    'Maryland': 'Maryland_Terrapins_logo-300x300.png',
    'Rutgers': 'Rutgers_Scarlet_Knights_logo-300x300.png',
    'Northwestern': 'Northwestern_Wildcats_logo-300x300.png',
    'Michigan State': 'Michigan_State_Spartans_logo-300x300.png',
    'Missouri': 'Missouri_Tigers_logo-300x300.png',
    'Ole Miss': 'Ole_Miss_Rebels_logo-300x300.png',
    'Texas A&M': 'Texas_AM_University_logo-300x300.png',
    'Vanderbilt': 'Vanderbilt_Commodores_logo-300x300.png',
    'Auburn': 'Auburn_Tigers_logo-300x300.png',
    'Florida': 'Florida_Gators_logo-300x300.png',
    'Kentucky': 'Kentucky_Wildcats_logo-300x300.png',
    'South Carolina': 'South_Carolina_Gamecocks_logo-300x300.png',
    'Arkansas': 'Arkansas_Razorbacks_logo-300x300.png',
    'Mississippi State': 'Mississippi_State_Bulldogs_logo-300x300.png',
    // Additional Power 5 and Group of 5 teams
    'Louisville': 'Louisville_Cardinals_logo-300x300.png',
    'North Carolina': 'North_Carolina_Tar_Heels_logo-300x300.png',
    'Duke': 'Duke_Blue_Devils_logo-300x300.png',
    'Virginia Tech': 'Virginia_Tech_Hokies_logo-300x300.png',
    'Pittsburgh': 'Pitt_Panthers_logo-300x300.png',
    'Syracuse': 'Syracuse_Orange_logo-300x300.png',
    'Boston College': 'Boston_College_Eagles_logo-300x300.png',
    'Wake Forest': 'Wake_Forest_Demon_Deacons_logo-300x300.png',
    'NC State': 'NC_State_Wolfpack_logo-300x300.png',
    'Miami': 'Miami_Hurricanes_logo-300x300.png',
    'Stanford': 'Stanford_Cardinal_logo-300x300.png',
    'California': 'California_Golden_Bears_logo-300x300.png',
    'UCLA': 'UCLA_Bruins_logo-300x300.png',
    'Utah': 'Utah_Utes_logo-300x300.png',
    'Colorado': 'Colorado_Buffaloes_logo-300x300.png',
    'Arizona': 'Arizona_Wildcats_logo-300x300.png',
    'Arizona State': 'Arizona_State_Sun_Devils_logo-300x300.png',
    'Washington State': 'Washington_State_Cougars_logo-300x300.png',
    'Oregon State': 'Oregon_State_Beavers_logo-300x300.png',
    'Boise State': 'Boise_State_Broncos_logo-300x300.png',
    'San Diego State': 'San_Diego_State_Aztecs_logo-300x300.png',
    'Fresno State': 'Fresno_State_Bulldogs_logo-300x300.png',
    'Nevada': 'Nevada_Wolf_Pack_logo-300x300.png',
    'UNLV': 'UNLV_Rebels_logo-300x300.png',
    'Wyoming': 'Wyoming_Cowboys_logo-300x300.png',
    'Utah State': 'Utah_State_Aggies_logo-300x300.png',
    'Air Force': 'Air_Force_Falcons_logo-300x300.png',
    'Colorado State': 'Colorado_State_Rams_logo-300x300.png',
    'New Mexico': 'New_Mexico_Lobos_logo-300x300.png',
    'Hawaii': 'Hawaii_Rainbow_Warriors_logo-300x300.png',
    'San Jose State': 'San_Jose_State_Spartans_logo-300x300.png',
    'Tulane': 'Tulane_Green_Wave_logo-300x300.png',
    'SMU': 'SMU_Mustangs_logo-300x300.png',
    'Memphis': 'Memphis_Tigers_logo-300x300.png',
    'Navy': 'Navy_Midshipmen_logo-300x300.png',
    'Army': 'Army_Black_Knights_logo-300x300.png',
    'Temple': 'Temple_Owls_logo-300x300.png',
    'East Carolina': 'East_Carolina_Pirates_logo-300x300.png',
    'Tulsa': 'Tulsa_Golden_Hurricane_logo-300x300.png',
    'Toledo': 'Toledo_Rockets_logo-300x300.png',
    'Western Michigan': 'Western_Michigan_Broncos_logo-300x300.png',
    'Central Michigan': 'Central_Michigan_Chippewas_logo-300x300.png',
    'Ball State': 'Ball_State_Cardinals_logo-300x300.png',
    'Bowling Green': 'Bowling_Green_Falcons_logo-300x300.png',
    'Miami (OH)': 'Miami_OH_RedHawks_logo-300x300.png',
    'Kent State': 'Kent_State_Golden_Flashes_logo-300x300.png',
    'Buffalo': 'Buffalo_Bulls_logo-300x300.png',
    'Akron': 'Akron_Zips_logo-300x300.png',
    'Ohio': 'Ohio_Bobcats_logo-300x300.png',
    'Appalachian State': 'Appalachian_State_Mountaineers_logo-300x300.png',
    'Coastal Carolina': 'Coastal_Carolina_Chanticleers_logo-300x300.png',
    'Georgia State': 'Georgia_State_Panthers_logo-300x300.png',
    'Georgia Southern': 'Georgia_Southern_Eagles_logo-300x300.png',
    'Troy': 'Troy_Trojans_logo-300x300.png',
    'South Alabama': 'South_Alabama_Jaguars_logo-300x300.png',
    'Louisiana': 'Louisiana_Ragin_Cajuns_logo-300x300.png',
    'Louisiana-Monroe': 'Louisiana_Monroe_Warhawks_logo-300x300.png',
    'Arkansas State': 'Arkansas_State_Red_Wolves_logo-300x300.png',
    'Texas State': 'Texas_State_Bobcats_logo-300x300.png',
    'Southern Miss': 'Southern_Miss_Golden_Eagles_logo-300x300.png',
    'Louisiana Tech': 'Louisiana_Tech_Bulldogs_logo-300x300.png',
    'Rice': 'Rice_Owls_logo-300x300.png',
    'UTEP': 'UTEP_Miners_logo-300x300.png',
    'North Texas': 'North_Texas_Mean_Green_logo-300x300.png',
    'Charlotte': 'Charlotte_49ers_logo-300x300.png',
    'Florida Atlantic': 'Florida_Atlantic_Owls_logo-300x300.png',
    'Florida International': 'Florida_International_Panthers_logo-300x300.png',
    'Western Kentucky': 'Western_Kentucky_Hilltoppers_logo-300x300.png',
    'Marshall': 'Marshall_Thundering_Herd_logo-300x300.png',
    'Old Dominion': 'Old_Dominion_Monarchs_logo-300x300.png',
    'Liberty': 'Liberty_Flames_logo-300x300.png',
    'New Mexico State': 'New_Mexico_State_Aggies_logo-300x300.png',
    'UMass': 'UMass_Minutemen_logo-300x300.png',
    'Connecticut': 'Connecticut_Huskies_logo-300x300.png',
    'James Madison': 'James_Madison_Dukes_logo-300x300.png'
  };
  
  return logoMappings[teamName] || null;
}

function generateTeamLetters(teamName, teamData) {
  // Extract initials from team name
  const words = teamName.split(' ');
  let initials = '';
  
  if (words.length === 1) {
    // Single word - take first 2-3 letters
    initials = teamName.substring(0, Math.min(3, teamName.length));
  } else {
    // Multiple words - take first letter of each word, max 3
    initials = words.slice(0, 3).map(word => word[0]).join('');
  }
  
  // Get team colors
  const primaryColor = teamData?.primary || '#666666';
  const secondaryColor = teamData?.secondary || '#FFFFFF';
  
  // Create SVG with team letters
  const svg = `
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
      <circle cx="75" cy="75" r="70" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
      <text x="75" y="85" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${secondaryColor}">${initials.toUpperCase()}</text>
    </svg>
  `;
  
  // Convert SVG to data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// --- GAME SELECTION LOGIC ---

function selectConferenceMatchups(rankings, bettingLines) {
  console.log('🎯 Selecting top conference matchups...');
  
  // Create ranking lookup
  const rankingMap = new Map();
  if (rankings) {
    rankings.forEach(team => {
      rankingMap.set(team.school, team.rank);
    });
  }
  
  // Conference mapping
  const conferenceTeams = {
    'SEC': ['Alabama', 'Georgia', 'LSU', 'Tennessee', 'Missouri', 'Ole Miss', 'Texas A&M', 'Oklahoma', 'Texas', 'Vanderbilt', 'Auburn', 'Florida', 'Kentucky', 'South Carolina', 'Arkansas', 'Mississippi State'],
    'Big Ten': ['Ohio State', 'Michigan', 'Penn State', 'Indiana', 'Illinois', 'Oregon', 'Washington', 'USC', 'UCLA', 'Iowa', 'Wisconsin', 'Minnesota', 'Nebraska', 'Purdue', 'Maryland', 'Rutgers', 'Northwestern', 'Michigan State'],
    'Big 12': ['Texas Tech', 'BYU', 'Arizona State', 'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State', 'TCU', 'Baylor', 'West Virginia', 'Cincinnati', 'Houston', 'UCF', 'Arizona', 'Colorado', 'Utah']
  };
  
  // Helper function to determine team's conference
  const getTeamConference = (teamName) => {
    for (const [conference, teams] of Object.entries(conferenceTeams)) {
      if (teams.some(team => teamName.includes(team) || team.includes(teamName))) {
        return conference;
      }
    }
    return null;
  };
  
  // Get only conference vs conference matchups (both teams from same conference)
  const conferenceGames = bettingLines.filter(game => {
    const homeConf = getTeamConference(game.homeTeam);
    const awayConf = getTeamConference(game.awayTeam);
    
    // Both teams must be from same conference and from one of our target conferences
    return homeConf && awayConf && homeConf === awayConf;
  });
  
  console.log(`📊 Found ${conferenceGames.length} conference vs conference games`);
  
  // Sort games by competitiveness (closer spreads = better matchup)
  const sortedGames = conferenceGames.sort((a, b) => {
    const aSpread = Math.abs(a.lines?.[0]?.spread || 999);
    const bSpread = Math.abs(b.lines?.[0]?.spread || 999);
    return aSpread - bSpread;
  });
  
  // Group games by conference
  const conferenceGroups = {
    'SEC': [],
    'Big Ten': [],
    'Big 12': []
  };
  
  sortedGames.forEach(game => {
    const gameConf = getTeamConference(game.homeTeam);
    
    if (gameConf && conferenceGroups[gameConf] && conferenceGroups[gameConf].length < 3) {
      conferenceGroups[gameConf].push(game);
    }
  });
  
  console.log(`📊 Conference breakdown:`);
  console.log(`   SEC: ${conferenceGroups['SEC'].length} games`);
  console.log(`   Big Ten: ${conferenceGroups['Big Ten'].length} games`);
  console.log(`   Big 12: ${conferenceGroups['Big 12'].length} games`);
  
  return conferenceGroups;
}

// --- HTML GENERATION ---

function generateHTML(gamesData, conferenceName) {
  const logoPath = path.join(__dirname, '..', 'assets', 'x_logo.png');
  const logoDataUrl = encodeImageToBase64(logoPath);
  
  // Generate HTML for 3 games in this graphic
  const gamesHTML = gamesData.map((gameData, index) => {
    const homeTeam = gameData.homeTeam;
    const awayTeam = gameData.awayTeam;
    const lines = gameData.lines?.[0];
    
    // Get team data
    const homeTeamData = findTeamLogo(homeTeam);
    const awayTeamData = findTeamLogo(awayTeam);
    
    const homeLogoPath = getTeamLogoPath(homeTeam);
    const awayLogoPath = getTeamLogoPath(awayTeam);
    
    // Generate team letter logos if no logo file exists
    const homeLogoUrl = homeLogoPath ? `../assets/team icons/${homeLogoPath}` : generateTeamLetters(homeTeam, homeTeamData);
    const awayLogoUrl = awayLogoPath ? `../assets/team icons/${awayLogoPath}` : generateTeamLetters(awayTeam, awayTeamData);
    
    // Get rankings
    const homeRank = gameData.homeRank;
    const awayRank = gameData.awayRank;
    
    // Get betting data
    const spread = lines?.spread || 0;
    const overUnder = lines?.overUnder || 0;
    
    // Use conference-specific colors for professional look
    const getConferenceColor = (conference) => {
      const colors = {
        'SEC': '#1E3A8A',           // SEC navy blue
        'Big Ten': '#1E40AF',       // Big Ten dark blue  
        'Big 12': '#B91C1C',        // Big 12 dark red
        'ACC': '#166534',           // ACC dark green
        'Pac-12': '#7C2D12',        // Pac-12 dark brown
        'American Athletic': '#581C87', // American purple
        'Mountain West': '#92400E', // Mountain West brown
        'MAC': '#374151',           // MAC gray
        'Sun Belt': '#059669',      // Sun Belt green
        'C-USA': '#DC2626'          // C-USA red
      };
      return colors[conference] || '#1F2937'; // Default dark gray
    };
    
    const conferenceColor = getConferenceColor(gameData.conference);
    const darkerColor = darkenColor(conferenceColor, 0.2);
    
    return `<!-- Game ${index + 1}: ${awayTeam} @ ${homeTeam} -->
                <div class="game-card rounded-lg px-8 shadow-lg" style="background: ${darkerColor};">
                    <div class="team-section">
                        ${awayRank && awayRank !== 'NR' ? `<div class="rank-badge text-white mb-2">#${awayRank}</div>` : '<div class="mb-2"></div>'}
                        <img src="${awayLogoUrl}" alt="${awayTeam}" class="team-logo">
                        <div class="team-name text-white mt-1">${awayTeam.toUpperCase()}</div>
                    </div>
                    <div class="center-section">
                        <div class="text-white text-5xl font-bold mb-3">@</div>
                        <div class="over-under text-white text-5xl font-bold">O/U ${overUnder}</div>
                    </div>
                    <div class="team-section right">
                        ${homeRank && homeRank !== 'NR' ? `<div class="rank-badge text-white mb-2">#${homeRank}</div>` : '<div class="mb-2"></div>'}
                        <div class="flex items-center justify-center gap-4 mb-1">
                            <div class="flex flex-col items-center">
                                <img src="${homeLogoUrl}" alt="${homeTeam}" class="team-logo">
                                <div class="team-name text-white mt-1">${homeTeam.toUpperCase()}</div>
                            </div>
                            <div class="spread text-white text-5xl font-bold">${spread > 0 ? '+' : ''}${spread}</div>
                        </div>
                    </div>
                </div>`;
  }).join('\n');
  
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Looking Ahead - Week ${TARGET_WEEK}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .game-card {
            height: 280px;
            border: 2px solid transparent;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            justify-items: stretch;
            gap: 24px;
        }
        
        .team-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 100%;
        }
        
        .team-section.right {
            text-align: center;
        }
        
        .team-name {
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            text-transform: uppercase;
        }
        
        .team-logo {
            width: 150px;
            height: 150px;
            object-fit: contain;
            flex-shrink: 0;
        }
        
        .center-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            min-width: 120px;
            gap: 8px;
        }
        
        .team-record {
            font-size: 0.9rem;
            font-weight: 600;
            opacity: 0.85;
        }
        
        .spread {
            font-size: 2rem;
            font-weight: 900;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .over-under {
            font-size: 1.25rem;
            font-weight: 600;
            opacity: 0.9;
        }
        
        .rank-badge {
            font-size: 1.25rem;
            font-weight: 800;
            padding: 6px 14px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .logo-container {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .logo-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    </style>
</head>
<body class="bg-gray-100 m-0 p-0">
    <div class="w-[900px] h-[1200px] bg-gray-100 relative overflow-hidden">
        <!-- Main Content Container -->
        <div class="p-8 h-full flex flex-col">
            <!-- Header -->
            <div class="mb-6 relative">
                <h1 class="text-7xl font-black text-gray-900 mb-2 tracking-tight">
                    LOOKING AHEAD
                </h1>
                <p class="text-3xl font-semibold text-gray-700">
                    WEEK ${TARGET_WEEK} PREVIEW • ${conferenceName.toUpperCase()} MATCHUPS
                </p>
                <!-- CFB DATA Logo in top right corner -->
                <div class="absolute top-0 right-0">
                    <div class="logo-container">
                        <img src="${logoDataUrl}" alt="CFB DATA" class="logo-image" />
                    </div>
                </div>
            </div>
            
            <!-- Games Grid -->
            <div class="flex-1 grid grid-cols-1 gap-0">
                ${gamesHTML}
            </div>
        </div>
    </div>
</body>
</html>`;

  return template;
}

function darkenColor(color, factor) {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Darken by factor
  const newR = Math.floor(r * (1 - factor));
  const newG = Math.floor(g * (1 - factor));
  const newB = Math.floor(b * (1 - factor));
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// --- PNG GENERATION ---

async function generatePNG(htmlContent, outputPath) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to match our graphic dimensions (900x1200)
  await page.setViewportSize({ width: 900, height: 1200 });
  
  // Set the HTML content
  await page.setContent(htmlContent);
  
  // Wait for fonts to load
  await page.waitForLoadState('domcontentloaded');
  
  await page.evaluate(() => {
    return document.fonts.ready;
  });
  
  // Additional wait to ensure fonts are rendered
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({
    path: outputPath,
    type: 'png',
    fullPage: false
  });
  
  await browser.close();
}

// --- MAIN FUNCTION ---

async function main() {
  try {
    // Fetch all required data
    const [teams, rankings, bettingLines] = await Promise.all([
      fetchTeams(),
      fetchRankings(SEASON, TARGET_WEEK),
      fetchBettingLines(SEASON, TARGET_WEEK)
    ]);
    
    if (!bettingLines || bettingLines.length === 0) {
      console.log('❌ No betting lines available for Week', TARGET_WEEK);
      console.log('🛑 Exiting - cannot proceed without betting data');
      return;
    }
    
    if (!rankings || rankings.length === 0) {
      console.log('❌ No rankings available for Week', TARGET_WEEK);
      console.log('🛑 Exiting - cannot proceed without rankings');
      return;
    }
    
    // Select conference matchups
    const conferenceGroups = selectConferenceMatchups(rankings, bettingLines);
    
    const totalGames = Object.values(conferenceGroups).reduce((sum, games) => sum + games.length, 0);
    if (totalGames === 0) {
      console.log('❌ No conference matchups found');
      console.log('🛑 Exiting - no suitable games to display');
      return;
    }
    
    console.log(`✅ Selected ${totalGames} total conference matchups`);
    
    // Prepare games with ranking data
    const rankingMap = new Map();
    rankings.forEach(team => {
      rankingMap.set(team.school, team.rank);
    });
    
    // Generate HTML and PNG files for each conference
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let graphicNumber = 1;
    for (const [conferenceName, games] of Object.entries(conferenceGroups)) {
      // Skip if conference doesn't have at least 3 matchups
      if (games.length < 3) {
        console.log(`⚠️ Skipping ${conferenceName} - only ${games.length} matchup(s) found (need 3)`);
        continue;
      }
      
      const gamesWithRankings = games.map(game => ({
        ...game,
        homeRank: rankingMap.get(game.homeTeam) || null,
        awayRank: rankingMap.get(game.awayTeam) || null
      }));
      
      console.log(`🎨 Generating ${conferenceName} graphic with ${gamesWithRankings.length} games:`);
      gamesWithRankings.forEach((game, index) => {
        const awayRankDisplay = game.awayRank ? `#${game.awayRank}` : 'NR';
        const homeRankDisplay = game.homeRank ? `#${game.homeRank}` : 'NR';
        console.log(`   ${index + 1}. ${awayRankDisplay} ${game.awayTeam} @ ${homeRankDisplay} ${game.homeTeam}`);
      });
      
      // Generate HTML
      const htmlContent = generateHTML(gamesWithRankings, conferenceName);
      const htmlPath = path.join(outputDir, `looking-ahead-${conferenceName.toLowerCase().replace(' ', '-')}.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      
      // Generate PNG
      const pngPath = path.join(outputDir, `looking-ahead-${conferenceName.toLowerCase().replace(' ', '-')}.png`);
      await generatePNG(htmlContent, pngPath);
      
      console.log(`✅ Generated looking-ahead-${conferenceName.toLowerCase().replace(' ', '-')}.png`);
      graphicNumber++;
    }
    
    console.log(`🎉 Successfully generated ${graphicNumber - 1} conference graphics with ${totalGames} total matchups!`);
    
  } catch (error) {
    console.error('❌ Error in main function:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
