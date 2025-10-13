#!/usr/bin/env node
/**
 * Test: AcademicsEngine (Bell Curve Protocol, Phase 1)
 * 
 * Verifies that:
 * 1. ACADEMIC_SUBJECTS are defined in CONFIG
 * 2. L.academics is initialized with grades object
 * 3. Characters have aptitude and effort for each subject
 * 4. AcademicsEngine.calculateGrade() works correctly
 * 5. AcademicsEngine.recordGrade() stores grades properly
 * 6. LivingWorldEngine generates ACADEMIC_TEST events
 * 7. Grades accumulate over time
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║           ACADEMICS ENGINE TEST (Bell Curve Phase 1)                        ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

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

// Initialize state
const L = LC.lcInit();
L.turn = 1;

console.log("=== Test 1: CONFIG - ACADEMIC_SUBJECTS ===\n");

test(
  "ACADEMIC_SUBJECTS exists in CONFIG",
  LC.CONFIG && Array.isArray(LC.CONFIG.ACADEMIC_SUBJECTS),
  `Subjects: ${LC.CONFIG.ACADEMIC_SUBJECTS ? LC.CONFIG.ACADEMIC_SUBJECTS.join(', ') : 'undefined'}`
);

test(
  "ACADEMIC_SUBJECTS has 4 subjects",
  LC.CONFIG.ACADEMIC_SUBJECTS && LC.CONFIG.ACADEMIC_SUBJECTS.length === 4,
  `Count: ${LC.CONFIG.ACADEMIC_SUBJECTS ? LC.CONFIG.ACADEMIC_SUBJECTS.length : 0}`
);

const expectedSubjects = ['Математика', 'Литература', 'История', 'Химия'];
test(
  "ACADEMIC_SUBJECTS contains expected subjects",
  LC.CONFIG.ACADEMIC_SUBJECTS && expectedSubjects.every(s => LC.CONFIG.ACADEMIC_SUBJECTS.includes(s)),
  `Expected: ${expectedSubjects.join(', ')}`
);

console.log("");

console.log("=== Test 2: State Initialization - L.academics ===\n");

test(
  "L.academics exists",
  L.academics && typeof L.academics === 'object',
  `Type: ${typeof L.academics}`
);

test(
  "L.academics.grades exists",
  L.academics && typeof L.academics.grades === 'object',
  `Type: ${typeof L.academics?.grades}`
);

console.log("");

console.log("=== Test 3: Character Initialization - aptitude and effort ===\n");

// Create test characters
L.aliases = {
  'Максим': ['максим'],
  'Хлоя': ['хлоя'],
  'Эшли': ['эшли']
};

// Initialize characters by mentioning them
LC.updateCharacterActivity("Максим пришел в школу", false);
LC.updateCharacterActivity("Хлоя встретила Эшли", false);

const maxim = L.characters['Максим'];
const chloe = L.characters['Хлоя'];

test(
  "Максим has aptitude object",
  maxim && maxim.aptitude && typeof maxim.aptitude === 'object',
  `Type: ${typeof maxim?.aptitude}`
);

test(
  "Максим has effort object",
  maxim && maxim.effort && typeof maxim.effort === 'object',
  `Type: ${typeof maxim?.effort}`
);

if (maxim && maxim.aptitude) {
  const subjects = LC.CONFIG.ACADEMIC_SUBJECTS;
  let allSubjectsPresent = true;
  for (const subject of subjects) {
    if (!(subject in maxim.aptitude)) {
      allSubjectsPresent = false;
      break;
    }
  }
  
  test(
    "Максим has aptitude for all subjects",
    allSubjectsPresent,
    `Subjects with aptitude: ${Object.keys(maxim.aptitude).join(', ')}`
  );
  
  // Check value ranges
  let aptitudesInRange = true;
  for (const subject of subjects) {
    const apt = maxim.aptitude[subject];
    if (apt < 0.4 || apt > 0.9) {
      aptitudesInRange = false;
      break;
    }
  }
  
  test(
    "All aptitude values are in range [0.4, 0.9]",
    aptitudesInRange,
    `Sample: Математика=${maxim.aptitude['Математика']?.toFixed(2)}`
  );
}

if (maxim && maxim.effort) {
  const subjects = LC.CONFIG.ACADEMIC_SUBJECTS;
  let allSubjectsPresent = true;
  for (const subject of subjects) {
    if (!(subject in maxim.effort)) {
      allSubjectsPresent = false;
      break;
    }
  }
  
  test(
    "Максим has effort for all subjects",
    allSubjectsPresent,
    `Subjects with effort: ${Object.keys(maxim.effort).join(', ')}`
  );
  
  // Check value ranges
  let effortsInRange = true;
  for (const subject of subjects) {
    const eff = maxim.effort[subject];
    if (eff < 0.4 || eff > 0.9) {
      effortsInRange = false;
      break;
    }
  }
  
  test(
    "All effort values are in range [0.4, 0.9]",
    effortsInRange,
    `Sample: Математика=${maxim.effort['Математика']?.toFixed(2)}`
  );
}

console.log("");

console.log("=== Test 4: AcademicsEngine Structure ===\n");

test(
  "LC.AcademicsEngine exists",
  LC.AcademicsEngine && typeof LC.AcademicsEngine === 'object',
  `Type: ${typeof LC.AcademicsEngine}`
);

test(
  "calculateGrade method exists",
  typeof LC.AcademicsEngine?.calculateGrade === 'function',
  `Type: ${typeof LC.AcademicsEngine?.calculateGrade}`
);

test(
  "recordGrade method exists",
  typeof LC.AcademicsEngine?.recordGrade === 'function',
  `Type: ${typeof LC.AcademicsEngine?.recordGrade}`
);

console.log("");

console.log("=== Test 5: AcademicsEngine.calculateGrade() ===\n");

if (maxim) {
  const grade1 = LC.AcademicsEngine.calculateGrade(maxim, 'Математика');
  
  test(
    "calculateGrade returns a number",
    typeof grade1 === 'number',
    `Grade: ${grade1}`
  );
  
  test(
    "Grade is in range [1, 5]",
    grade1 >= 1 && grade1 <= 5,
    `Grade: ${grade1}`
  );
  
  // Test that grades vary (call multiple times)
  const grades = [];
  for (let i = 0; i < 10; i++) {
    grades.push(LC.AcademicsEngine.calculateGrade(maxim, 'Математика'));
  }
  
  const uniqueGrades = new Set(grades);
  test(
    "Grades show variability due to randomness",
    uniqueGrades.size > 1,
    `Unique grades in 10 calls: ${uniqueGrades.size}`
  );
  
  console.log(`     Sample grades: ${grades.slice(0, 5).map(g => g.toFixed(1)).join(', ')}`);
}

console.log("");

console.log("=== Test 6: AcademicsEngine.recordGrade() ===\n");

const gradesBefore = Object.keys(L.academics.grades).length;

LC.AcademicsEngine.recordGrade('Максим', 'Математика', 4.5);

test(
  "Grade was recorded for Максим",
  L.academics.grades['Максим'] !== undefined,
  `Character has grades object: ${!!L.academics.grades['Максим']}`
);

test(
  "Математика grades array exists",
  Array.isArray(L.academics.grades['Максим']?.['Математика']),
  `Type: ${Array.isArray(L.academics.grades['Максим']?.['Математика']) ? 'array' : typeof L.academics.grades['Максим']?.['Математика']}`
);

test(
  "Grade was added to array",
  L.academics.grades['Максим']?.['Математика']?.length === 1,
  `Length: ${L.academics.grades['Максим']?.['Математика']?.length}`
);

const recordedGrade = L.academics.grades['Максим']?.['Математика']?.[0];
test(
  "Recorded grade has correct structure",
  recordedGrade && typeof recordedGrade.grade === 'number' && typeof recordedGrade.turn === 'number',
  `Grade: ${recordedGrade?.grade}, Turn: ${recordedGrade?.turn}`
);

test(
  "Recorded grade value is correct",
  recordedGrade?.grade === 4.5,
  `Expected: 4.5, Got: ${recordedGrade?.grade}`
);

// Record another grade for the same subject
LC.AcademicsEngine.recordGrade('Максим', 'Математика', 3.8);

test(
  "Multiple grades accumulate",
  L.academics.grades['Максим']?.['Математика']?.length === 2,
  `Length: ${L.academics.grades['Максим']?.['Математика']?.length}`
);

// Record grade for different subject
LC.AcademicsEngine.recordGrade('Максим', 'История', 4.2);

test(
  "Grades for different subjects are separate",
  L.academics.grades['Максим']?.['История']?.length === 1 &&
  L.academics.grades['Максим']?.['Математика']?.length === 2,
  `Математика: ${L.academics.grades['Максим']?.['Математика']?.length}, История: ${L.academics.grades['Максим']?.['История']?.length}`
);

console.log("");

console.log("=== Test 7: LivingWorld Integration - ACADEMIC_TEST Events ===\n");

// Set up for LivingWorld test
L.evergreen = { relations: {} };
L.goals = {};
L.time = {
  currentDay: 1,
  dayName: 'Понедельник',
  timeOfDay: 'Утро',
  turnsPerToD: 5,
  turnsInCurrentToD: 0,
  scheduledEvents: []
};

// Clear existing grades to test fresh
L.academics.grades = {};

// Run multiple cycles to trigger academic tests (20% probability each)
let testsGenerated = 0;
for (let cycle = 0; cycle < 20; cycle++) {
  const gradeCountBefore = Object.keys(L.academics.grades).length;
  
  LC.LivingWorld.runOffScreenCycle({ 
    type: 'ADVANCE_TO_NEXT_MORNING', 
    duration: 'night' 
  });
  
  const gradeCountAfter = Object.keys(L.academics.grades).length;
  
  if (gradeCountAfter > gradeCountBefore) {
    testsGenerated++;
  }
}

test(
  "Academic tests were generated during cycles",
  testsGenerated > 0,
  `Tests generated in 20 cycles: ${testsGenerated}`
);

test(
  "Grades were recorded for characters",
  Object.keys(L.academics.grades).length > 0,
  `Characters with grades: ${Object.keys(L.academics.grades).length}`
);

// Check that grades exist for at least one character
const characterNames = Object.keys(L.academics.grades);
if (characterNames.length > 0) {
  const firstChar = characterNames[0];
  const subjects = Object.keys(L.academics.grades[firstChar] || {});
  
  test(
    "Grades recorded for specific subjects",
    subjects.length > 0,
    `${firstChar} has grades in: ${subjects.join(', ')}`
  );
  
  if (subjects.length > 0) {
    const firstSubject = subjects[0];
    const gradeCount = L.academics.grades[firstChar][firstSubject].length;
    
    test(
      "Multiple grades can accumulate over time",
      gradeCount >= 1,
      `${firstChar} has ${gradeCount} grade(s) in ${firstSubject}`
    );
    
    console.log(`     Sample grade: ${JSON.stringify(L.academics.grades[firstChar][firstSubject][0])}`);
  }
}

console.log("");

console.log("=== Test 8: Grade Distribution ===\n");

// Generate many grades to verify distribution
const testChar = maxim;
if (testChar) {
  const testGrades = [];
  for (let i = 0; i < 100; i++) {
    testGrades.push(LC.AcademicsEngine.calculateGrade(testChar, 'Математика'));
  }
  
  const avg = testGrades.reduce((a, b) => a + b, 0) / testGrades.length;
  const min = Math.min(...testGrades);
  const max = Math.max(...testGrades);
  
  test(
    "Average grade is reasonable (2-4 range)",
    avg >= 2 && avg <= 4,
    `Average: ${avg.toFixed(2)}`
  );
  
  test(
    "Grades span a reasonable range",
    (max - min) >= 1.0,
    `Range: ${min.toFixed(1)} - ${max.toFixed(1)}`
  );
  
  console.log(`     Distribution over 100 tests: min=${min.toFixed(1)}, avg=${avg.toFixed(2)}, max=${max.toFixed(1)}`);
}

console.log("");

console.log("=== Test Summary ===");
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📊 Total:  ${testsPassed + testsFailed}`);
console.log("");

if (testsFailed === 0) {
  console.log("🎉 All tests passed! AcademicsEngine implementation is complete.");
} else {
  console.log("⚠️  Some tests failed. Please review the implementation.");
  process.exit(1);
}
