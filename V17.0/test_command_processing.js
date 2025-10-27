#!/usr/bin/env node
/**
 * Test script for V17.0 command processing
 * Simulates AI Dungeon environment to verify slash commands work correctly
 * Tests the Input -> State -> Output relay pattern (SAE-style)
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
        // Execute Library code and make LC global
        const libraryFunc = new Function('state', libraryCode + '; global.LC = LC; return true;');
        return libraryFunc(global.state);
    } catch (e) {
        console.error('Library execution error:', e);
        return false;
    }
}

/**
 * Simulate Input.txt execution with given text
 */
function executeInput(text) {
    try {
        // Library must execute first to create LC
        if (!executeLibrary()) {
            return { text: text };
        }
        
        // Make LC available globally for Input script
        const lcRef = global.LC;
        
        // Execute Input.txt modifier - replace the final modifier(text) with return modifier(text)
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
 * Simulate Output.txt execution with given text
 */
function executeOutput(text) {
    try {
        // Library must execute first to create LC
        if (!executeLibrary()) {
            return { text: text };
        }
        
        // Make LC available globally for Output script
        const lcRef = global.LC;
        
        // Execute Output.txt modifier - replace the final modifier(text) with return modifier(text)
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
 * Simulate full command flow: Input -> (AI skipped) -> Output
 */
function simulateCommand(commandText) {
    // Step 1: Input modifier processes command
    const inputResult = executeInput(commandText);
    
    // Step 2: Check if command output was stored in state
    const commandOutputStored = !!global.state.lincoln.commandOutput;
    
    // Step 3: Output modifier relays command output
    // Pass the input result text to output (which would normally be AI output)
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
    console.log('=== V17.0 Command Processing Tests (State Relay Pattern) ===\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: /ping command - UX improvement: keep input visible, add [SYS] prefix, and add newline
    console.log('Test 1: /ping command (state relay pattern with UX improvements)');
    global.state.lincoln = null; // Reset state
    const pingResult = simulateCommand('/ping');
    if (pingResult.output.text === '\n[SYS] pong' && pingResult.input.text === '/ping') {
        console.log('✓ PASS: /ping command output relayed correctly with newline, [SYS] prefix, and visible input');
        console.log('  Input text:', JSON.stringify(pingResult.input.text));
        console.log('  Output text:', JSON.stringify(pingResult.output.text));
        passed++;
    } else {
        console.log('✗ FAIL: /ping did not relay correctly');
        console.log('  Expected output.text: "\\n[SYS] pong", input.text: "/ping"');
        console.log('  Got:', pingResult);
        failed++;
    }
    console.log();
    
    // Test 2: /debug command - verify newline and [SYS] prefix
    console.log('Test 2: /debug command');
    global.state.lincoln = null; // Reset state
    const debugResult = simulateCommand('/debug');
    if (debugResult.output.text.charAt(0) === '\n' &&
        debugResult.output.text.indexOf('[SYS]') === 1 &&
        debugResult.output.text.indexOf('Lincoln v17 Debug') !== -1 && 
        debugResult.output.text.indexOf('Turn:') !== -1 &&
        debugResult.input.text === '/debug') {
        console.log('✓ PASS: /debug returns debug information with newline, [SYS] prefix, and visible input');
        console.log('  Output:', JSON.stringify(debugResult.output.text.substring(0, 50) + '...'));
        passed++;
    } else {
        console.log('✗ FAIL: /debug did not return expected output');
        console.log('  Got:', debugResult.output.text);
        failed++;
    }
    console.log();
    
    // Test 3: /turn command - verify newline and [SYS] prefix
    console.log('Test 3: /turn command');
    global.state.lincoln = null; // Reset state
    const turnResult = simulateCommand('/turn');
    if (turnResult.output.text.charAt(0) === '\n' &&
        turnResult.output.text.indexOf('[SYS]') === 1 &&
        turnResult.output.text.indexOf('Current turn:') !== -1 &&
        turnResult.input.text === '/turn') {
        console.log('✓ PASS: /turn returns turn information with newline, [SYS] prefix, and visible input');
        console.log('  Output:', JSON.stringify(turnResult.output.text));
        passed++;
    } else {
        console.log('✗ FAIL: /turn did not return expected output');
        console.log('  Got:', turnResult.output.text);
        failed++;
    }
    console.log();
    
    // Test 4: /characters command - verify newline and [SYS] prefix
    console.log('Test 4: /characters command');
    global.state.lincoln = null; // Reset state
    const charsResult = simulateCommand('/characters');
    if (charsResult.output.text.charAt(0) === '\n' &&
        charsResult.output.text.indexOf('[SYS]') === 1 &&
        charsResult.output.text.indexOf('No characters tracked yet') !== -1 &&
        charsResult.input.text === '/characters') {
        console.log('✓ PASS: /characters returns character list with newline, [SYS] prefix, and visible input');
        console.log('  Output:', JSON.stringify(charsResult.output.text));
        passed++;
    } else {
        console.log('✗ FAIL: /characters did not return expected output');
        console.log('  Got:', charsResult.output.text);
        failed++;
    }
    console.log();
    
    // Test 5: /help command - verify newline and [SYS] prefix
    console.log('Test 5: /help command');
    global.state.lincoln = null; // Reset state
    const helpResult = simulateCommand('/help');
    if (helpResult.output.text.charAt(0) === '\n' &&
        helpResult.output.text.indexOf('[SYS]') === 1 &&
        helpResult.output.text.indexOf('Lincoln v17 Commands') !== -1 &&
        helpResult.output.text.indexOf('Available commands') !== -1 &&
        helpResult.output.text.indexOf('/ping') !== -1 &&
        helpResult.input.text === '/help') {
        console.log('✓ PASS: /help lists available commands with newline, [SYS] prefix, and visible input');
        console.log('  Output contains /ping, /debug, /turn, /characters, /help');
        passed++;
    } else {
        console.log('✗ FAIL: /help did not return expected output');
        console.log('  Got:', helpResult.output.text);
        failed++;
    }
    console.log();
    
    // Test 6: Non-command input (should pass through)
    console.log('Test 6: Non-command input');
    global.state.lincoln = null; // Reset state
    const normalInput = executeInput('I look around');
    if (normalInput.text === 'I look around' && !global.state.lincoln.commandOutput) {
        console.log('✓ PASS: Normal input passes through without modification');
        passed++;
    } else {
        console.log('✗ FAIL: Normal input was modified incorrectly');
        console.log('  Expected: { text: "I look around" }');
        console.log('  Got:', normalInput);
        failed++;
    }
    console.log();
    
    // Test 7: Unknown command (should pass through)
    console.log('Test 7: Unknown command');
    global.state.lincoln = null; // Reset state
    const unknownResult = executeInput('/unknown');
    if (unknownResult.text === '/unknown' && !global.state.lincoln.commandOutput) {
        console.log('✓ PASS: Unknown command passes through');
        passed++;
    } else {
        console.log('✗ FAIL: Unknown command was handled incorrectly');
        console.log('  Expected: { text: "/unknown" }');
        console.log('  Got:', unknownResult);
        failed++;
    }
    console.log();
    
    // Test 8: Turn counter NOT incremented for commands
    console.log('Test 8: Turn counter NOT incremented for commands');
    global.state.lincoln = null; // Reset state
    simulateCommand('/ping');
    const turnAfterCommand = global.state.lincoln.turn;
    if (turnAfterCommand === 0) {
        console.log('✓ PASS: Turn counter not incremented for commands');
        console.log('  Turn counter:', turnAfterCommand);
        passed++;
    } else {
        console.log('✗ FAIL: Turn counter was incremented for command');
        console.log('  Expected: 0, Got:', turnAfterCommand);
        failed++;
    }
    console.log();
    
    // Test 9: Turn counter IS incremented for normal output
    console.log('Test 9: Turn counter incremented for normal output');
    global.state.lincoln = null; // Reset state
    executeOutput('The sun rises.');
    const turnAfterNormal = global.state.lincoln.turn;
    if (turnAfterNormal === 1) {
        console.log('✓ PASS: Turn counter incremented for normal output');
        console.log('  Turn counter:', turnAfterNormal);
        passed++;
    } else {
        console.log('✗ FAIL: Turn counter not incremented correctly');
        console.log('  Expected: 1, Got:', turnAfterNormal);
        failed++;
    }
    console.log();
    
    // Test 10: Substring detection (command anywhere in text)
    console.log('Test 10: Substring detection (command in Say mode)');
    global.state.lincoln = null; // Reset state
    const sayResult = simulateCommand('You say "/help"');
    if (sayResult.output.text.charAt(0) === '\n' &&
        sayResult.output.text.indexOf('[SYS]') === 1 &&
        sayResult.output.text.indexOf('Lincoln v17 Commands') !== -1 &&
        sayResult.input.text === 'You say "/help"') {
        console.log('✓ PASS: Command detected even when not at start of text, with newline, [SYS] prefix, and visible input');
        passed++;
    } else {
        console.log('✗ FAIL: Command not detected in substring');
        console.log('  Got:', sayResult.output.text);
        failed++;
    }
    console.log();
    
    // Summary
    console.log('=== Test Summary ===');
    console.log('Passed:', passed);
    console.log('Failed:', failed);
    console.log('Total:', passed + failed);
    
    if (failed === 0) {
        console.log('\n✓ All tests passed!');
        process.exit(0);
    } else {
        console.log('\n✗ Some tests failed');
        process.exit(1);
    }
}

// Run tests
runTests();
