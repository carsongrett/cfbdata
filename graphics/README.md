# CFB Graphics Generator

Automated graphic generator for College Football content that creates 1600x900 PNG images optimized for social media posting.

## Overview

This tool generates clean, modern graphics featuring:
- 5 vertical team bars with official team colors
- Large, bold white text for team names
- Optional record/ranking subtext
- Text-based team logos (upgradeable to images)
- Professional typography and spacing

## Quick Start

1. **Generate a graphic:**
   ```bash
   node scripts/generate-graphic.mjs
   ```

2. **View the result:**
   - Open `output/power-rankings.html` in your browser
   - The graphic is 1600x900 pixels, perfect for X/Twitter

## Project Structure

```
graphics/
├── data/
│   ├── team_colors.json      # Team color mappings
│   └── sample-rankings.json  # Sample data for testing
├── templates/
│   └── power-rankings.html   # Base HTML template
├── scripts/
│   └── generate-graphic.mjs  # Main generation script
├── output/
│   └── power-rankings.html   # Generated HTML file
└── package.json              # Dependencies
```

## Data Format

The generator expects JSON data in this format:

```json
{
  "title": "COLLEGE FOOTBALL POWER RANKINGS",
  "subtitle": "VIA CFB DATA", 
  "showRecords": true,
  "teams": [
    {
      "rank": 1,
      "name": "Georgia Bulldogs",
      "record": "8-0",
      "conference": "SEC"
    }
  ]
}
```

## Graphics Types

### 1. Team Leaders Graphics (`generate-cfbd-leaders.mjs`)
- **Purpose**: Shows top performing teams in various statistical categories
- **Features**: 
  - Team stats with per-game calculations (YPG)
  - Official team colors and rankings
  - Multiple stat categories (rushing, passing, defense, etc.)
- **Output**: `cfbd-{statName}-2025.png` files

### 2. Player Leaders Graphics (`generate-player-leaders.mjs`)
- **Purpose**: Shows top performing individual players
- **Features**:
  - Player stats with rankings
  - Team names and conference info
  - Multiple player categories (rushing, passing, receiving, etc.)
- **Output**: `player-{statName}-2025.png` files

### 3. Undefeated/Winless Teams Graphics (`generate-undefeated-winless-real.mjs`)
- **Purpose**: Shows Power 5 teams that are undefeated or winless
- **Features**:
  - Real team logos from assets folder
  - Dynamic grid layout based on team count
  - Smart logo sizing (250px for 2 teams, smaller for more)
  - Power 5 only filtering
  - Live data from CFBD API records endpoint
- **Output**: `undefeated-teams-real.png`, `winless-teams-real.png`

## Features

- **Team Colors**: Automatically matches team names to official colors
- **Configurable Records**: Toggle record display on/off per graphic
- **Real Team Logos**: Uses actual team logo images from assets folder
- **Dynamic Layouts**: Automatically adjusts grid and logo sizes based on content
- **Live Data Integration**: Pulls real-time data from CFBD API
- **Responsive Design**: Clean layouts optimized for social media
- **Professional Typography**: Inter font family with proper weights

## Data Sources

- **CFBD API**: Real-time team records, stats, and game data
- **Team Assets**: Logo images stored in `assets/team icons/` folder
- **Color Mappings**: Team colors defined in `data/team_colors.json`
