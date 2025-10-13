#!/usr/bin/env node
/**
 * Stress Test: Verify Memory Leak Hotfix
 * 
 * This test simulates a long-running game with many grade recordings
 * to verify that the sliding window mechanism prevents unbounded memory growth.
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║              MEMORY LEAK HOTFIX STRESS TEST                                  ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');

// Set up global state
global.state = { lincoln: {} };

// Helper functions
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);

// Evaluate library code
eval(libraryCode);

// Initialize state
const L = LC.lcInit();
L.turn = 1;

console.log("=== Memory Leak Stress Test ===\n");

// Create 7 test characters (typical class size from BELL_CURVE_AUDIT_COMPLETION.md)
const characters = ['Максим', 'Хлоя', 'Эшли', 'Кейт', 'Виктория', 'Рейчел', 'Уоррен'];
const subjects = LC.CONFIG.ACADEMIC_SUBJECTS;
const limit = LC.CONFIG.GRADES_HISTORY_LIMIT;

console.log(`Test Configuration:`);
console.log(`- Characters: ${characters.length}`);
console.log(`- Subjects: ${subjects.length}`);
console.log(`- History Limit: ${limit}`);
console.log(`- Total recordings: 1000 per character per subject\n`);

const startTime = Date.now();

console.log("Recording grades (this may take a moment)...");

// Simulate 1000 grade recordings per character per subject
// This simulates a very long game session
for (let i = 0; i < 1000; i++) {
  for (const char of characters) {
    for (const subject of subjects) {
      const grade = 2.0 + Math.random() * 3.0; // Random grade 2-5
      LC.AcademicsEngine.recordGrade(char, subject, grade);
    }
  }
  
  // Progress indicator
  if ((i + 1) % 100 === 0) {
    console.log(`  Progress: ${i + 1}/1000 iterations...`);
  }
}

const endTime = Date.now();
console.log(`\nCompleted in ${((endTime - startTime) / 1000).toFixed(2)} seconds.\n`);

// Calculate actual grades stored
let totalGrades = 0;
let maxGradesPerSubject = 0;
let minGradesPerSubject = Infinity;

for (const char of characters) {
  if (L.academics.grades[char]) {
    for (const subject of subjects) {
      if (L.academics.grades[char][subject]) {
        const count = L.academics.grades[char][subject].length;
        totalGrades += count;
        maxGradesPerSubject = Math.max(maxGradesPerSubject, count);
        minGradesPerSubject = Math.min(minGradesPerSubject, count);
      }
    }
  }
}

const totalRecordings = 1000 * characters.length * subjects.length;
const expectedMax = characters.length * subjects.length * limit;
const gradesSaved = totalRecordings - totalGrades;

console.log("=== Results ===\n");
console.log(`Total recordings made:     ${totalRecordings.toLocaleString()}`);
console.log(`Total grades stored:       ${totalGrades.toLocaleString()}`);
console.log(`Expected max (with limit): ${expectedMax.toLocaleString()}`);
console.log(`Grade objects saved:       ${gradesSaved.toLocaleString()}\n`);

console.log(`Per-subject statistics:`);
console.log(`- Maximum grades: ${maxGradesPerSubject}`);
console.log(`- Minimum grades: ${minGradesPerSubject}`);
console.log(`- Expected limit: ${limit}\n`);

// Memory estimate
const bytesPerGrade = 32; // Approximate bytes per grade object
const memoryStored = totalGrades * bytesPerGrade;
const memorySaved = gradesSaved * bytesPerGrade;

console.log(`Memory estimates (approximate):`);
console.log(`- Memory used: ${(memoryStored / 1024).toFixed(2)} KB`);
console.log(`- Memory saved: ${(memorySaved / 1024).toFixed(2)} KB`);
console.log(`- Savings ratio: ${((memorySaved / (memorySaved + memoryStored)) * 100).toFixed(1)}%\n`);

console.log("=== Test Results ===\n");

let passed = true;

if (totalGrades === expectedMax) {
  console.log("✅ PASS: Total grades match expected limit");
} else {
  console.log(`❌ FAIL: Expected ${expectedMax} total grades, got ${totalGrades}`);
  passed = false;
}

if (maxGradesPerSubject === limit) {
  console.log("✅ PASS: No subject exceeds the history limit");
} else {
  console.log(`❌ FAIL: Maximum grades (${maxGradesPerSubject}) exceeds limit (${limit})`);
  passed = false;
}

if (minGradesPerSubject === limit) {
  console.log("✅ PASS: All subjects reached the history limit");
} else {
  console.log(`❌ FAIL: Minimum grades (${minGradesPerSubject}) below limit (${limit})`);
  passed = false;
}

if (gradesSaved > 0) {
  console.log("✅ PASS: Memory was successfully saved");
} else {
  console.log("❌ FAIL: No memory was saved");
  passed = false;
}

console.log("");

if (passed) {
  console.log("🎉 All tests passed! Memory leak is successfully resolved!");
  console.log("✅ The sliding window mechanism is working correctly.");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed. Review the implementation.");
  process.exit(1);
}
