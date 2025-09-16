# Automation Schedule

This document outlines the automated schedules for all GitHub Actions workflows in the CFB bot project.

## Workflow Schedules

### 📊 **Graphics Update**
**File:** `.github/workflows/graphics-update.yml`
- **Friday 10:00 PM CST** (4:00 AM UTC Saturday)
- **Saturday 3:00 PM CST** (9:00 PM UTC Saturday)
- **Saturday 11:00 PM CST** (5:00 AM UTC Sunday)

**Purpose:** Generates team and player graphics, updates statistics

---

### 🎯 **Betting Previews**
**File:** `.github/workflows/generate-betting-previews.yml`
- **Monday 12:00 PM CST** (6:00 PM UTC)
- **Thursday 12:00 PM CST** (6:00 PM UTC)

**Purpose:** Generates betting preview posts for upcoming games
**Clearing:** Automatically clears existing betting preview posts before generating new ones

---

### 🏈 **Final Scores**
**File:** `.github/workflows/generate-final-scores.yml`
- **Thursday 9:00 PM CST** (3:00 AM UTC Friday)
- **Friday 8:00 PM CST** (2:00 AM UTC Saturday)
- **Friday 10:30 PM CST** (4:30 AM UTC Saturday)
- **Saturday 2:00 PM CST** (8:00 PM UTC Saturday)
- **Saturday 3:30 PM CST** (9:30 PM UTC Saturday)
- **Saturday 5:00 PM CST** (11:00 PM UTC Saturday)
- **Saturday 7:30 PM CST** (1:30 AM UTC Sunday)
- **Saturday 9:30 PM CST** (3:30 AM UTC Sunday)
- **Saturday 11:30 PM CST** (5:30 AM UTC Sunday)

**Purpose:** Generates final score posts for completed games
**Clearing:** Separate clearing workflow handles this

---

### 🧹 **Final Scores Clearing**
**File:** `.github/workflows/clear-final-scores.yml`
- **Friday 11:00 AM CST** (5:00 PM UTC)
- **Saturday 11:00 AM CST** (5:00 PM UTC)
- **Sunday 11:00 AM CST** (5:00 PM UTC)

**Purpose:** Clears existing final scores posts before weekend generation

---

### 📈 **Polls**
**File:** `.github/workflows/generate-polls.yml`
- **Sunday 12:15 PM CST** (6:15 PM UTC)
- **Sunday 2:30 PM CST** (8:30 PM UTC)
- **Sunday 5:00 PM CST** (11:00 PM UTC)

**Purpose:** Generates poll posts (AP Top 10, Coaches Poll, SP+ Rankings)
**Clearing:** Automatically clears existing poll posts on the first run (12:15 PM CST)

---

## Manual-Only Workflows

The following workflows are **manual-only** (no automation schedule):

- **`clear-old-content.yml`** - Clears all content (emergency use)
- **`debug-api.yml`** - Debug API responses
- **`generate-cfb.yml`** - Generates all content types at once

## Note on Workflow Triggers

All automated workflows above also include manual override capability (`workflow_dispatch`), meaning you can trigger them manually from the GitHub Actions tab if needed, even though they run automatically on their schedules.

## Time Zone Notes

- **CST (Central Standard Time)**: UTC-6
- **CDT (Central Daylight Time)**: UTC-5
- All schedules include fallback times for both CST and CDT to handle daylight saving transitions
- GitHub Actions uses UTC internally, but schedules are displayed in CST for clarity

## Concurrency Control

All automated workflows include concurrency controls to prevent overlapping runs and ensure data integrity.

---

*Last updated: $(date +%Y-%m-%d)*
