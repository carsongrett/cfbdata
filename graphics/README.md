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

## Features

- **Team Colors**: Automatically matches team names to official colors
- **Configurable Records**: Toggle record display on/off per graphic
- **Text Logos**: Generates team logos from team name initials
- **Responsive Design**: Clean layout optimized for 1600x900
- **Professional Typography**: Inter font family with proper weights

## Next Steps

- Phase 2: Add Playwright for PNG generation
- Phase 3: Integrate with existing CFB data pipeline
- Future: Add real team logo images
