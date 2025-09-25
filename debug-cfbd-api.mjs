#!/usr/bin/env node

import fetch from 'node-fetch';

// Configuration
const CFBD_BASE = 'https://api.collegefootballdata.com';
const API_KEY = process.env.CFBD_API_KEY || 'AYkI+Yu/PHFp5lbWxTjrAjN0q4DFidrdJgSoiGvPXve807qSdw0BJ6c08Vf0kFcN';

console.log('🔍 CFBD API Debug Tool');
console.log('====================');
console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`API Key Length: ${API_KEY.length}`);
console.log('');

// Function to make API request with detailed logging
async function testEndpoint(endpoint, description) {
  console.log(`📡 Testing: ${description}`);
  console.log(`   Endpoint: ${endpoint}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${CFBD_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Duration: ${duration}ms`);
    
    // Log response headers
    console.log(`   Headers:`);
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('limit') || key.toLowerCase().includes('quota')) {
        console.log(`     ${key}: ${value}`);
      }
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success - ${Array.isArray(data) ? data.length : 'Object'} items returned`);
      
      // Show sample data
      if (Array.isArray(data) && data.length > 0) {
        console.log(`   Sample: ${JSON.stringify(data[0]).substring(0, 100)}...`);
      } else if (typeof data === 'object') {
        console.log(`   Sample: ${JSON.stringify(data).substring(0, 100)}...`);
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`   💥 Exception: ${error.message}`);
  }
  
  console.log('');
}

// Function to test rate limiting
async function testRateLimiting() {
  console.log('⏱️ Rate Limiting Test');
  console.log('====================');
  
  const endpoints = [
    '/teams?year=2025',
    '/teams?year=2025',
    '/teams?year=2025'
  ];
  
  for (let i = 0; i < endpoints.length; i++) {
    console.log(`Request ${i + 1}/3:`);
    await testEndpoint(endpoints[i], `Rapid request ${i + 1}`);
    
    if (i < endpoints.length - 1) {
      console.log('   ⏳ Waiting 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Function to test with delays
async function testWithDelays() {
  console.log('⏳ Delayed Requests Test');
  console.log('========================');
  
  const endpoints = [
    { path: '/stats/season?year=2025', desc: 'Season Stats' },
    { path: '/records?year=2025', desc: 'Team Records' },
    { path: '/teams?year=2025', desc: 'Teams Data' }
  ];
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`Request ${i + 1}/${endpoints.length}:`);
    await testEndpoint(endpoint.path, endpoint.desc);
    
    if (i < endpoints.length - 1) {
      console.log('   ⏳ Waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Main function
async function main() {
  try {
    // Test 1: Basic connectivity
    console.log('🌐 Basic Connectivity Test');
    console.log('==========================');
    await testEndpoint('/teams?year=2025', 'Basic teams endpoint');
    
    // Test 2: Rate limiting
    await testRateLimiting();
    
    // Test 3: Specific failing endpoints
    console.log('🎯 Specific Endpoints Test');
    console.log('==========================');
    await testEndpoint('/stats/season?year=2025', 'Season Stats (failing endpoint)');
    await testEndpoint('/records?year=2025', 'Team Records (failing endpoint)');
    
    // Test 4: With delays
    await testWithDelays();
    
    // Test 5: Check API root
    console.log('🔍 API Root Test');
    console.log('================');
    await testEndpoint('/', 'API Root');
    
    console.log('✅ Debug test completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- If you see 429 errors, the API key has hit rate limits');
    console.log('- If you see 401 errors, the API key is invalid');
    console.log('- If you see 403 errors, the API key lacks permissions');
    console.log('- If all tests pass, the issue might be in the graphics scripts');
    
  } catch (error) {
    console.error('💥 Debug test failed:', error.message);
    process.exit(1);
  }
}

// Run the debug test
main();
