// scripts/generate_looking_ahead.mjs
import fs from "node:fs";

// --- CONFIG ---
const CACHE_FILE = "public/looking_ahead_cache.json";
const TEAM_HASHTAGS_FILE = "public/team_hashtags.json";
const TEAM_COLORS_FILE = "graphics/data/team_colors.json";
const OUTPUT_FILE = "looking-ahead-real.html";

// --- LOAD DATA ---
const cache = loadJson(CACHE_FILE, {});
const teamHashtags = loadJson(TEAM_HASHTAGS_FILE, []);
const teamColors = loadJson(TEAM_COLORS_FILE, []);

console.log("Generating Looking Ahead graphic...");

// Check if we have cached data
if (!cache.bettingLines || !cache.rankings || !cache.records) {
  console.log("❌ No cached data found. Run cache_looking_ahead_data.mjs first.");
  process.exit(1);
}

console.log(`Using cached data for Week ${cache.currentWeek}:`);
console.log(`  - ${cache.bettingLines.length} games with betting lines`);
console.log(`  - ${cache.rankings.length} ranking polls`);
console.log(`  - ${cache.records.length} team records`);

// --- PROCESS DATA ---
const selectedGames = selectTopGames(cache.bettingLines, cache.rankings, cache.records);
console.log(`Selected ${selectedGames.length} games for graphic`);

// Generate HTML
const html = generateLookingAheadHTML(selectedGames, cache.currentWeek);
writeFile(OUTPUT_FILE, html);

console.log(`✅ Generated looking ahead graphic: ${OUTPUT_FILE}`);

// --- FUNCTIONS ---

function selectTopGames(bettingLines, rankings, records) {
  // Create lookup maps
  const rankingsMap = createRankingsMap(rankings);
  const recordsMap = createRecordsMap(records);
  
  // Process games and score them
  const games = bettingLines
    .filter(game => game.homeClassification === "fbs" && game.awayClassification === "fbs")
    .map(game => {
      const awayRank = getTeamRank(game.awayTeam, rankingsMap);
      const homeRank = getTeamRank(game.homeTeam, rankingsMap);
      const awayRecord = getTeamRecord(game.awayTeam, recordsMap);
      const homeRecord = getTeamRecord(game.homeTeam, recordsMap);
      const odds = getBestOdds(game);
      
      if (!odds) return null;
      
      const score = calculateGameScore(game, awayRank, homeRank, odds);
      
      return {
        ...game,
        awayRank,
        homeRank,
        awayRecord,
        homeRecord,
        odds,
        score
      };
    })
    .filter(game => game !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8); // Top 8 games
  
  return games;
}

function createRankingsMap(rankings) {
  const map = new Map();
  
  // Look for AP Poll (most common)
  const apPoll = rankings.find(poll => 
    poll.poll && poll.poll.toLowerCase().includes('ap')
  );
  
  if (apPoll && apPoll.ranks) {
    apPoll.ranks.forEach(rank => {
      map.set(rank.team, rank.rank);
    });
  }
  
  return map;
}

function createRecordsMap(records) {
  const map = new Map();
  
  records.forEach(team => {
    if (team.team && team.total && team.total.wins !== undefined && team.total.losses !== undefined) {
      map.set(team.team, {
        wins: team.total.wins,
        losses: team.total.losses,
        ties: team.total.ties || 0
      });
    }
  });
  
  return map;
}

function getTeamRank(teamName, rankingsMap) {
  // Try exact match first
  let rank = rankingsMap.get(teamName);
  
  // Try partial matching for cases like "Ohio State" -> "Ohio State Buckeyes"
  if (!rank) {
    for (const [rankedTeam, teamRank] of rankingsMap) {
      if (rankedTeam.toLowerCase().includes(teamName.toLowerCase()) ||
          teamName.toLowerCase().includes(rankedTeam.toLowerCase())) {
        rank = teamRank;
        break;
      }
    }
  }
  
  return rank || null;
}

function getTeamRecord(teamName, recordsMap) {
  // Try exact match first
  let record = recordsMap.get(teamName);
  
  // Try partial matching
  if (!record) {
    for (const [recordedTeam, teamRecord] of recordsMap) {
      if (recordedTeam.toLowerCase().includes(teamName.toLowerCase()) ||
          teamName.toLowerCase().includes(recordedTeam.toLowerCase())) {
        record = teamRecord;
        break;
      }
    }
  }
  
  return record || { wins: 0, losses: 0, ties: 0 };
}

function getBestOdds(game) {
  if (!game.lines || game.lines.length === 0) return null;
  
  // Try DraftKings first, then ESPN Bet
  let odds = game.lines.find(line => line.provider === "DraftKings");
  if (!odds) {
    odds = game.lines.find(line => line.provider === "ESPN Bet");
  }
  
  if (!odds || odds.spread === undefined || odds.overUnder === undefined) {
    return null;
  }
  
  return {
    spread: odds.spread,
    overUnder: odds.overUnder,
    homeMoneyline: odds.homeMoneyline,
    awayMoneyline: odds.awayMoneyline
  };
}

function calculateGameScore(game, awayRank, homeRank, odds) {
  let score = 0;
  
  // Priority 1: Ranked vs Ranked matchups (highest priority)
  if (awayRank && homeRank) {
    score += 1000;
    // Bonus for higher ranked teams
    score += (26 - awayRank) + (26 - homeRank);
  }
  
  // Priority 2: Conference matchups
  if (game.homeConference === game.awayConference) {
    score += 100;
    
    // Bonus for major conferences
    const majorConferences = ['SEC', 'Big Ten', 'Big 12', 'ACC', 'Pac-12'];
    if (majorConferences.includes(game.homeConference)) {
      score += 50;
      
      // Extra bonus for SEC and Big Ten
      if (['SEC', 'Big Ten'].includes(game.homeConference)) {
        score += 25;
      }
    }
  }
  
  // Priority 3: Close spreads (more competitive games)
  const spreadAbs = Math.abs(odds.spread);
  if (spreadAbs <= 3) score += 30;
  else if (spreadAbs <= 7) score += 20;
  else if (spreadAbs <= 14) score += 10;
  
  // Priority 4: At least one ranked team
  if (awayRank || homeRank) {
    score += 50;
  }
  
  return score;
}

function generateLookingAheadHTML(games, week) {
  const gameCards = games.map((game, index) => {
    const awayTeam = getTeamInfo(game.awayTeam);
    const homeTeam = getTeamInfo(game.homeTeam);
    const awayColor = getTeamColor(game.awayTeam);
    const homeColor = getTeamColor(game.homeTeam);
    
    // Use the home team's color for the card background
    const cardColor = homeColor || '#6B7280'; // fallback to gray
    
    return `
      <!-- Game ${index + 1}: ${game.awayTeam} @ ${game.homeTeam} -->
      <div class="game-card rounded-lg flex items-center px-6 shadow-lg" style="background-color: ${cardColor};">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1">
            ${game.awayRank ? `<div class="rank-badge text-white">#${game.awayRank}</div>` : ''}
            <div class="team-name text-white">${awayTeam.name.toUpperCase()}</div>
          </div>
          <div class="team-record text-white">${game.awayRecord.wins}-${game.awayRecord.losses}${game.awayRecord.ties > 0 ? `-${game.awayRecord.ties}` : ''}</div>
          <div class="conference-tag text-white">${game.awayConference || 'FBS'}</div>
        </div>
        <div class="text-center mx-4">
          <div class="text-white text-2xl font-bold mb-1">@</div>
          <div class="spread text-white">${formatSpread(game.odds.spread)}</div>
          <div class="over-under text-white">O/U ${game.odds.overUnder}</div>
        </div>
        <div class="flex-1 text-right">
          <div class="flex items-center justify-end gap-3 mb-1">
            <div class="team-name text-white">${homeTeam.name.toUpperCase()}</div>
            ${game.homeRank ? `<div class="rank-badge text-white">#${game.homeRank}</div>` : ''}
          </div>
          <div class="team-record text-white">${game.homeRecord.wins}-${game.homeRecord.losses}${game.homeRecord.ties > 0 ? `-${game.homeRecord.ties}` : ''}</div>
          <div class="conference-tag text-white">${game.homeConference || 'FBS'}</div>
        </div>
      </div>`;
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Looking Ahead - Week ${week}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .game-card {
            height: 100px;
            transition: all 0.2s ease;
            border: 2px solid transparent;
        }
        
        .game-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            border-color: #3B82F6;
        }
        
        .team-name {
            font-size: 1.5rem;
            font-weight: 800;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .team-record {
            font-size: 0.9rem;
            font-weight: 600;
            opacity: 0.9;
        }
        
        .spread {
            font-size: 1.25rem;
            font-weight: 900;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .over-under {
            font-size: 0.9rem;
            font-weight: 600;
            opacity: 0.9;
        }
        
        .rank-badge {
            font-size: 0.8rem;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .conference-tag {
            font-size: 0.7rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.15);
        }
    </style>
</head>
<body class="bg-gray-100 m-0 p-0">
    <div class="w-[1600px] h-[900px] bg-gray-100 relative overflow-hidden">
        <!-- Main Content Container -->
        <div class="p-12 h-full flex flex-col">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-6xl font-black text-gray-900 mb-2 tracking-tight">
                    LOOKING AHEAD
                </h1>
                <p class="text-2xl font-semibold text-gray-700">
                    WEEK ${week} PREVIEW • TOP MATCHUPS & BETTING LINES
                </p>
            </div>
            
            <!-- Games Grid -->
            <div class="flex-1 grid grid-cols-2 gap-6">
                ${gameCards}
            </div>
        </div>
        
        <!-- CFB Data Logo (Bottom Right) -->
        <div class="absolute bottom-6 right-6">
            <div class="text-gray-800 text-xl font-bold">
                CFB DATA
            </div>
        </div>
    </div>
</body>
</html>`;
}

function formatSpread(spread) {
  if (spread > 0) {
    return `-${spread}`;
  } else {
    return `+${Math.abs(spread)}`;
  }
}

function getTeamInfo(teamName) {
  // Try exact match first
  let team = teamHashtags.find(t => t.team === teamName);
  
  // Try partial matching
  if (!team) {
    team = teamHashtags.find(t => 
      t.team.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(t.team.toLowerCase())
    );
  }
  
  if (!team) {
    return { name: teamName, hashtag: `#${teamName.replace(/\s+/g, '')}` };
  }
  
  return {
    name: team.team,
    hashtag: team.hashtag
  };
}

function getTeamColor(teamName) {
  // Try exact match first
  let color = teamColors.find(c => c.name === teamName);
  
  // Try partial matching
  if (!color) {
    color = teamColors.find(c => 
      c.name.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(c.name.toLowerCase())
    );
  }
  
  return color ? color.primary : null;
}

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeFile(file, content) {
  fs.writeFileSync(file, content);
}

