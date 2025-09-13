#!/usr/bin/env node

import fs from 'fs';

// Configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const OUTPUT_FILE = 'data/venues_fbs.json';

// Get API key from environment
const apiKey = process.env.CFBD_API_KEY;
if (!apiKey) {
  console.error('Error: CFBD_API_KEY environment variable is required');
  process.exit(1);
}

/**
 * Fetch venues from CFBD API with retry logic
 */
async function fetchVenues() {
  const url = `${CFBD_BASE}/venues`;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Fetching venues from ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Success: Received ${data.length} venues`);
        return data;
      } else {
        console.error(`HTTP ${response.status}: ${response.statusText}`);
        if (attempt < 3) {
          const delay = attempt * 1000; // 1s, 2s delays
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt < 3) {
        const delay = attempt * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All attempts failed');
  process.exit(1);
}

/**
 * Process venue data and extract required fields
 */
function processVenues(venues) {
  const processed = [];
  let missingCoords = 0;
  let missingCapacity = 0;
  
  for (const venue of venues) {
    // Extract required fields
    const processedVenue = {
      id: venue.id || null,
      name: venue.name || null,
      city: venue.city || null,
      state: venue.state || null,
      capacity: venue.capacity || null,
      elevation: venue.elevation || null,
      surface: null, // Will be set below
      latitude: venue.latitude || null,
      longitude: venue.longitude || null,
      primaryTeam: null // Will be extracted below
    };
    
    // Normalize surface field
    if (venue.grass !== undefined) {
      processedVenue.surface = venue.grass ? 'Grass' : 'Turf';
    } else if (venue.surface) {
      processedVenue.surface = venue.surface === 'grass' ? 'Grass' : 'Turf';
    }
    
    // Extract primary team if available
    if (venue.teams && Array.isArray(venue.teams) && venue.teams.length > 0) {
      processedVenue.primaryTeam = venue.teams[0].name || venue.teams[0];
    }
    
    // Count missing data
    if (!processedVenue.latitude || !processedVenue.longitude) {
      missingCoords++;
    }
    if (!processedVenue.capacity) {
      missingCapacity++;
    }
    
    processed.push(processedVenue);
  }
  
  return { processed, missingCoords, missingCapacity };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Starting venues cache...');
    
    // Fetch venues from API
    const venues = await fetchVenues();
    
    // Process the data
    const { processed, missingCoords, missingCapacity } = processVenues(venues);
    
    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processed, null, 2));
    
    // Log results
    console.log(`\n✅ Successfully cached ${processed.length} venues to ${OUTPUT_FILE}`);
    console.log(`📊 Missing coordinates: ${missingCoords} venues`);
    console.log(`📊 Missing capacity: ${missingCapacity} venues`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
