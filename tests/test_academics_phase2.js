#!/usr/bin/env node
/**
 * Test: AcademicsEngine Phase 2 Integration
 * 
 * Verifies that:
 * 1. getGPA() method correctly calculates average grades
 * 2. MoodEngine is triggered by grade performance
 * 3. HierarchyEngine includes GPA in social capital calculations
 * 4. Academic tags ("Отличник"/"Двоечник") are assigned based on GPA
 * 5. GoalsEngine generates academic goals based on performance
 * 6. LoreEngine recognizes ACADEMIC_TRIUMPH and ACADEMIC_DISGRACE events
 * 7. Lore text is generated correctly for academic events
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║        ACADEMICS ENGINE PHASE 2 INTEGRATION TEST                            ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');

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

// Set up test characters
L.characters = {
  'Максим': {
    name: 'Максим',
    mentions: 15,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    },
    personality: {
      trust: 0.6,
      bravery: 0.7,
      idealism: 0.5,
      aggression: 0.4
    },
    aptitude: {
      'Математика': 0.6,
      'Литература': 0.7,
      'История': 0.5,
      'Химия': 0.6
    },
    effort: {
      'Математика': 0.7,
      'Литература': 0.6,
      'История': 0.8,
      'Химия': 0.5
    },
    qualia_state: {
      valence: 0.5,
      arousal: 0.5
    },
    tags: []
  },
  'Анна': {
    name: 'Анна',
    mentions: 12,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 90,
      conformity: 0.6
    },
    personality: {
      trust: 0.5,
      bravery: 0.6,
      idealism: 0.7,
      aggression: 0.3
    },
    aptitude: {
      'Математика': 0.4,
      'Литература': 0.45,
      'История': 0.42,
      'Химия': 0.43
    },
    effort: {
      'Математика': 0.45,
      'Литература': 0.4,
      'История': 0.5,
      'Химия': 0.4
    },
    qualia_state: {
      valence: 0.5,
      arousal: 0.5
    },
    tags: []
  }
};

L.evergreen = { relations: {}, enabled: true };
L.goals = {};
L.character_status = {};
L.lore = { entries: [], archive: [], stats: {}, coolDown: 0 };

console.log("=== Test 1: getGPA() Method ===\n");

// Record some grades for Максим
LC.AcademicsEngine.recordGrade('Максим', 'Математика', 4.5);
LC.AcademicsEngine.recordGrade('Максим', 'Литература', 4.8);
LC.AcademicsEngine.recordGrade('Максим', 'История', 4.3);
LC.AcademicsEngine.recordGrade('Максим', 'Химия', 4.6);

const gpaMaxim = LC.AcademicsEngine.getGPA('Максим');

test("getGPA() returns a number", typeof gpaMaxim === 'number', `GPA: ${gpaMaxim}`);
test("GPA is calculated correctly", gpaMaxim >= 4.3 && gpaMaxim <= 4.8, `Expected ~4.5, Got: ${gpaMaxim}`);
test("GPA with character object works", LC.AcademicsEngine.getGPA(L.characters['Максим']) === gpaMaxim, `GPA: ${gpaMaxim}`);

// Test with no grades
const gpaNoGrades = LC.AcademicsEngine.getGPA('НесуществующийПерсонаж');
test("getGPA() returns 0 for character with no grades", gpaNoGrades === 0, `GPA: ${gpaNoGrades}`);

console.log("");

console.log("=== Test 2: MoodEngine Integration ===\n");

// Clear mood state
L.character_status = {};

// Record a high grade to trigger positive mood
LC.AcademicsEngine.recordGrade('Максим', 'Математика', 5.0);

test("MoodEngine triggered by high grade", 
  L.character_status['Максим'] !== undefined,
  `Mood detected: ${L.character_status['Максим'] ? 'Yes' : 'No'}`
);

if (L.character_status['Максим']) {
  test("High grade creates positive mood (happy)", 
    L.character_status['Максим'].mood === 'happy',
    `Mood: ${L.character_status['Максим'].mood}`
  );
}

// Clear and test low grade (use Максим who is in core list)
L.character_status = {};
LC.AcademicsEngine.recordGrade('Максим', 'Химия', 2.0);

test("MoodEngine triggered by low grade", 
  L.character_status['Максим'] !== undefined,
  `Mood detected: ${L.character_status['Максим'] ? 'Yes' : 'No'}`
);

if (L.character_status['Максим']) {
  test("Low grade creates negative mood (disappointed)", 
    L.character_status['Максим'].mood === 'disappointed',
    `Mood: ${L.character_status['Максим'].mood}`
  );
}

console.log("");

console.log("=== Test 3: HierarchyEngine - GPA Impact on Social Capital ===\n");

// Ensure Максим has consistently high grades for GPA >= 4.5
// Clear previous inconsistent grades by creating a fresh baseline
L.academics.grades['Максим'] = {
  'Математика': [{ grade: 4.8, turn: 1 }],
  'Литература': [{ grade: 4.7, turn: 1 }],
  'История': [{ grade: 4.9, turn: 1 }],
  'Химия': [{ grade: 4.6, turn: 1 }]
};

const capitalBefore = L.characters['Максим'].social.capital;

// Recalculate status (should apply GPA bonus)
LC.HierarchyEngine.recalculateStatus();

const capitalAfter = L.characters['Максим'].social.capital;

test("Social capital increased for high GPA", 
  capitalAfter > capitalBefore,
  `Before: ${capitalBefore}, After: ${capitalAfter}, Gain: +${capitalAfter - capitalBefore}`
);

console.log("");

console.log("=== Test 4: Academic Tags Based on GPA ===\n");

// Максим should have high GPA (~4.5+)
test("Character has tags array", Array.isArray(L.characters['Максим'].tags), 
  `Tags: ${JSON.stringify(L.characters['Максим'].tags)}`);

test("High GPA character gets 'Отличник' tag", 
  L.characters['Максим'].tags.includes('Отличник'),
  `Tags: ${JSON.stringify(L.characters['Максим'].tags)}`
);

// Record low grades for Анна
LC.AcademicsEngine.recordGrade('Анна', 'Литература', 2.1);
LC.AcademicsEngine.recordGrade('Анна', 'История', 2.2);
LC.AcademicsEngine.recordGrade('Анна', 'Химия', 2.0);

const gpaAnna = LC.AcademicsEngine.getGPA('Анна');

// Recalculate status to update tags
LC.HierarchyEngine.recalculateStatus();

test("Low GPA calculated correctly", gpaAnna < 2.5, `GPA: ${gpaAnna}`);
test("Low GPA character gets 'Двоечник' tag", 
  L.characters['Анна'].tags.includes('Двоечник'),
  `Tags: ${JSON.stringify(L.characters['Анна'].tags)}`
);

console.log("");

console.log("=== Test 5: GoalsEngine - Academic Goal Generation ===\n");

// Clear goals
L.goals = {};

// Try generating academic goals multiple times (it's probabilistic)
let academicGoalGenerated = false;
for (let i = 0; i < 50; i++) {
  LC.GoalsEngine.generateAcademicGoals();
  
  // Check if any academic goals were created
  for (const key in L.goals) {
    if (L.goals[key].academicGoal === true) {
      academicGoalGenerated = true;
      break;
    }
  }
  
  if (academicGoalGenerated) break;
}

test("Academic goals can be generated", academicGoalGenerated,
  `Goals generated: ${Object.keys(L.goals).length}`
);

if (academicGoalGenerated) {
  const academicGoals = Object.values(L.goals).filter(g => g.academicGoal === true);
  const firstGoal = academicGoals[0];
  
  test("Academic goal has correct structure", 
    firstGoal.character && firstGoal.text && firstGoal.plan,
    `Character: ${firstGoal.character}, Text: ${firstGoal.text}`
  );
  
  test("Academic goal has plan", 
    Array.isArray(firstGoal.plan) && firstGoal.plan.length > 0,
    `Plan steps: ${firstGoal.plan.length}`
  );
  
  // Check goal type based on GPA
  if (firstGoal.character === 'Анна') {
    test("Low GPA character gets improvement goal",
      firstGoal.text.includes('исправить') || firstGoal.text.includes('повысить'),
      `Goal: ${firstGoal.text}`
    );
  } else if (firstGoal.character === 'Максим') {
    test("High GPA character gets excellence goal",
      firstGoal.text.includes('лучш') || firstGoal.text.includes('отличн'),
      `Goal: ${firstGoal.text}`
    );
  }
}

console.log("");

console.log("=== Test 6: LoreEngine - ACADEMIC_TRIUMPH Event ===\n");

// Clear lore
L.lore = { entries: [], archive: [], stats: {}, coolDown: 0 };

// Create a character with historically low grades who gets a perfect score
L.characters['Виктор'] = {
  name: 'Виктор',
  status: 'ACTIVE',
  social: { status: 'member', capital: 100, conformity: 0.5 },
  aptitude: { 'Математика': 0.4 },
  effort: { 'Математика': 0.4 },
  qualia_state: { valence: 0.5, arousal: 0.5 },
  tags: []
};

L.academics.grades['Виктор'] = {
  'Математика': [
    { grade: 2.5, turn: 1 },
    { grade: 2.3, turn: 2 },
    { grade: 2.7, turn: 3 }
  ]
};

// Now record a perfect grade (should trigger ACADEMIC_TRIUMPH)
LC.AcademicsEngine.recordGrade('Виктор', 'Математика', 5.0);

test("ACADEMIC_TRIUMPH legend created",
  L.lore.entries.some(entry => entry.type === 'ACADEMIC_TRIUMPH'),
  `Legends: ${L.lore.entries.length}, Types: ${L.lore.entries.map(e => e.type).join(', ')}`
);

if (L.lore.entries.length > 0) {
  const triumphLegend = L.lore.entries.find(e => e.type === 'ACADEMIC_TRIUMPH');
  if (triumphLegend) {
    test("ACADEMIC_TRIUMPH has correct text",
      triumphLegend.Text && triumphLegend.Text.includes('отличн'),
      `Text: ${triumphLegend.Text}`
    );
    test("ACADEMIC_TRIUMPH includes participant",
      triumphLegend.participants && triumphLegend.participants.includes('Виктор'),
      `Participants: ${JSON.stringify(triumphLegend.participants)}`
    );
  }
}

console.log("");

console.log("=== Test 7: LoreEngine - ACADEMIC_DISGRACE Event ===\n");

// Create a high-status student who fails
L.characters['Елена'] = {
  name: 'Елена',
  status: 'ACTIVE',
  social: { status: 'leader', capital: 150, conformity: 0.7 },
  aptitude: { 'Химия': 0.8 },
  effort: { 'Химия': 0.8 },
  qualia_state: { valence: 0.5, arousal: 0.5 },
  tags: ['Отличник']
};

L.academics.grades['Елена'] = {
  'Химия': [
    { grade: 4.8, turn: 1 },
    { grade: 4.9, turn: 2 }
  ]
};

// Clear lore to isolate test
L.lore = { entries: [], archive: [], stats: {}, coolDown: 0 };

// Record a very low grade (should trigger ACADEMIC_DISGRACE)
LC.AcademicsEngine.recordGrade('Елена', 'Химия', 2.0);

test("ACADEMIC_DISGRACE legend created",
  L.lore.entries.some(entry => entry.type === 'ACADEMIC_DISGRACE'),
  `Legends: ${L.lore.entries.length}, Types: ${L.lore.entries.map(e => e.type).join(', ')}`
);

if (L.lore.entries.length > 0) {
  const disgraceLegend = L.lore.entries.find(e => e.type === 'ACADEMIC_DISGRACE');
  if (disgraceLegend) {
    test("ACADEMIC_DISGRACE has correct text",
      disgraceLegend.Text && (disgraceLegend.Text.includes('списыв') || disgraceLegend.Text.includes('опозор')),
      `Text: ${disgraceLegend.Text}`
    );
    test("ACADEMIC_DISGRACE includes participant",
      disgraceLegend.participants && disgraceLegend.participants.includes('Елена'),
      `Participants: ${JSON.stringify(disgraceLegend.participants)}`
    );
  }
}

console.log("");

console.log("=== Test 8: LoreEngine - Text Generation ===\n");

// Test _generateLoreText directly
const triumphEvent = {
  type: 'ACADEMIC_TRIUMPH',
  participants: ['Тестовый Персонаж']
};

const triumphText = LC.LoreEngine._generateLoreText(triumphEvent);
test("ACADEMIC_TRIUMPH text generated",
  triumphText && triumphText.length > 0,
  `Text: ${triumphText}`
);
test("ACADEMIC_TRIUMPH text mentions participant",
  triumphText.includes('Тестовый Персонаж'),
  `Text: ${triumphText}`
);

const disgraceEvent = {
  type: 'ACADEMIC_DISGRACE',
  participants: ['Другой Персонаж']
};

const disgraceText = LC.LoreEngine._generateLoreText(disgraceEvent);
test("ACADEMIC_DISGRACE text generated",
  disgraceText && disgraceText.length > 0,
  `Text: ${disgraceText}`
);
test("ACADEMIC_DISGRACE text mentions participant",
  disgraceText.includes('Другой Персонаж'),
  `Text: ${disgraceText}`
);

console.log("");

console.log("=== Test 9: Integration - Full Workflow ===\n");

// Simulate a complete academic cycle
L.characters['Сергей'] = {
  name: 'Сергей',
  status: 'ACTIVE',
  social: { status: 'member', capital: 100, conformity: 0.5 },
  aptitude: {
    'Математика': 0.5,
    'Литература': 0.6,
    'История': 0.55,
    'Химия': 0.5
  },
  effort: {
    'Математика': 0.6,
    'Литература': 0.5,
    'История': 0.7,
    'Химия': 0.6
  },
  qualia_state: { valence: 0.5, arousal: 0.5 },
  tags: []
};

// Record several grades
LC.AcademicsEngine.recordGrade('Сергей', 'Математика', 3.5);
LC.AcademicsEngine.recordGrade('Сергей', 'Литература', 3.8);
LC.AcademicsEngine.recordGrade('Сергей', 'История', 3.6);

const gpa = LC.AcademicsEngine.getGPA('Сергей');
test("GPA calculated for new character", gpa > 0, `GPA: ${gpa}`);

const capitalBefore2 = L.characters['Сергей'].social.capital;
LC.HierarchyEngine.recalculateStatus();
const capitalAfter2 = L.characters['Сергей'].social.capital;

test("Medium GPA affects social capital appropriately",
  capitalAfter2 >= capitalBefore2 - 10, // Should not lose too much
  `Capital: ${capitalBefore2} -> ${capitalAfter2}`
);

console.log("");

console.log("=== Test Summary ===");
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📊 Total:  ${testsPassed + testsFailed}`);
console.log("");

if (testsFailed === 0) {
  console.log("🎉 All Phase 2 integration tests passed!");
  console.log("");
  console.log("✨ Phase 2 Features Verified:");
  console.log("   1. ✅ getGPA() calculates average grades correctly");
  console.log("   2. ✅ MoodEngine responds to grade performance");
  console.log("   3. ✅ Social capital influenced by GPA");
  console.log("   4. ✅ Academic tags assigned based on performance");
  console.log("   5. ✅ Academic goals generated for characters");
  console.log("   6. ✅ ACADEMIC_TRIUMPH legends detected");
  console.log("   7. ✅ ACADEMIC_DISGRACE legends detected");
  console.log("   8. ✅ Lore text generated for academic events");
} else {
  console.log("⚠️  Some tests failed. Please review the implementation.");
  process.exit(1);
}
