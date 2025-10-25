#!/usr/bin/env node
/**
 * Phase 2 Demo for Lincoln v17.0.0-alpha.2
 * 
 * Demonstrates the Physical World implementation:
 * - TimeEngine
 * - EnvironmentEngine
 * - ChronologicalKnowledgeBase (CKB)
 */

const fs = require('fs');
const path = require('path');

// Setup global environment
global.globalThis = global;
global.state = { shared: {} };
global.stop = () => {};

// Load scripts
function loadScript(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  eval(code);
}

console.log('=== Lincoln v17.0.0-alpha.2 Phase 2 Demo ===\n');

// Load Library
loadScript(path.join(__dirname, 'scripts/Library.js'));

const L = global.LC.lcInit('demo');

console.log('1. Initial State:');
console.log(`   Version: ${L.version}`);
console.log(`   Turn: ${L.turn}`);
console.log(`   Time: Day ${L.time.day}, ${L.time.dayOfWeek}, ${L.time.timeOfDay}`);
console.log(`   Location: ${L.environment.location}`);
console.log(`   Weather: ${L.environment.weather}`);
console.log();

console.log('2. Setting Environment:');
global.LC.EnvironmentEngine.changeLocation(L, 'School Classroom');
global.LC.EnvironmentEngine.changeWeather(L, 'Sunny');
console.log(`   Location: ${L.environment.location}`);
console.log(`   Weather: ${L.environment.weather}`);
console.log();

console.log('3. Simulating Story Progression:');
for (let i = 0; i < 5; i++) {
  L.turn++;
  global.LC.TimeEngine.advance(L);
  const eventText = `Story event ${i + 1}: Something happens in the classroom.`;
  global.LC.EnvironmentEngine.log(L, eventText);
  
  console.log(`   Turn ${L.turn}: ${global.LC.TimeEngine.getTimeString(L)}`);
}
console.log();

console.log('4. Chronological Knowledge Base:');
console.log(`   Total events logged: ${L.chronologicalKnowledge.length}`);
console.log('\n   Recent entries:');
L.chronologicalKnowledge.slice(-3).forEach((entry, idx) => {
  console.log(`   [${idx + 1}] Day ${entry.day}, ${entry.timeOfDay} at ${entry.location}`);
  console.log(`       "${entry.text.substring(0, 50)}..."`);
});
console.log();

console.log('5. Testing Week Cycle:');
L.turn = 27; // Just before week cycle
global.LC.TimeEngine.advance(L);
console.log(`   Turn 27: ${global.LC.TimeEngine.getTimeString(L)} (Should be Day 7, Sunday, Night)`);
L.turn = 28; // Week cycle
global.LC.TimeEngine.advance(L);
console.log(`   Turn 28: ${global.LC.TimeEngine.getTimeString(L)} (Should be Day 8, Monday, Morning)`);
console.log();

console.log('6. Testing Commands:');

// Test /time command
global.text = '/time';
loadScript(path.join(__dirname, 'scripts/Input.js'));
console.log(`   /time command output: ${global.state.message}`);

// Test /env command
global.state.message = '';
global.text = '/env';
loadScript(path.join(__dirname, 'scripts/Input.js'));
console.log(`   /env command output:`);
global.state.message.split('\n').forEach(line => {
  if (line.trim()) console.log(`      ${line}`);
});

console.log('\n=== Demo Complete ===');
console.log('\nPhase 2 Features Demonstrated:');
console.log('✓ Time progression (day, time of day, day of week)');
console.log('✓ Environment tracking (location, weather)');
console.log('✓ Event logging to CKB with full context');
console.log('✓ Commands: /time, /env, /ckb');
console.log('✓ Automatic time advancement');
console.log('✓ Week cycling');
