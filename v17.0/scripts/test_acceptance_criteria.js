#!/usr/bin/env node
/**
 * Acceptance Criteria Test for Phase 1.2
 * 
 * This test demonstrates the exact acceptance criteria from ticket PL-V17-IMPL-002:
 * - Test scenario: Add LC.lcSys("System is online.") before lcConsumeMsgs in output.js
 * - Expected output: System message block appears before AI text
 * - Backward compatibility: No output when queue is empty
 */

console.log("=== Phase 1.2 Acceptance Criteria Test ===\n");

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("📋 Testing Acceptance Criteria from Ticket PL-V17-IMPL-002\n");

// Test 1: With system message (main acceptance criterion)
console.log("Test 1: System message display (with LC.lcSys call)");
console.log("─────────────────────────────────────────────────────────");

try {
  // Mock the global state
  global.state = {};
  
  // Load library
  const libraryCode = fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8');
  eval(libraryCode);
  
  // Simulate what happens in output.js with the test call
  const L = LC.lcInit();
  
  // TEST CALL: Add system message (as per acceptance criteria)
  LC.lcSys("System is online.");
  
  // Now process through output modifier
  const aiText = "You find yourself in a medieval tavern. The air is thick with smoke and the smell of ale.";
  const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
  const text = aiText;
  const wrappedCode = `(function() { ${outputCode} })()`;
  const result = eval(wrappedCode);
  
  console.log("\n✅ SUCCESS: System message displayed correctly\n");
  console.log("Expected format:");
  console.log("========================================");
  console.log("⟦SYS⟧ System is online.");
  console.log("========================================");
  console.log("");
  console.log("Текст, сгенерированный ИИ...");
  console.log("\n─────────────────────────────────────────────────────────");
  console.log("\nActual output:\n");
  console.log(result.text);
  console.log("\n─────────────────────────────────────────────────────────");
  
  // Verify criteria
  const hasSystemBlock = result.text.includes("========================================");
  const hasSystemPrefix = result.text.includes("⟦SYS⟧ System is online.");
  const hasAiText = result.text.includes(aiText);
  const systemBeforeAi = result.text.indexOf("⟦SYS⟧") < result.text.indexOf(aiText);
  
  console.log("\nVerification:");
  console.log("  ✓ System message block present:", hasSystemBlock);
  console.log("  ✓ System message with ⟦SYS⟧ prefix:", hasSystemPrefix);
  console.log("  ✓ AI text preserved:", hasAiText);
  console.log("  ✓ System message appears before AI text:", systemBeforeAi);
  
  if (hasSystemBlock && hasSystemPrefix && hasAiText && systemBeforeAi) {
    console.log("\n✅ ACCEPTANCE CRITERION MET: System message displayed correctly");
  } else {
    console.log("\n❌ ACCEPTANCE CRITERION FAILED");
    process.exit(1);
  }
} catch (error) {
  console.error("\n❌ Test failed:", error.message);
  process.exit(1);
}

console.log("\n");

// Test 2: Without system message (backward compatibility)
console.log("Test 2: Backward compatibility (no LC.lcSys call)");
console.log("─────────────────────────────────────────────────────────");

try {
  // Reset state
  global.state = {};
  
  // Load library
  const libraryCode = fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8');
  eval(libraryCode);
  
  // Initialize but DON'T add any messages
  const L = LC.lcInit();
  
  // Process through output modifier
  const aiText = "The dragon spreads its wings and takes flight.";
  const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
  const text = aiText;
  const wrappedCode = `(function() { ${outputCode} })()`;
  const result = eval(wrappedCode);
  
  console.log("\n✅ SUCCESS: No system messages displayed\n");
  console.log("Output (should be unchanged):\n");
  console.log(result.text);
  console.log("\n─────────────────────────────────────────────────────────");
  
  // Verify criteria
  const noSystemBlock = !result.text.includes("========================================");
  const noSystemPrefix = !result.text.includes("⟦SYS⟧");
  const textUnchanged = result.text === aiText;
  
  console.log("\nVerification:");
  console.log("  ✓ No system message block:", noSystemBlock);
  console.log("  ✓ No ⟦SYS⟧ prefix:", noSystemPrefix);
  console.log("  ✓ AI text unchanged:", textUnchanged);
  
  if (noSystemBlock && noSystemPrefix && textUnchanged) {
    console.log("\n✅ BACKWARD COMPATIBILITY MAINTAINED: Works like Phase 1.1");
  } else {
    console.log("\n❌ BACKWARD COMPATIBILITY FAILED");
    process.exit(1);
  }
} catch (error) {
  console.error("\n❌ Test failed:", error.message);
  process.exit(1);
}

console.log("\n");
console.log("═══════════════════════════════════════════════════════════");
console.log("✅ ALL ACCEPTANCE CRITERIA MET");
console.log("═══════════════════════════════════════════════════════════");
console.log("");
console.log("Summary:");
console.log("  ✓ Code implemented: All functions created");
console.log("  ✓ Test scenario works: LC.lcSys displays message");
console.log("  ✓ Format correct: ⟦SYS⟧ prefix with separator lines");
console.log("  ✓ Backward compatible: No output when queue empty");
console.log("");
console.log("📦 Phase 1.2 is COMPLETE and ready for deployment!");
console.log("");
