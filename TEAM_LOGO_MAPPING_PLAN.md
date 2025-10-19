# Team Logo Mapping Standardization Plan

## 🎯 **Objective**
Standardize and complete team logo mappings across all graphics scripts to ensure every available team logo can be displayed properly in every graphic, eliminating fallback text abbreviations like "SOU".

## 📊 **Current State Analysis**

### **Available Resources**
- **Logo Files**: 145+ team logos in `graphics/assets/team icons/`
- **Scripts with Mappings**: 9 graphics scripts with varying levels of completeness
- **Current Mappings**: 26-132 teams per script (inconsistent)

### **Identified Issues**
1. **Inconsistent Coverage**: Scripts have different numbers of team mappings (26-132)
2. **Missing Teams**: Some teams with available logos are missing from various scripts
3. **Naming Inconsistencies**: Different team name formats across scripts
4. **Maintenance Burden**: 9 separate mapping files to maintain
5. **Fallback Text**: Teams without mappings show abbreviations (e.g., "SOU" for South Florida)

## 📋 **Scripts Requiring Updates**

| Script | Current Mappings | Priority | Purpose |
|--------|------------------|----------|---------|
| `generate-cfb-data-top25.mjs` | 69 | High | CFB Data Top 25 rankings |
| `generate-ranked-matchups-real.mjs` | 68 | High | Ranked matchup graphics |
| `generate-undefeated-winless-real.mjs` | 26 | High | Undefeated/winless teams |
| `generate-player-leaders.mjs` | 70 | Medium | Player statistics graphics |
| `generate-leaders.mjs` | 82 | Medium | Team statistics graphics |
| `generate-conference-rankings.mjs` | 70 | Medium | Conference rankings |
| `generate-conference-mock-visual.mjs` | 26 | Low | Mock conference visuals |
| `generate-conference-rankings-mock.mjs` | 70 | Low | Mock conference rankings |
| `generate-looking-ahead-real.mjs` | 132 | Medium | Looking ahead graphics |

## 🚀 **Implementation Plan**

### **Phase 1: Data Collection & Analysis**
- [ ] Extract all existing team mappings from 9 scripts
- [ ] Identify unique team names and their logo file mappings
- [ ] Cross-reference with available logo files in `graphics/assets/team icons/`
- [ ] Document naming inconsistencies and variations
- [ ] Create comprehensive team name standardization rules

### **Phase 2: Master Mapping Creation**
- [ ] Create `graphics/scripts/team-logo-mappings.mjs`
- [ ] Include all teams with available logos (140+ teams)
- [ ] Use consistent naming convention
- [ ] Add JSDoc documentation for each mapping
- [ ] Include utility functions for team name normalization

### **Phase 3: High-Priority Script Updates**
- [ ] Update `generate-cfb-data-top25.mjs`
- [ ] Update `generate-ranked-matchups-real.mjs`
- [ ] Update `generate-undefeated-winless-real.mjs`
- [ ] Test all three scripts with sample data
- [ ] Verify no missing logos or fallback text

### **Phase 4: Medium-Priority Script Updates**
- [ ] Update `generate-player-leaders.mjs`
- [ ] Update `generate-leaders.mjs`
- [ ] Update `generate-conference-rankings.mjs`
- [ ] Update `generate-looking-ahead-real.mjs`
- [ ] Test all updated scripts

### **Phase 5: Low-Priority Script Updates**
- [ ] Update `generate-conference-mock-visual.mjs`
- [ ] Update `generate-conference-rankings-mock.mjs`
- [ ] Final testing and validation

### **Phase 6: Validation & Documentation**
- [ ] Comprehensive testing of all scripts
- [ ] Verify all available logos are accessible
- [ ] Document any remaining teams without logos
- [ ] Update main README with new structure
- [ ] Create maintenance guidelines

## 🏗️ **Technical Implementation**

### **Master Mapping File Structure**
```javascript
// graphics/scripts/team-logo-mappings.mjs

/**
 * Complete team logo mappings for all graphics scripts
 * Maps team names to their corresponding logo files
 */

export const TEAM_LOGO_MAPPINGS = {
  // Power 5 Teams
  'Alabama': 'Alabama_Crimson_Tide_logo-300x300.png',
  'Auburn': 'Auburn_Tigers_logo-300x300.png',
  'Georgia': 'Georgia_Bulldogs_logo-300x300.png',
  // ... 140+ more teams
  
  // Group of 5 Teams
  'Appalachian State': 'Appalachian_State_Mountaineers_logo-300x300.png',
  'Boise State': 'Boise_State_Broncos_Logo-300x300.png',
  // ... more teams
  
  // Independent Teams
  'Notre Dame': 'Notre_Dame_Fighting_Irish_logo-300x300.png',
  'Army': 'Army_West_Point_Black_Knights_logo-300x300.png',
  // ... more teams
};

/**
 * Get team logo path for a given team name
 * @param {string} teamName - The team name to look up
 * @returns {string|null} - The logo file path or null if not found
 */
export function getTeamLogoPath(teamName) {
  return TEAM_LOGO_MAPPINGS[teamName] || null;
}

/**
 * Get all available team names
 * @returns {string[]} - Array of all team names with logos
 */
export function getAllTeamNames() {
  return Object.keys(TEAM_LOGO_MAPPINGS);
}
```

### **Script Update Pattern**
```javascript
// Before (individual mapping in each script)
function getTeamLogoPath(teamName) {
  const teamMappings = {
    'Georgia': 'Georgia_Bulldogs_logo-300x300.png',
    // ... 50-100 more teams
  };
  return teamMappings[teamName] || null;
}

// After (import from shared file)
import { getTeamLogoPath } from './team-logo-mappings.mjs';

// Function call remains the same
const logoPath = getTeamLogoPath(teamName);
```

## 📈 **Expected Outcomes**

### **Before Implementation**
- ❌ 9 separate mapping files with 26-132 teams each
- ❌ Inconsistent team name formats
- ❌ Missing teams in various scripts
- ❌ Fallback text abbreviations (e.g., "SOU")
- ❌ Difficult maintenance and updates

### **After Implementation**
- ✅ 1 shared mapping file with 140+ teams
- ✅ Consistent naming across all scripts
- ✅ All available logos accessible to all scripts
- ✅ No more fallback text abbreviations
- ✅ Easy maintenance and updates
- ✅ Future-proof for new scripts

## 🔧 **Maintenance Strategy**

### **Adding New Teams**
1. Add team logo file to `graphics/assets/team icons/`
2. Add mapping to `team-logo-mappings.mjs`
3. All scripts automatically have access to new team

### **Updating Team Names**
1. Update team name in `team-logo-mappings.mjs`
2. All scripts automatically use updated name

### **Adding New Scripts**
1. Import `getTeamLogoPath` from shared file
2. No need to maintain separate mapping

## 🧪 **Testing Strategy**

### **Unit Testing**
- Test `getTeamLogoPath()` function with various team names
- Verify all team names return correct logo paths
- Test fallback behavior for unknown teams

### **Integration Testing**
- Test each updated script with sample data
- Verify all teams display logos instead of text
- Test with teams that were previously missing

### **Regression Testing**
- Ensure existing functionality remains unchanged
- Verify all graphics still generate correctly
- Test with different data sets

## 📝 **Success Criteria**

- [ ] All 9 scripts use shared team logo mappings
- [ ] All 140+ available team logos are accessible
- [ ] No fallback text abbreviations in any graphics
- [ ] Consistent team naming across all scripts
- [ ] Easy maintenance and updates
- [ ] All existing functionality preserved

## 🚨 **Risk Mitigation**

### **Backup Strategy**
- Create backup of all existing scripts before changes
- Test each script individually after updates
- Maintain rollback capability

### **Incremental Implementation**
- Update scripts in phases (high → medium → low priority)
- Test thoroughly after each phase
- Address issues before proceeding to next phase

### **Validation**
- Comprehensive testing with real data
- Verify all graphics generate correctly
- Check for any missing or broken logos

---

**Created**: October 19, 2025  
**Last Updated**: October 19, 2025  
**Status**: Planning Phase - Ready for Implementation
