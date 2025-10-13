#!/usr/bin/env node
/**
 * Test: Grades Sliding Window (Memory Leak Hotfix)
 * 
 * Verifies that:
 * 1. GRADES_HISTORY_LIMIT is defined in CONFIG
 * 2. Old grades are removed when limit is exceeded
 * 3. Only the most recent N grades are kept
 * 4. The sliding window works correctly for multiple subjects
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║        GRADES SLIDING WINDOW TEST (Memory Leak Hotfix)                      ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");

// Load the library
const fs = require('fs');
const path = require('path');

const libraryPath = path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt');
const libraryCode = fs.readFileSync(libraryPath, 'utf8');

// Set up global state (required by Library)
global.state = { lincoln: {} };

// Helper functions (required by Library)
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);

eval(libraryCode);

// Initialize the system
const L = LC.lcInit();
L.turn = 1;

// Test counter
let testsPassed = 0;
let testsFailed = 0;

function test(description, condition, details = '') {
  if (condition) {
    console.log(`  ✅ ${description}`);
    if (details) console.log(`     ${details}`);
    testsPassed++;
  } else {
    console.log(`  ❌ ${description}`);
    if (details) console.log(`     ${details}`);
    testsFailed++;
  }
}

console.log("=== Test 1: CONFIG - GRADES_HISTORY_LIMIT ===\n");

test(
  "GRADES_HISTORY_LIMIT exists in CONFIG",
  LC.CONFIG.GRADES_HISTORY_LIMIT !== undefined,
  `Value: ${LC.CONFIG.GRADES_HISTORY_LIMIT}`
);

test(
  "GRADES_HISTORY_LIMIT is set to 10",
  LC.CONFIG.GRADES_HISTORY_LIMIT === 10,
  `Expected: 10, Got: ${LC.CONFIG.GRADES_HISTORY_LIMIT}`
);

console.log("");

console.log("=== Test 2: Sliding Window - Basic Functionality ===\n");

// Create a test character
L.aliases = {
  'Тестовый': ['тестовый']
};
LC.updateCharacterActivity("Тестовый пришел в школу", false);

// Record exactly LIMIT grades
const limit = LC.CONFIG.GRADES_HISTORY_LIMIT;
for (let i = 1; i <= limit; i++) {
  LC.AcademicsEngine.recordGrade('Тестовый', 'Математика', 3.0 + (i * 0.1));
}

test(
  "Array length equals limit when exactly LIMIT grades recorded",
  L.academics.grades['Тестовый']?.['Математика']?.length === limit,
  `Length: ${L.academics.grades['Тестовый']?.['Математика']?.length}, Limit: ${limit}`
);

const firstGrade = L.academics.grades['Тестовый']?.['Математика']?.[0];
test(
  "First grade is the oldest (grade 3.1)",
  firstGrade?.grade === 3.1,
  `Expected: 3.1, Got: ${firstGrade?.grade}`
);

const lastGrade = L.academics.grades['Тестовый']?.['Математика']?.[limit - 1];
test(
  "Last grade is the newest (grade 4.0)",
  lastGrade?.grade === 4.0,
  `Expected: 4.0, Got: ${lastGrade?.grade}`
);

console.log("");

console.log("=== Test 3: Sliding Window - Overflow Behavior ===\n");

// Record one more grade (should trigger removal of oldest)
LC.AcademicsEngine.recordGrade('Тестовый', 'Математика', 4.5);

test(
  "Array length stays at limit after overflow",
  L.academics.grades['Тестовый']?.['Математика']?.length === limit,
  `Length: ${L.academics.grades['Тестовый']?.['Математика']?.length}, Limit: ${limit}`
);

const newFirstGrade = L.academics.grades['Тестовый']?.['Математика']?.[0];
test(
  "Oldest grade (3.1) was removed, new first is 3.2",
  newFirstGrade?.grade === 3.2,
  `Expected: 3.2, Got: ${newFirstGrade?.grade}`
);

const newLastGrade = L.academics.grades['Тестовый']?.['Математика']?.[limit - 1];
test(
  "New grade (4.5) is now at the end",
  newLastGrade?.grade === 4.5,
  `Expected: 4.5, Got: ${newLastGrade?.grade}`
);

console.log("");

console.log("=== Test 4: Sliding Window - Multiple Overflows ===\n");

// Record 5 more grades
for (let i = 0; i < 5; i++) {
  LC.AcademicsEngine.recordGrade('Тестовый', 'Математика', 4.6 + (i * 0.1));
}

test(
  "Array length still at limit after multiple overflows",
  L.academics.grades['Тестовый']?.['Математика']?.length === limit,
  `Length: ${L.academics.grades['Тестовый']?.['Математика']?.length}, Limit: ${limit}`
);

const afterMultipleFirst = L.academics.grades['Тестовый']?.['Математика']?.[0];
test(
  "First grade is now 3.7 (6 oldest removed)",
  afterMultipleFirst?.grade === 3.7,
  `Expected: 3.7, Got: ${afterMultipleFirst?.grade}`
);

const afterMultipleLast = L.academics.grades['Тестовый']?.['Математика']?.[limit - 1];
test(
  "Last grade is 5.0 (most recent)",
  afterMultipleLast?.grade === 5.0,
  `Expected: 5.0, Got: ${afterMultipleLast?.grade}`
);

console.log("");

console.log("=== Test 5: Sliding Window - Per Subject Independence ===\n");

// Record grades for a different subject
for (let i = 1; i <= 12; i++) {
  LC.AcademicsEngine.recordGrade('Тестовый', 'История', 2.0 + (i * 0.1));
}

test(
  "История array respects limit independently",
  L.academics.grades['Тестовый']?.['История']?.length === limit,
  `Length: ${L.academics.grades['Тестовый']?.['История']?.length}, Limit: ${limit}`
);

test(
  "Математика array unaffected by История recordings",
  L.academics.grades['Тестовый']?.['Математика']?.length === limit,
  `Length: ${L.academics.grades['Тестовый']?.['Математика']?.length}`
);

const historiaFirst = L.academics.grades['Тестовый']?.['История']?.[0];
test(
  "История first grade is 2.3 (2 oldest removed)",
  historiaFirst?.grade === 2.3,
  `Expected: 2.3, Got: ${historiaFirst?.grade}`
);

const historiaLast = L.academics.grades['Тестовый']?.['История']?.[limit - 1];
test(
  "История last grade is 3.2",
  historiaLast?.grade === 3.2,
  `Expected: 3.2, Got: ${historiaLast?.grade}`
);

console.log("");

console.log("=== Test 6: Memory Leak Prevention Simulation ===\n");

// Simulate a stress test scenario
const studentName = 'СтрессТест';
L.aliases[studentName] = [studentName.toLowerCase()];
LC.updateCharacterActivity(`${studentName} начал тест`, false);

// Record 100 grades (should only keep last 10)
for (let i = 1; i <= 100; i++) {
  LC.AcademicsEngine.recordGrade(studentName, 'Химия', 3.0 + (Math.random() * 2));
}

test(
  "After 100 recordings, only 10 grades kept",
  L.academics.grades[studentName]?.['Химия']?.length === limit,
  `Length: ${L.academics.grades[studentName]?.['Химия']?.length}, Expected: ${limit}`
);

console.log(`     This prevents unbounded memory growth!`);

// Calculate approximate memory saved
const gradeSize = 32; // Approximate bytes per grade object
const savedGrades = 100 - limit;
const savedBytes = savedGrades * gradeSize;
console.log(`     Approximate memory saved: ${savedBytes} bytes per subject`);
console.log(`     With 7 chars × 4 subjects: ${savedBytes * 7 * 4} bytes total`);

console.log("");

console.log("=== Test Summary ===");
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📊 Total:  ${testsPassed + testsFailed}\n`);

if (testsFailed === 0) {
  console.log("🎉 All tests passed! Sliding window mechanism is working correctly.");
  console.log("✅ Memory leak hotfix successfully implemented!");
} else {
  console.log("⚠️  Some tests failed. Please review the implementation.");
  process.exit(1);
}
