#!/usr/bin/env node
/**
 * Test script for V17.0 command processing
 * Simulates AI Dungeon environment to verify slash commands work correctly
 */

const fs = require('fs');
const path = require('path');

// Read script files
const libraryCode = fs.readFileSync(path.join(__dirname, 'Scripts/Library.txt'), 'utf8');
const inputCode = fs.readFileSync(path.join(__dirname, 'Scripts/Input.txt'), 'utf8');

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
        // In AI Dungeon, Library executes first and LC is available in the same scope
        const lcRef = global.LC;
        
        // Execute Input.txt modifier - wrap in function to provide LC in scope
        const inputModifier = new Function('text', 'LC', inputCode + '; return modifier(text);');
        const result = inputModifier(text, lcRef);
        return result;
    } catch (e) {
        console.error('Input execution error:', e);
        return { text: text };
    }
}

/**
 * Test suite
 */
function runTests() {
    console.log('=== V17.0 Command Processing Tests ===\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: /ping command
    console.log('Test 1: /ping command');
    const pingResult = executeInput('/ping');
    if (pingResult.stop === true && pingResult.text.includes('SYS') && pingResult.text.includes('pong')) {
        console.log('✓ PASS: /ping returns formatted system output with stop=true');
        console.log('  Output:', JSON.stringify(pingResult.text));
        passed++;
    } else {
        console.log('✗ FAIL: /ping did not return expected output');
        console.log('  Expected: { text: "⟦SYS⟧ pong\\n", stop: true }');
        console.log('  Got:', pingResult);
        failed++;
    }
    console.log();
    
    // Test 2: /debug command
    console.log('Test 2: /debug command');
    const debugResult = executeInput('/debug');
    if (debugResult.stop === true && debugResult.text.includes('SYS') && debugResult.text.includes('Lincoln v17')) {
        console.log('✓ PASS: /debug returns formatted system output with stop=true');
        console.log('  Output:', JSON.stringify(debugResult.text));
        passed++;
    } else {
        console.log('✗ FAIL: /debug did not return expected output');
        console.log('  Got:', debugResult);
        failed++;
    }
    console.log();
    
    // Test 3: /turn command
    console.log('Test 3: /turn command');
    const turnResult = executeInput('/turn');
    if (turnResult.stop === true && turnResult.text.includes('SYS') && turnResult.text.includes('turn')) {
        console.log('✓ PASS: /turn returns formatted system output with stop=true');
        console.log('  Output:', JSON.stringify(turnResult.text));
        passed++;
    } else {
        console.log('✗ FAIL: /turn did not return expected output');
        console.log('  Got:', turnResult);
        failed++;
    }
    console.log();
    
    // Test 4: Non-command input (should pass through)
    console.log('Test 4: Non-command input');
    const normalResult = executeInput('I look around');
    if (!normalResult.stop && normalResult.text === 'I look around') {
        console.log('✓ PASS: Normal input passes through without stop flag');
        passed++;
    } else {
        console.log('✗ FAIL: Normal input was modified incorrectly');
        console.log('  Expected: { text: "I look around" }');
        console.log('  Got:', normalResult);
        failed++;
    }
    console.log();
    
    // Test 5: Unknown command (should pass through)
    console.log('Test 5: Unknown command');
    const unknownResult = executeInput('/unknown');
    if (!unknownResult.stop && unknownResult.text === '/unknown') {
        console.log('✓ PASS: Unknown command passes through');
        passed++;
    } else {
        console.log('✗ FAIL: Unknown command was handled incorrectly');
        console.log('  Expected: { text: "/unknown" }');
        console.log('  Got:', unknownResult);
        failed++;
    }
    console.log();
    
    // Test 6: Command output is never empty
    console.log('Test 6: Command output is never empty');
    const pingResult2 = executeInput('/ping');
    if (pingResult2.text && pingResult2.text.length > 0 && pingResult2.text !== '') {
        console.log('✓ PASS: Command output is never empty string');
        passed++;
    } else {
        console.log('✗ FAIL: Command returned empty string');
        console.log('  Got:', pingResult2);
        failed++;
    }
    console.log();
    
    // Test 7: Command output ends with newline
    console.log('Test 7: Command output ends with newline');
    const pingResult3 = executeInput('/ping');
    if (pingResult3.text && pingResult3.text.charAt(pingResult3.text.length - 1) === '\n') {
        console.log('✓ PASS: Command output ends with newline');
        passed++;
    } else {
        console.log('✗ FAIL: Command output does not end with newline');
        console.log('  Got:', JSON.stringify(pingResult3.text));
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
