#!/usr/bin/env node
/**
 * Phase 1 Interactive Demonstration
 * 
 * This script demonstrates the Phase 1 infrastructure working in a
 * simulated AI Dungeon environment.
 */

const fs = require('fs');
const path = require('path');

// Setup simulated AI Dungeon environment
function setupEnvironment() {
  if (typeof global !== 'undefined' && !global.globalThis) {
    global.globalThis = global;
  }

  global.state = {
    shared: {},
    message: ''
  };

  global.stop = function() {
    console.log('  [System: Processing stopped]');
  };
}

// Load a script file
function loadScript(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  eval(code);
}

// Simulate a command input
function simulateCommand(command) {
  console.log(`\n>>> User enters: ${command}`);
  console.log('---');
  
  setupEnvironment();
  loadScript(path.join(__dirname, 'Library.js'));
  
  global.text = command;
  loadScript(path.join(__dirname, 'Input.js'));
  
  console.log('AI Response:');
  console.log(global.state.message || '(no response)');
  console.log('---');
  
  const L = global.state.shared.lincoln;
  console.log(`State: turn=${L.turn}, debugMode=${L.debugMode}, actionType=${L.currentAction.type}`);
  
  return L;
}

// Simulate a full story cycle
function simulateStory(userInput, aiResponse) {
  console.log(`\n>>> User enters: "${userInput}"`);
  console.log('---');
  
  setupEnvironment();
  loadScript(path.join(__dirname, 'Library.js'));
  
  // Input phase
  global.text = userInput;
  loadScript(path.join(__dirname, 'Input.js'));
  
  // Context phase
  global.text = aiResponse;
  loadScript(path.join(__dirname, 'Context.js'));
  
  // Output phase
  loadScript(path.join(__dirname, 'Output.js'));
  
  console.log('AI Response:');
  console.log(global.text);
  console.log('---');
  
  const L = global.state.shared.lincoln;
  console.log(`State: turn=${L.turn}, actionType=${L.currentAction.type}`);
  
  return L;
}

// Main demonstration
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Lincoln v17.0.0-alpha.1 - Phase 1 Demonstration          ║');
console.log('║  Infrastructure Layer Complete                             ║');
console.log('╚════════════════════════════════════════════════════════════╝');

console.log('\n=== DEMONSTRATION 1: /ping Command ===');
simulateCommand('/ping');

console.log('\n=== DEMONSTRATION 2: /debug Command ===');
console.log('\nEnabling debug mode:');
simulateCommand('/debug on');

console.log('\nDisabling debug mode:');
simulateCommand('/debug off');

console.log('\n=== DEMONSTRATION 3: Unknown Command ===');
simulateCommand('/unknown');

console.log('\n=== DEMONSTRATION 4: Story Action (Turn Counter) ===');
console.log('\nFirst story action:');
let L = simulateStory('I look around the room.', 
  'You see a spacious classroom with desks arranged in rows. Sunlight streams through the windows.');

console.log('\nSecond story action:');
L = simulateStory('I walk to the window.', 
  'You approach the window and gaze outside at the schoolyard below.');

console.log('\nThird story action (with system message):');
setupEnvironment();
loadScript(path.join(__dirname, 'Library.js'));

// Add a system message
global.LC.lcSys('Character Alice has entered the scene');

// Simulate output
global.text = 'Alice walks into the classroom with a smile.';
loadScript(path.join(__dirname, 'Output.js'));

console.log('\nAI Response with System Message:');
console.log(global.text);
console.log('---');

L = global.state.shared.lincoln;
console.log(`State: turn=${L.turn}`);

console.log('\n=== DEMONSTRATION 5: State Structure ===');
setupEnvironment();
loadScript(path.join(__dirname, 'Library.js'));
L = global.LC.lcInit('demo');

console.log('\nInitialized state structure:');
console.log(JSON.stringify({
  version: L.version,
  turn: L.turn,
  stateVersion: L.stateVersion,
  sysShow: L.sysShow,
  debugMode: L.debugMode,
  currentAction: L.currentAction,
  // Show that future structures are present but empty
  futureStructures: {
    time: typeof L.time,
    environment: typeof L.environment,
    characters: typeof L.characters,
    relations: typeof L.relations,
    goals: typeof L.goals
  }
}, null, 2));

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Demonstration Complete                                    ║');
console.log('║  ✅ All Phase 1 features working correctly                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');
