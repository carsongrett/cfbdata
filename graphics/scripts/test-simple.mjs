console.log('🚀 Test script starting...');
console.log('Current directory:', process.cwd());

// Simple test
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('✅ Script loaded successfully');

// Try to create a simple file
try {
  const testPath = path.join(__dirname, '..', 'output', 'test-file.txt');
  fs.writeFileSync(testPath, 'Hello World!');
  console.log('✅ Test file created:', testPath);
} catch (error) {
  console.error('❌ Error creating test file:', error.message);
}

console.log('🎉 Test completed!');
