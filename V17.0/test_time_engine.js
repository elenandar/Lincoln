#!/usr/bin/env node
/**
 * Test script for V17.0 TimeEngine (Phase 2)
 * Tests the Hybrid Smart TimeEngine implementation
 */

const fs = require('fs');
const path = require('path');

// Read script files
const libraryCode = fs.readFileSync(path.join(__dirname, 'Scripts/Library.txt'), 'utf8');
const outputCode = fs.readFileSync(path.join(__dirname, 'Scripts/Output.txt'), 'utf8');

// Simulate AI Dungeon global state
global.state = {
    lincoln: null
};

// Simulate console for error logging
const originalConsole = console;
global.console = {
    log: function() {
        originalConsole.log.apply(originalConsole, arguments);
    }
};

/**
 * Simulate Library.txt execution (happens before each hook)
 */
function executeLibrary() {
    try {
        const libraryFunc = new Function('state', libraryCode + '; global.LC = LC; return true;');
        return libraryFunc(global.state);
    } catch (e) {
        console.error('Library execution error:', e);
        return false;
    }
}

/**
 * Simulate Output.txt execution with given text
 */
function executeOutput(text) {
    try {
        if (!executeLibrary()) {
            return { text: text };
        }
        
        const lcRef = global.LC;
        const modifiedOutputCode = outputCode.replace(/modifier\(text\);?\s*$/, 'return modifier(text);');
        const outputModifier = new Function('text', 'LC', modifiedOutputCode);
        const result = outputModifier(text, lcRef);
        return result;
    } catch (e) {
        console.error('Output execution error:', e);
        return { text: text };
    }
}

/**
 * Execute a /time command
 */
function executeTimeCommand(command) {
    executeLibrary();
    const result = global.LC.CommandsRegistry.execute('time', command.split(' ').slice(1));
    return result;
}

/**
 * Test suite
 */
function runTests() {
    console.log('=== V17.0 TimeEngine Tests ===\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Time state initialization
    console.log('Test 1: Time state initialization');
    global.state.lincoln = null;
    executeLibrary();
    global.LC.TimeEngine._ensureTimeState();
    const t = global.state.lincoln.time;
    if (t.day === 1 && t.hour === 8 && t.minute === 0 && t.mode === 'hybrid') {
        console.log('✓ PASS: Time initialized to Day 1, 8:00 AM, hybrid mode');
        console.log('  State:', t);
        passed++;
    } else {
        console.log('✗ FAIL: Time not initialized correctly');
        console.log('  Got:', t);
        failed++;
    }
    console.log();
    
    // Test 2: Time anchor detection - morning
    console.log('Test 2: Time anchor detection - "in the morning"');
    global.state.lincoln = null;
    executeOutput('You wake up in the morning, ready for a new day.');
    const morningTime = global.state.lincoln.time;
    if (morningTime.hour === 8 && morningTime.minute === 0) {
        console.log('✓ PASS: Morning anchor detected and applied');
        console.log('  Time:', global.LC.TimeEngine.formatTime());
        passed++;
    } else {
        console.log('✗ FAIL: Morning anchor not detected');
        console.log('  Time:', morningTime);
        failed++;
    }
    console.log();
    
    // Test 3: Time anchor detection - after lessons
    console.log('Test 3: Time anchor detection - "after lessons"');
    global.state.lincoln = null;
    executeOutput('After lessons, you head to the training grounds.');
    const lessonTime = global.state.lincoln.time;
    if (lessonTime.hour === 15 && lessonTime.minute === 30) {
        console.log('✓ PASS: "After lessons" anchor set time to 3:30 PM');
        console.log('  Time:', global.LC.TimeEngine.formatTime());
        passed++;
    } else {
        console.log('✗ FAIL: Lesson anchor not detected');
        console.log('  Expected: hour=15, minute=30');
        console.log('  Got:', lessonTime);
        failed++;
    }
    console.log();
    
    // Test 4: Time anchor detection - relative time
    console.log('Test 4: Time anchor detection - "2 hours later"');
    global.state.lincoln = null;
    executeLibrary();
    global.LC.TimeEngine._ensureTimeState();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('Two hours later, you finish your work.');
    const laterTime = global.state.lincoln.time;
    if (laterTime.hour === 12 && laterTime.minute === 0) {
        console.log('✓ PASS: "Two hours later" advanced time correctly');
        console.log('  Time:', global.LC.TimeEngine.formatTime());
        passed++;
    } else {
        console.log('✗ FAIL: Relative time anchor not working');
        console.log('  Expected: hour=12, minute=0');
        console.log('  Got:', laterTime);
        failed++;
    }
    console.log();
    
    // Test 5: Scene detection - combat
    console.log('Test 5: Scene detection - combat');
    global.state.lincoln = null;
    executeOutput('You fight off the attacker, dodging their punches.');
    const combatTime = global.state.lincoln.time;
    if (combatTime.currentScene === 'combat' && combatTime.minute === 1) {
        console.log('✓ PASS: Combat scene detected, 1 minute per turn applied');
        console.log('  Scene:', combatTime.currentScene);
        passed++;
    } else {
        console.log('✗ FAIL: Combat scene not detected correctly');
        console.log('  Scene:', combatTime.currentScene, 'Minute:', combatTime.minute);
        failed++;
    }
    console.log();
    
    // Test 6: Scene detection - dialogue
    console.log('Test 6: Scene detection - dialogue');
    global.state.lincoln = null;
    executeOutput('You say hello and ask how they are doing.');
    const dialogueTime = global.state.lincoln.time;
    if (dialogueTime.currentScene === 'dialogue' && dialogueTime.minute === 2) {
        console.log('✓ PASS: Dialogue scene detected, 2 minutes per turn applied');
        console.log('  Scene:', dialogueTime.currentScene);
        passed++;
    } else {
        console.log('✗ FAIL: Dialogue scene not detected correctly');
        console.log('  Scene:', dialogueTime.currentScene, 'Minute:', dialogueTime.minute);
        failed++;
    }
    console.log();
    
    // Test 7: Scene detection - travel
    console.log('Test 7: Scene detection - travel');
    global.state.lincoln = null;
    executeOutput('You walk to the park, enjoying the scenery.');
    const travelTime = global.state.lincoln.time;
    if (travelTime.currentScene === 'travel' && travelTime.minute === 15) {
        console.log('✓ PASS: Travel scene detected, 15 minutes per turn applied');
        console.log('  Scene:', travelTime.currentScene);
        passed++;
    } else {
        console.log('✗ FAIL: Travel scene not detected correctly');
        console.log('  Scene:', travelTime.currentScene, 'Minute:', travelTime.minute);
        failed++;
    }
    console.log();
    
    // Test 8: Fallback rate
    console.log('Test 8: Fallback rate (no anchors/scenes)');
    global.state.lincoln = null;
    executeOutput('The clouds drift by slowly.');
    const fallbackTime = global.state.lincoln.time;
    if (fallbackTime.minute === 15 && fallbackTime.currentScene === 'fallback') {
        console.log('✓ PASS: Fallback rate applied (15 min)');
        console.log('  Scene:', fallbackTime.currentScene);
        passed++;
    } else {
        console.log('✗ FAIL: Fallback rate not applied correctly');
        console.log('  Scene:', fallbackTime.currentScene, 'Minute:', fallbackTime.minute);
        failed++;
    }
    console.log();
    
    // Test 9: /time command
    console.log('Test 9: /time command');
    global.state.lincoln = null;
    executeLibrary();
    const timeOutput = executeTimeCommand('time');
    if (timeOutput.indexOf('Day 1') !== -1 && timeOutput.indexOf('8:00 AM') !== -1) {
        console.log('✓ PASS: /time shows current time');
        console.log('  Output:', timeOutput);
        passed++;
    } else {
        console.log('✗ FAIL: /time output incorrect');
        console.log('  Output:', timeOutput);
        failed++;
    }
    console.log();
    
    // Test 10: /time skip command
    console.log('Test 10: /time skip command');
    global.state.lincoln = null;
    executeLibrary();
    const skipOutput = executeTimeCommand('time skip 2 hours');
    const skippedTime = global.state.lincoln.time;
    if (skippedTime.hour === 10 && skippedTime.minute === 0) {
        console.log('✓ PASS: /time skip advanced time by 2 hours');
        console.log('  New time:', global.LC.TimeEngine.formatTime());
        passed++;
    } else {
        console.log('✗ FAIL: /time skip not working');
        console.log('  Expected: hour=10, minute=0');
        console.log('  Got:', skippedTime);
        failed++;
    }
    console.log();
    
    // Test 11: /time set command
    console.log('Test 11: /time set command');
    global.state.lincoln = null;
    executeLibrary();
    const setOutput = executeTimeCommand('time set 2 14 30');
    const setTime = global.state.lincoln.time;
    if (setTime.day === 2 && setTime.hour === 14 && setTime.minute === 30) {
        console.log('✓ PASS: /time set changed time to Day 2, 2:30 PM');
        console.log('  New time:', global.LC.TimeEngine.formatTime());
        passed++;
    } else {
        console.log('✗ FAIL: /time set not working');
        console.log('  Expected: day=2, hour=14, minute=30');
        console.log('  Got:', setTime);
        failed++;
    }
    console.log();
    
    // Test 12: /time mode command
    console.log('Test 12: /time mode command');
    global.state.lincoln = null;
    executeLibrary();
    const modeOutput = executeTimeCommand('time mode manual');
    const mode = global.state.lincoln.time.mode;
    if (mode === 'manual') {
        console.log('✓ PASS: /time mode changed to manual');
        console.log('  Mode:', mode);
        passed++;
    } else {
        console.log('✗ FAIL: /time mode not working');
        console.log('  Got:', mode);
        failed++;
    }
    console.log();
    
    // Test 13: Manual mode prevents auto progression
    console.log('Test 13: Manual mode prevents auto progression');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.mode = 'manual';
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('You fight and battle fiercely.');
    const manualTime = global.state.lincoln.time;
    if (manualTime.hour === 10 && manualTime.minute === 0) {
        console.log('✓ PASS: Manual mode prevents auto time progression');
        console.log('  Time unchanged:', global.LC.TimeEngine.formatTime());
        passed++;
    } else {
        console.log('✗ FAIL: Manual mode not preventing auto progression');
        console.log('  Time changed to:', manualTime);
        failed++;
    }
    console.log();
    
    // Test 14: /time stats command
    console.log('Test 14: /time stats command');
    global.state.lincoln = null;
    executeLibrary();
    executeOutput('You say hello.'); // Create some scene data
    const statsOutput = executeTimeCommand('time stats');
    if (statsOutput.indexOf('Time Statistics') !== -1 && 
        statsOutput.indexOf('Current scene: dialogue') !== -1) {
        console.log('✓ PASS: /time stats shows detailed information');
        passed++;
    } else {
        console.log('✗ FAIL: /time stats output incorrect');
        console.log('  Output:', statsOutput);
        failed++;
    }
    console.log();
    
    // Test 15: Scene drift protection
    console.log('Test 15: Scene drift protection (long scene)');
    global.state.lincoln = null;
    executeLibrary();
    // Simulate 15 turns of dialogue
    for (let i = 0; i < 15; i++) {
        executeOutput('You continue talking.');
    }
    const driftTime = global.state.lincoln.time;
    const expectedMax = 2 * 10 + 1.4 * 5; // First 10 turns at 2min, next 5 at 1.4min
    if (driftTime.sceneTurns === 15 && driftTime.sceneTimeElapsed < 30) {
        console.log('✓ PASS: Scene drift protection applied after 10+ turns');
        console.log('  Scene turns:', driftTime.sceneTurns, 'Elapsed:', driftTime.sceneTimeElapsed);
        passed++;
    } else {
        console.log('✗ FAIL: Scene drift not working');
        console.log('  Scene turns:', driftTime.sceneTurns, 'Elapsed:', driftTime.sceneTimeElapsed);
        failed++;
    }
    console.log();
    
    // Test 16: Time anchors override scene detection
    console.log('Test 16: Time anchors override scene detection');
    global.state.lincoln = null;
    executeOutput('You fight in the morning at dawn.');
    const anchorOverrideTime = global.state.lincoln.time;
    if (anchorOverrideTime.hour === 6 && anchorOverrideTime.minute === 0) {
        console.log('✓ PASS: Time anchor (dawn) overrides combat scene');
        console.log('  Time:', global.LC.TimeEngine.formatTime());
        passed++;
    } else {
        console.log('✗ FAIL: Anchor did not override scene');
        console.log('  Time:', anchorOverrideTime);
        failed++;
    }
    console.log();
    
    // Test 17: Day rollover
    console.log('Test 17: Day rollover at midnight');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.day = 1;
    global.state.lincoln.time.hour = 23;
    global.state.lincoln.time.minute = 30;
    global.LC.TimeEngine._advanceMinutes(60);
    const rolloverTime = global.state.lincoln.time;
    if (rolloverTime.day === 2 && rolloverTime.hour === 0 && rolloverTime.minute === 30) {
        console.log('✓ PASS: Day rolled over at midnight');
        console.log('  Time:', global.LC.TimeEngine.formatTime());
        passed++;
    } else {
        console.log('✗ FAIL: Day rollover not working');
        console.log('  Expected: day=2, hour=0, minute=30');
        console.log('  Got:', rolloverTime);
        failed++;
    }
    console.log();
    
    // Test 18: Scene max duration cap
    console.log('Test 18: Scene max duration cap');
    global.state.lincoln = null;
    executeLibrary();
    // Combat max is 30 min, run enough turns to exceed it
    for (let i = 0; i < 50; i++) {
        executeOutput('You fight and attack.');
    }
    const capTime = global.state.lincoln.time;
    if (capTime.sceneTimeElapsed <= 30) {
        console.log('✓ PASS: Combat scene capped at max duration (30 min)');
        console.log('  Scene time:', capTime.sceneTimeElapsed);
        passed++;
    } else {
        console.log('✗ FAIL: Scene max duration not enforced');
        console.log('  Scene time:', capTime.sceneTimeElapsed);
        failed++;
    }
    console.log();
    
    // Summary
    console.log('=== Test Summary ===');
    console.log('Passed:', passed);
    console.log('Failed:', failed);
    console.log('Total:', passed + failed);
    
    if (failed === 0) {
        console.log('\n✓ All TimeEngine tests passed!');
        process.exit(0);
    } else {
        console.log('\n✗ Some tests failed');
        process.exit(1);
    }
}

// Run tests
runTests();
