#!/usr/bin/env node
/**
 * Integration test for V17.0 TimeEngine
 * Tests realistic scenarios combining anchors, scenes, and commands
 */

const fs = require('fs');
const path = require('path');

// Read script files
const libraryCode = fs.readFileSync(path.join(__dirname, 'Scripts/Library.txt'), 'utf8');
const inputCode = fs.readFileSync(path.join(__dirname, 'Scripts/Input.txt'), 'utf8');
const outputCode = fs.readFileSync(path.join(__dirname, 'Scripts/Output.txt'), 'utf8');

// Simulate AI Dungeon global state
global.state = { lincoln: null };

// Simulate console
const originalConsole = console;
global.console = {
    log: function() {
        originalConsole.log.apply(originalConsole, arguments);
    }
};

function executeLibrary() {
    try {
        const libraryFunc = new Function('state', libraryCode + '; global.LC = LC; return true;');
        return libraryFunc(global.state);
    } catch (e) {
        console.error('Library execution error:', e);
        return false;
    }
}

function executeInput(text) {
    try {
        if (!executeLibrary()) return { text: text };
        const lcRef = global.LC;
        const modifiedInputCode = inputCode.replace(/modifier\(text\);?\s*$/, 'return modifier(text);');
        const inputModifier = new Function('text', 'LC', modifiedInputCode);
        return inputModifier(text, lcRef);
    } catch (e) {
        console.error('Input execution error:', e);
        return { text: text };
    }
}

function executeOutput(text) {
    try {
        if (!executeLibrary()) return { text: text };
        const lcRef = global.LC;
        const modifiedOutputCode = outputCode.replace(/modifier\(text\);?\s*$/, 'return modifier(text);');
        const outputModifier = new Function('text', 'LC', modifiedOutputCode);
        return outputModifier(text, lcRef);
    } catch (e) {
        console.error('Output execution error:', e);
        return { text: text };
    }
}

function simulateCommand(commandText) {
    const inputResult = executeInput(commandText);
    const outputResult = executeOutput(inputResult.text);
    return { input: inputResult, output: outputResult };
}

function getTimeString() {
    executeLibrary();
    return global.LC.TimeEngine.getTimeString();
}

/**
 * Integration test scenarios
 */
function runIntegrationTests() {
    console.log('=== V17.0 TimeEngine Integration Tests ===\n');
    
    let passed = 0;
    let failed = 0;
    
    // Scenario 1: School day progression
    console.log('Scenario 1: School day progression with anchors and scenes');
    console.log('-----------------------------------------------------------');
    global.state.lincoln = null;
    executeLibrary();
    
    console.log('Start:', getTimeString());
    
    // Morning classes (dialogue scene)
    executeOutput('The teacher begins the morning lesson. "Today we study history," she says.');
    console.log('After lesson starts (dialogue):', getTimeString());
    
    // Time anchor: after lessons
    executeOutput('After lessons, you head to the training grounds.');
    console.log('After lessons anchor:', getTimeString());
    var afterLessons = { hour: global.state.lincoln.time.hour, minute: global.state.lincoln.time.minute };
    
    // Training scene
    executeOutput('You practice sword drills with intense focus.');
    console.log('After training turn 1:', getTimeString());
    
    executeOutput('You continue your practice, improving your technique.');
    console.log('After training turn 2:', getTimeString());
    
    // Evening anchor
    executeOutput('As evening falls, you finish your training session.');
    console.log('Evening anchor:', getTimeString());
    var evening = { hour: global.state.lincoln.time.hour, minute: global.state.lincoln.time.minute };
    
    // Verify anchors worked
    if (afterLessons.hour === 15 && afterLessons.minute === 30 &&
        evening.hour === 18 && evening.minute === 0) {
        console.log('✓ PASS: Scenario 1 - Anchors correctly set time');
        passed++;
    } else {
        console.log('✗ FAIL: Scenario 1 - Anchors did not work correctly');
        console.log('  Expected: afterLessons=15:30, evening=18:0');
        console.log('  Got: afterLessons=' + afterLessons.hour + ':' + afterLessons.minute + ', evening=' + evening.hour + ':' + evening.minute);
        failed++;
    }
    console.log();
    
    // Scenario 2: Combat encounter with scene cap
    console.log('Scenario 2: Combat encounter with duration cap');
    console.log('-----------------------------------------------');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 14;
    global.state.lincoln.time.minute = 0;
    
    console.log('Start:', getTimeString());
    
    // Simulate extended combat (should cap at 30 minutes)
    for (var i = 0; i < 35; i++) {
        executeOutput('You strike and dodge, exchanging blows with your opponent.');
    }
    
    var afterCombat = global.state.lincoln.time;
    console.log('After 35 combat turns:', getTimeString());
    
    // Verify cap worked (should be 14:30, not 14:35)
    if (afterCombat.hour === 14 && afterCombat.minute === 30) {
        console.log('✓ PASS: Scenario 2 - Combat capped at 30 minutes');
        passed++;
    } else {
        console.log('✗ FAIL: Scenario 2 - Combat cap failed');
        console.log('  Expected 14:30, got:', afterCombat.hour + ':' + afterCombat.minute);
        failed++;
    }
    console.log();
    
    // Scenario 3: Travel and exploration
    console.log('Scenario 3: Travel and exploration scenes');
    console.log('------------------------------------------');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    
    console.log('Start:', getTimeString());
    
    executeOutput('You walk along the forest path, heading north.');
    console.log('After travel turn 1 (15 min):', getTimeString());
    
    executeOutput('You continue walking through the dense woods.');
    console.log('After travel turn 2 (15 min):', getTimeString());
    
    executeOutput('You examine the strange markings on a nearby tree.');
    console.log('After exploration (10 min):', getTimeString());
    
    var afterExploration = global.state.lincoln.time;
    
    // Travel + Travel + Exploration = 15 + 15 + 10 = 40 minutes
    if (afterExploration.hour === 10 && afterExploration.minute === 40) {
        console.log('✓ PASS: Scenario 3 - Mixed travel/exploration scenes');
        passed++;
    } else {
        console.log('✗ FAIL: Scenario 3 - Scene detection failed');
        console.log('  Expected 10:40, got:', afterExploration.hour + ':' + afterExploration.minute);
        failed++;
    }
    console.log();
    
    // Scenario 4: Manual time control
    console.log('Scenario 4: Manual time control with commands');
    console.log('----------------------------------------------');
    global.state.lincoln = null;
    
    console.log('Initial:', getTimeString());
    
    simulateCommand('/time set 5 20 15');
    console.log('After /time set 5 20 15:', getTimeString());
    
    simulateCommand('/time skip 45 minutes');
    console.log('After /time skip 45 minutes:', getTimeString());
    
    var afterManual = global.state.lincoln.time;
    
    if (afterManual.day === 5 && afterManual.hour === 21 && afterManual.minute === 0) {
        console.log('✓ PASS: Scenario 4 - Manual time control works');
        passed++;
    } else {
        console.log('✗ FAIL: Scenario 4 - Manual time control failed');
        console.log('  Expected Day 5, 21:00, got: Day', afterManual.day + ',', afterManual.hour + ':' + afterManual.minute);
        failed++;
    }
    console.log();
    
    // Scenario 5: Overnight progression
    console.log('Scenario 5: Overnight progression to next day');
    console.log('----------------------------------------------');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.day = 2;
    global.state.lincoln.time.hour = 22;
    global.state.lincoln.time.minute = 30;
    
    console.log('Start (night):', getTimeString());
    
    executeOutput('You go to sleep, exhausted from the day.');
    console.log('After rest scene (60 min):', getTimeString());
    
    executeOutput('The next morning, you wake refreshed and ready.');
    console.log('After next morning anchor:', getTimeString());
    
    var nextDay = global.state.lincoln.time;
    
    if (nextDay.day === 3 && nextDay.hour === 8 && nextDay.minute === 0) {
        console.log('✓ PASS: Scenario 5 - Next day progression works');
        passed++;
    } else {
        console.log('✗ FAIL: Scenario 5 - Next day progression failed');
        console.log('  Expected Day 3, 8:00, got: Day', nextDay.day + ',', nextDay.hour + ':' + nextDay.minute);
        failed++;
    }
    console.log();
    
    // Scenario 6: Priority testing (anchor overrides scene)
    console.log('Scenario 6: Anchor priority over scene detection');
    console.log('-------------------------------------------------');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    
    console.log('Start:', getTimeString());
    
    executeOutput('You fight fiercely. At noon, the bell rings for lunch.');
    console.log('After combat text with noon anchor:', getTimeString());
    
    var priorityTest = global.state.lincoln.time;
    
    // Should use noon anchor (12:00) not combat scene (+1 min)
    if (priorityTest.hour === 12 && priorityTest.minute === 0) {
        console.log('✓ PASS: Scenario 6 - Anchor takes priority over scene');
        passed++;
    } else {
        console.log('✗ FAIL: Scenario 6 - Priority system failed');
        console.log('  Expected 12:00 (anchor), got:', priorityTest.hour + ':' + priorityTest.minute);
        failed++;
    }
    console.log();
    
    // Scenario 7: Manual mode disables auto progression
    console.log('Scenario 7: Manual mode disables automatic progression');
    console.log('-------------------------------------------------------');
    global.state.lincoln = null;
    executeLibrary();
    simulateCommand('/time mode manual');
    global.state.lincoln.time.hour = 15;
    global.state.lincoln.time.minute = 0;
    
    console.log('Start (manual mode):', getTimeString());
    
    executeOutput('You walk for a long time through the city.');
    console.log('After travel in manual mode:', getTimeString());
    
    var manualMode = global.state.lincoln.time;
    
    // Time should NOT change in manual mode
    if (manualMode.hour === 15 && manualMode.minute === 0) {
        console.log('✓ PASS: Scenario 7 - Manual mode prevents auto progression');
        passed++;
    } else {
        console.log('✗ FAIL: Scenario 7 - Manual mode did not prevent progression');
        console.log('  Expected 15:00 (no change), got:', manualMode.hour + ':' + manualMode.minute);
        failed++;
    }
    console.log();
    
    // Summary
    console.log('=== Integration Test Summary ===');
    console.log('Passed:', passed);
    console.log('Failed:', failed);
    console.log('Total:', passed + failed);
    
    if (failed === 0) {
        console.log('\n✓ All integration tests passed!');
        return true;
    } else {
        console.log('\n✗ Some integration tests failed');
        return false;
    }
}

// Run tests
const success = runIntegrationTests();
process.exit(success ? 0 : 1);
