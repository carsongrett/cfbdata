# botcfb

A College Football content generation bot that creates social media posts from ESPN and CollegeFootballData APIs.

## Overview

This project automatically generates CFB social media content by:
- Fetching completed games from ESPN's API for final score analysis
- Analyzing game results for upsets, blowouts, nailbiters, etc.
- Extracting top performer statistics
- Fetching weekly poll data from CollegeFootballData (CFBD) API
- Generating poll rankings and movers posts
- Fetching betting lines data from CFBD API for game previews
- Generating betting preview posts with spreads, moneylines, and over/under
- Generating curated posts with appropriate hashtags and conference tags
- Maintaining a web interface for content review and copying

## Architecture

### Scripts
- `scripts/generate_cfb_posts.mjs` - Generates final score posts and weekly poll posts
- `scripts/generate_betting_previews.mjs` - Generates betting preview posts for upcoming games
- `scripts/cache_betting_lines.mjs` - Fetches and caches betting lines data from CFBD API
- Future scripts can be added for different post types (halftime updates, etc.)

### Workflows
- `.github/workflows/generate-cfb.yml` - Runs all content generation scripts (final scores + polls + betting previews)
- Additional workflows can be added for other post types

### Data Flow
1. Scripts fetch data from APIs (ESPN, CollegeFootballData, etc.)
2. Process and analyze the data
3. Generate social media posts with metadata
4. Write to `public/cfb_queue.json` with different `kind` values
5. Cache poll data in `public/poll_cache.json` for week-over-week comparisons
6. Cache betting lines data in `public/betting_lines_cache.json` to reduce API calls
7. Track posted content in `posted_ids.json` to prevent duplicates
8. Web interface displays posts by category with copy functionality

## Post Types

Currently supports:
- **Final Scores** (`kind: "final"`) - Completed game results with analysis
- **Poll Top 10** (`kind: "poll_top10"`) - Weekly AP Top 10, Coaches Poll Top 10, and SP+ Power Rankings
- **Poll Movers** (`kind: "poll_movers"`) - Teams that moved 3+ spots in polls/rankings
- **Betting Previews** (`kind: "betting_preview"`) - Upcoming game betting analysis with spreads, moneylines, and over/under

Planned expansion:
- **Halftime Updates** (`kind: "halftime"`) - Live game score updates
- **Recruiting News** (`kind: "recruiting"`) - Recruiting updates
- **Transfer Portal** (`kind: "transfers"`) - Transfer news

## Graphics Generation

The project includes a comprehensive graphics system that generates social media-ready images:

### Graphics Types
- **Team Leaders Graphics** - Top performing teams in statistical categories (rushing, passing, defense, etc.)
- **Player Leaders Graphics** - Top performing individual players across various stats
- **Undefeated/Winless Teams Graphics** - Power 5 teams that are undefeated or winless with team logos

### Graphics Features
- **Real Team Logos** - Uses actual team logo images from assets folder
- **Dynamic Layouts** - Automatically adjusts grid and logo sizes based on content count
- **Live Data Integration** - Pulls real-time data from CFBD API
- **Power 5 Filtering** - Undefeated/winless graphics focus on major conferences only
- **Social Media Optimized** - 960x960 square format perfect for X/Twitter

### Graphics Workflow
- **Automated Generation** - Runs via GitHub Actions on scheduled basis
- **Manual Generation** - Can be run locally via `graphics/scripts/` directory
- **Output Files** - Generates PNG files ready for social media posting
- **Asset Management** - Team logos and colors stored in `graphics/assets/` directory

See `graphics/README.md` for detailed graphics documentation and usage instructions.

## File Structure

```
├── index.html                 # Web interface with tabs for different post types
├── posted_ids.json           # Tracks posted content to prevent duplicates
├── public/
│   ├── cfb_queue.json        # Generated posts queue (all types)
│   ├── poll_cache.json       # Cached poll data for week-over-week comparisons
│   ├── betting_lines_cache.json # Cached betting lines data from CFBD API
│   └── team_hashtags.json    # Team hashtag mappings for social media posts
├── scripts/
│   ├── generate_cfb_posts.mjs # Content generation script (final scores + polls)
│   ├── generate_betting_previews.mjs # Betting preview generation script
│   └── cache_betting_lines.mjs # Betting lines caching script
└── .github/workflows/
    └── generate-cfb.yml      # Workflow to run all content generation
```

## Installation & Setup

### Prerequisites
- Node.js 20 or higher
- Git (for GitHub Actions)

### Environment Variables
Set the following environment variable:
- `CFBD_API_KEY`: Your CollegeFootballData API key (get one at [collegefootballdata.com](https://collegefootballdata.com))

### Local Setup
1. Clone the repository
2. Install dependencies (if any are added in the future)
3. Set your `CFBD_API_KEY` environment variable
4. Run the generation script

## Usage

### Manual Generation
Run the scripts locally:
```bash
# Generate all content (final scores + polls + betting previews)
node scripts/generate_cfb_posts.mjs
node scripts/generate_betting_previews.mjs

# Or cache betting lines first (if needed)
node scripts/cache_betting_lines.mjs
```

### Automated Generation
The GitHub Action workflow can be triggered manually from the Actions tab. It includes an optional input to reset `posted_ids.json` for re-testing the same games.

### Web Interface
Open `index.html` in a browser to view, filter, and copy generated posts. The interface includes separate tabs for "Final Scores", "Polls", and "Betting Previews" content.

## Betting Previews Feature

The bot generates betting preview posts for upcoming conference games, providing comprehensive betting analysis and odds information.

### Betting Preview Posts
- **Format**: `Week X #CONFERENCE Preview\nTeam A (spread) @ Team B (moneyline). O/U: X.X\n#HashtagA #HashtagB`
- **Data Source**: CollegeFootballData (CFBD) API for betting lines
- **Caching**: Betting lines are cached in `public/betting_lines_cache.json` to reduce API calls
- **Team Matching**: Intelligent team name matching from API short names to full team names in `team_hashtags.json`

### Betting Data Included
- **Point Spreads**: Favorites show negative spreads (e.g., `(-7)`)
- **Moneylines**: Underdogs show positive moneylines (e.g., `(+160)`)
- **Over/Under**: Total points line (e.g., `O/U: 46.5`)
- **Conference Tags**: Automatic conference hashtags in titles (e.g., `#SEC`, `#BIG10`)

### Team Matching Logic
The system uses a three-tiered approach to match API team names to full team names:
1. **Exact Match**: Direct string comparison
2. **Starts-With Match**: API name matches beginning of full name (e.g., "Tennessee" → "Tennessee Volunteers")
3. **Contains Match**: Fallback for complex cases (e.g., "Ohio State" → "Ohio State Buckeyes")

### Conference Mapping
Automatic conference hashtag generation:
- SEC → #SEC
- Big Ten → #BIG10
- Big 12 → #BIG12
- ACC → #ACC
- Pac-12 → #PAC12
- American Athletic → #AAC
- Mountain West → #MWC
- Sun Belt → #SUNBELT
- Conference USA → #CUSA
- Mid-American → #MAC

### Caching Strategy
- Betting lines are fetched and cached to minimize API calls
- Cache includes game details, odds, and team information
- Scripts check cache before making new API requests
- Cache is updated when new data is available

## Polls Feature

The bot generates two types of poll-related posts each week for multiple ranking systems:

### AP Poll Posts
- **AP Top 10**: Clean ranking of the Top 10 teams with hashtags (#APTop25 #CFB)
- **AP Movers**: Teams that moved 3+ spots, shows arrows and rank changes

### Coaches Poll Posts  
- **Coaches Top 10**: Top 10 teams from Coaches Poll with hashtags (#CoachesPoll #CFB)
- **Coaches Movers**: Teams that moved 3+ spots in Coaches Poll

### SP+ Power Rankings Posts
- **SP+ Top 10**: Top 10 teams with SP+ ratings (e.g., "1. Oregon (26.7)") and hashtags (#SPPlus #CFB)
- **SP+ Movers**: Teams that moved 3+ spots in SP+ rankings

### Movers Post Format
- Highlights teams that moved up or down by 3+ spots compared to previous week
- Shows arrows (⬆️⬇️) with movement size and rank changes
- Includes new teams entering the Top 25
- Capped at 9 total teams for readability
- Format: `⬆️+7 Tennessee (22→15)` or `⬇️-4 Clemson (8→12)`

### Caching Strategy
- Poll data is cached in `public/poll_cache.json` to minimize API calls
- Stores multiple weeks of data for each ranking system (AP, Coaches, SP+)
- Structure: `{ apPolls: {}, coachesPolls: {}, spRatings: {} }`
- Automatically detects when new poll data is available
- Falls back to cached data if API calls fail

### API Configuration
- Uses CollegeFootballData (CFBD) API for all poll/ranking data
- Requires API key set as `CFBD_API_KEY` environment variable
- Fetches current week and previous week data for comparison
- Handles different data structures for polls vs. ratings (SP+)

## Adding New Post Types

To add a new type of posts (e.g., halftime updates):

1. **Create new script**: `scripts/generate_halftime_posts.mjs`
   - Follow the same pattern as existing scripts
   - Use appropriate API endpoints and logic
   - Write to same `public/cfb_queue.json` with different `kind` value
   - Include proper team matching and hashtag generation

2. **Update main workflow**: Add the new script to `.github/workflows/generate-cfb.yml`
   - Add the script to the workflow steps
   - Set appropriate schedule and conditions

3. **Update web interface**: Add new tab to `index.html` for the new post type

4. **Update documentation**: Add the new post type to this README

## Configuration

### Environment Variables
- `CFBD_API_KEY`: CollegeFootballData API key for poll/ranking data (required)

### Script Configuration
- `LOOKBACK_DAYS`: How many days back to fetch games (default: 5)
- `BASE`: ESPN API endpoint for scoreboard data
- `CFBD_BASE`: CollegeFootballData API endpoint
- Priority scoring: Betting Previews (90), Upsets (90), Blowouts (70), Regular games (60), Polls (80-85)
- Betting previews: Conference games only, includes spreads, moneylines, and over/under

## Available Polls/Rankings

The bot currently supports:
- **AP Top 25** - Traditional media poll
- **Coaches Poll** - Coaches' rankings
- **SP+ Ratings** - Bill Connelly's advanced metric (power rankings)

Future additions could include:
- **FPI Rankings** - ESPN's Football Power Index
- **CFP Rankings** - College Football Playoff committee rankings
- **Other advanced metrics** - Various analytical ranking systems#   U p d a t e d   0 9 / 1 4 / 2 0 2 5   2 1 : 5 8 : 2 8 
 
 