#!/usr/bin/env node
/**
 * Test script for V17.0 /time commands
 * Tests manual time control commands
 */

const fs = require('fs');
const path = require('path');

// Read script files
const libraryCode = fs.readFileSync(path.join(__dirname, 'Scripts/Library.txt'), 'utf8');
const inputCode = fs.readFileSync(path.join(__dirname, 'Scripts/Input.txt'), 'utf8');
const outputCode = fs.readFileSync(path.join(__dirname, 'Scripts/Output.txt'), 'utf8');

// Simulate AI Dungeon global state
global.state = {
    lincoln: null
};

// Simulate console
const originalConsole = console;
global.console = {
    log: function() {
        originalConsole.log.apply(originalConsole, arguments);
    }
};

/**
 * Simulate Library.txt execution
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
 * Simulate Input.txt execution
 */
function executeInput(text) {
    try {
        if (!executeLibrary()) {
            return { text: text };
        }
        
        const lcRef = global.LC;
        const modifiedInputCode = inputCode.replace(/modifier\(text\);?\s*$/, 'return modifier(text);');
        const inputModifier = new Function('text', 'LC', modifiedInputCode);
        const result = inputModifier(text, lcRef);
        return result;
    } catch (e) {
        console.error('Input execution error:', e);
        return { text: text };
    }
}

/**
 * Simulate Output.txt execution
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
 * Simulate full command flow
 */
function simulateCommand(commandText) {
    const inputResult = executeInput(commandText);
    const commandOutputStored = !!global.state.lincoln.commandOutput;
    const outputResult = executeOutput(inputResult.text);
    
    return {
        input: inputResult,
        output: outputResult,
        commandOutputStored: commandOutputStored
    };
}

/**
 * Test suite
 */
function runTests() {
    console.log('=== V17.0 Time Commands Tests ===\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: /time shows current time
    console.log('Test 1: /time shows current time');
    global.state.lincoln = null;
    const timeResult = simulateCommand('/time');
    if (timeResult.output.text.indexOf('Day 1') !== -1 && 
        timeResult.output.text.indexOf('8:00 AM') !== -1) {
        console.log('✓ PASS: /time displays current time');
        console.log('  Output:', timeResult.output.text.replace(/\n/g, ' '));
        passed++;
    } else {
        console.log('✗ FAIL: /time did not display time correctly');
        console.log('  Got:', timeResult.output.text);
        failed++;
    }
    console.log();
    
    // Test 2: /time skip 30 minutes
    console.log('Test 2: /time skip 30 minutes');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    const skipResult = simulateCommand('/time skip 30 minutes');
    if (skipResult.output.text.indexOf('8:30 AM') !== -1 || 
        skipResult.output.text.indexOf('10:30 AM') !== -1) {
        console.log('✓ PASS: /time skip 30 minutes works');
        console.log('  Output:', skipResult.output.text.replace(/\n/g, ' '));
        passed++;
    } else {
        console.log('✗ FAIL: /time skip did not work');
        console.log('  Got:', skipResult.output.text);
        console.log('  Time after:', global.state.lincoln.time.hour + ':' + global.state.lincoln.time.minute);
        failed++;
    }
    console.log();
    
    // Test 3: /time skip 2 hours
    console.log('Test 3: /time skip 2 hours');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    const skipHoursResult = simulateCommand('/time skip 2 hours');
    if (global.state.lincoln.time.hour === 12 && global.state.lincoln.time.minute === 0) {
        console.log('✓ PASS: /time skip 2 hours works');
        console.log('  Output:', skipHoursResult.output.text.replace(/\n/g, ' '));
        passed++;
    } else {
        console.log('✗ FAIL: /time skip hours did not work');
        console.log('  Expected 12:00, Got:', global.state.lincoln.time.hour + ':' + global.state.lincoln.time.minute);
        failed++;
    }
    console.log();
    
    // Test 4: /time set 2 14 30
    console.log('Test 4: /time set 2 14 30');
    global.state.lincoln = null;
    executeLibrary();
    const setResult = simulateCommand('/time set 2 14 30');
    if (global.state.lincoln.time.day === 2 && 
        global.state.lincoln.time.hour === 14 && 
        global.state.lincoln.time.minute === 30) {
        console.log('✓ PASS: /time set works');
        console.log('  Output:', setResult.output.text.replace(/\n/g, ' '));
        passed++;
    } else {
        console.log('✗ FAIL: /time set did not work');
        console.log('  Expected Day 2, 14:30, Got: Day', global.state.lincoln.time.day + ',', global.state.lincoln.time.hour + ':' + global.state.lincoln.time.minute);
        failed++;
    }
    console.log();
    
    // Test 5: /time mode manual
    console.log('Test 5: /time mode manual');
    global.state.lincoln = null;
    const modeResult = simulateCommand('/time mode manual');
    if (global.state.lincoln.time.mode === 'manual') {
        console.log('✓ PASS: /time mode manual works');
        console.log('  Output:', modeResult.output.text.replace(/\n/g, ' '));
        passed++;
    } else {
        console.log('✗ FAIL: /time mode did not work');
        console.log('  Expected mode: manual, Got:', global.state.lincoln.time.mode);
        failed++;
    }
    console.log();
    
    // Test 6: /time mode auto
    console.log('Test 6: /time mode auto');
    global.state.lincoln = null;
    const modeAutoResult = simulateCommand('/time mode auto');
    if (global.state.lincoln.time.mode === 'auto') {
        console.log('✓ PASS: /time mode auto works');
        passed++;
    } else {
        console.log('✗ FAIL: /time mode auto did not work');
        console.log('  Expected mode: auto, Got:', global.state.lincoln.time.mode);
        failed++;
    }
    console.log();
    
    // Test 7: /time mode hybrid (default)
    console.log('Test 7: /time mode hybrid');
    global.state.lincoln = null;
    const modeHybridResult = simulateCommand('/time mode hybrid');
    if (global.state.lincoln.time.mode === 'hybrid') {
        console.log('✓ PASS: /time mode hybrid works');
        passed++;
    } else {
        console.log('✗ FAIL: /time mode hybrid did not work');
        console.log('  Expected mode: hybrid, Got:', global.state.lincoln.time.mode);
        failed++;
    }
    console.log();
    
    // Test 8: /time stats
    console.log('Test 8: /time stats');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.totalMinutesPassed = 125;
    const statsResult = simulateCommand('/time stats');
    if (statsResult.output.text.indexOf('Time Stats') !== -1 &&
        statsResult.output.text.indexOf('Mode:') !== -1 &&
        statsResult.output.text.indexOf('Current scene:') !== -1 &&
        statsResult.output.text.indexOf('Total minutes passed: 125') !== -1) {
        console.log('✓ PASS: /time stats shows statistics');
        passed++;
    } else {
        console.log('✗ FAIL: /time stats did not work');
        console.log('  Got:', statsResult.output.text);
        failed++;
    }
    console.log();
    
    // Test 9: Manual mode prevents automatic time progression
    console.log('Test 9: Manual mode prevents automatic time progression');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.mode = 'manual';
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('You walk around the city.'); // Would normally add 15 min for travel
    if (global.state.lincoln.time.hour === 10 && global.state.lincoln.time.minute === 0) {
        console.log('✓ PASS: Manual mode prevents automatic time progression');
        passed++;
    } else {
        console.log('✗ FAIL: Manual mode did not prevent time progression');
        console.log('  Expected 10:00, Got:', global.state.lincoln.time.hour + ':' + global.state.lincoln.time.minute);
        failed++;
    }
    console.log();
    
    // Test 10: /time help shows available subcommands
    console.log('Test 10: /time without args shows current time');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.day = 3;
    global.state.lincoln.time.hour = 16;
    global.state.lincoln.time.minute = 45;
    const noArgsResult = simulateCommand('/time');
    if (noArgsResult.output.text.indexOf('Day 3') !== -1 && 
        noArgsResult.output.text.indexOf('4:45 PM') !== -1) {
        console.log('✓ PASS: /time without args shows current time');
        console.log('  Output:', noArgsResult.output.text.replace(/\n/g, ' '));
        passed++;
    } else {
        console.log('✗ FAIL: /time without args did not show time');
        console.log('  Got:', noArgsResult.output.text);
        failed++;
    }
    console.log();
    
    // Summary
    console.log('=== Test Summary ===');
    console.log('Passed:', passed);
    console.log('Failed:', failed);
    console.log('Total:', passed + failed);
    
    if (failed === 0) {
        console.log('\n✓ All time command tests passed!');
        return true;
    } else {
        console.log('\n✗ Some time command tests failed');
        return false;
    }
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
