#!/usr/bin/env node
/**
 * Demo: AcademicsEngine (Bell Curve Protocol, Phase 1)
 * 
 * This demo showcases the basic functionality of the AcademicsEngine,
 * demonstrating how academic performance is simulated for school characters.
 */

console.log("═══════════════════════════════════════════════════════════");
console.log("  ACADEMICS ENGINE DEMO (Bell Curve Protocol, Phase 1)");
console.log("═══════════════════════════════════════════════════════════\n");

const fs = require('fs');
const path = require('path');

// Load library
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };
eval(libraryCode);

const L = LC.lcInit();
L.turn = 1;

console.log("📖 SETTING: Lincoln Heights School - Academic Year 2025\n");
console.log("─────────────────────────────────────────────────────────\n");

// Create students
console.log("Creating students...\n");

L.aliases = {
  'Алекс': ['алекс'],
  'Саша': ['саша'],
  'Виктор': ['виктор']
};

LC.updateCharacterActivity("Алекс, Саша и Виктор пришли в школу", false);

const alex = L.characters['Алекс'];
const sasha = L.characters['Саша'];
const viktor = L.characters['Виктор'];

// Display student profiles
console.log("🎓 STUDENT PROFILES\n");

function displayStudent(name, char) {
  console.log(`👤 ${name}:`);
  console.log(`   Способности (aptitude):`);
  for (const subject of LC.CONFIG.ACADEMIC_SUBJECTS) {
    const apt = char.aptitude[subject];
    const aptPercent = Math.round(apt * 100);
    console.log(`     • ${subject}: ${aptPercent}%`);
  }
  console.log(`   Усердие (effort):`);
  for (const subject of LC.CONFIG.ACADEMIC_SUBJECTS) {
    const eff = char.effort[subject];
    const effPercent = Math.round(eff * 100);
    console.log(`     • ${subject}: ${effPercent}%`);
  }
  console.log(`   Настроение: ${char.qualia_state.valence >= 0.6 ? 'хорошее' : char.qualia_state.valence <= 0.4 ? 'плохое' : 'нейтральное'} (${Math.round(char.qualia_state.valence * 100)}%)`);
  console.log("");
}

displayStudent('Алекс', alex);
displayStudent('Саша', sasha);
displayStudent('Виктор', viktor);

console.log("─────────────────────────────────────────────────────────\n");

// Simulate first semester exams
console.log("📝 ПЕРВЫЙ СЕМЕСТР - Контрольные работы\n");

const students = [
  { name: 'Алекс', char: alex },
  { name: 'Саша', char: sasha },
  { name: 'Виктор', char: viktor }
];

// Run 3 test cycles (one for each month)
for (let month = 1; month <= 3; month++) {
  console.log(`\nМесяц ${month}:`);
  
  // Pick 2 random subjects for this month's tests
  const shuffledSubjects = [...LC.CONFIG.ACADEMIC_SUBJECTS].sort(() => Math.random() - 0.5);
  const testSubjects = shuffledSubjects.slice(0, 2);
  
  for (const subject of testSubjects) {
    console.log(`\n  Предмет: ${subject}`);
    
    for (const student of students) {
      const grade = LC.AcademicsEngine.calculateGrade(student.char, subject);
      LC.AcademicsEngine.recordGrade(student.name, subject, grade);
      
      let gradeText = '';
      if (grade >= 4.5) gradeText = '⭐ Отлично';
      else if (grade >= 3.5) gradeText = '✓ Хорошо';
      else if (grade >= 2.5) gradeText = '− Средне';
      else gradeText = '✗ Плохо';
      
      console.log(`    ${student.name}: ${grade.toFixed(1)} ${gradeText}`);
    }
  }
}

console.log("\n");
console.log("─────────────────────────────────────────────────────────\n");

// Display semester results
console.log("📊 РЕЗУЛЬТАТЫ ПЕРВОГО СЕМЕСТРА\n");

for (const student of students) {
  console.log(`👤 ${student.name}:`);
  
  const grades = L.academics.grades[student.name];
  if (!grades) {
    console.log("   Нет оценок");
    continue;
  }
  
  let totalGrade = 0;
  let totalCount = 0;
  
  for (const subject of LC.CONFIG.ACADEMIC_SUBJECTS) {
    const subjectGrades = grades[subject] || [];
    if (subjectGrades.length > 0) {
      const avg = subjectGrades.reduce((sum, g) => sum + g.grade, 0) / subjectGrades.length;
      totalGrade += avg;
      totalCount++;
      
      console.log(`   ${subject}: ${avg.toFixed(1)} (${subjectGrades.length} оценок)`);
    }
  }
  
  if (totalCount > 0) {
    const overallAvg = totalGrade / totalCount;
    console.log(`   Общий средний балл: ${overallAvg.toFixed(2)}`);
    
    if (overallAvg >= 4.5) {
      console.log(`   🏆 Статус: Отличник`);
    } else if (overallAvg >= 3.5) {
      console.log(`   ✓ Статус: Хорошист`);
    } else {
      console.log(`   − Статус: Средний ученик`);
    }
  }
  
  console.log("");
}

console.log("─────────────────────────────────────────────────────────\n");

// Simulate time passing with LivingWorld
console.log("⏰ ПРОГОН ВРЕМЕНИ - Второй семестр начинается...\n");

console.log("Симуляция закадровых событий (15 циклов)...\n");

L.evergreen = { relations: {} };
L.goals = {};
L.time = {
  currentDay: 1,
  dayName: 'Понедельник',
  timeOfDay: 'Утро',
  scheduledEvents: []
};

let academicTestsGenerated = 0;

for (let i = 0; i < 15; i++) {
  const gradeCountBefore = Object.values(L.academics.grades).reduce((sum, charGrades) => {
    return sum + Object.values(charGrades).reduce((s, arr) => s + arr.length, 0);
  }, 0);
  
  LC.LivingWorld.runOffScreenCycle({ 
    type: 'ADVANCE_TO_NEXT_MORNING', 
    duration: 'night' 
  });
  
  const gradeCountAfter = Object.values(L.academics.grades).reduce((sum, charGrades) => {
    return sum + Object.values(charGrades).reduce((s, arr) => s + arr.length, 0);
  }, 0);
  
  if (gradeCountAfter > gradeCountBefore) {
    academicTestsGenerated++;
    const newGrades = gradeCountAfter - gradeCountBefore;
    console.log(`  День ${i + 1}: Контрольная работа (${newGrades} оценок)`);
  }
}

console.log(`\nВсего контрольных работ: ${academicTestsGenerated}`);
console.log("");

// Final results
console.log("─────────────────────────────────────────────────────────\n");
console.log("📊 ФИНАЛЬНЫЕ РЕЗУЛЬТАТЫ ГОДА\n");

for (const student of students) {
  console.log(`👤 ${student.name}:`);
  
  const grades = L.academics.grades[student.name];
  if (!grades) {
    console.log("   Нет оценок");
    continue;
  }
  
  let totalGrade = 0;
  let totalCount = 0;
  let subjectsData = [];
  
  for (const subject of LC.CONFIG.ACADEMIC_SUBJECTS) {
    const subjectGrades = grades[subject] || [];
    if (subjectGrades.length > 0) {
      const avg = subjectGrades.reduce((sum, g) => sum + g.grade, 0) / subjectGrades.length;
      totalGrade += avg;
      totalCount++;
      subjectsData.push({ subject, avg, count: subjectGrades.length });
    }
  }
  
  // Sort by average (best first)
  subjectsData.sort((a, b) => b.avg - a.avg);
  
  console.log("   Предметы (от лучшего к худшему):");
  for (const data of subjectsData) {
    console.log(`     ${data.subject}: ${data.avg.toFixed(1)} (${data.count} оценок)`);
  }
  
  if (totalCount > 0) {
    const overallAvg = totalGrade / totalCount;
    console.log(`   \n   📈 Общий средний балл: ${overallAvg.toFixed(2)}`);
    
    if (overallAvg >= 4.5) {
      console.log(`   🏆 Итоговый статус: ОТЛИЧНИК`);
    } else if (overallAvg >= 4.0) {
      console.log(`   ⭐ Итоговый статус: ХОРОШИСТ`);
    } else if (overallAvg >= 3.0) {
      console.log(`   ✓ Итоговый статус: СРЕДНИЙ УЧЕНИК`);
    } else {
      console.log(`   − Итоговый статус: ТРЕБУЕТСЯ УЛУЧШЕНИЕ`);
    }
  }
  
  console.log("");
}

console.log("═══════════════════════════════════════════════════════════");
console.log("Demo complete! AcademicsEngine successfully demonstrated.");
console.log("═══════════════════════════════════════════════════════════");
