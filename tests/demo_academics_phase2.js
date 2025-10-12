#!/usr/bin/env node
/**
 * Demo: AcademicsEngine Phase 2 Integration
 * 
 * This demo showcases the deep integration of AcademicsEngine with other engines:
 * - MoodEngine: Grades affect character emotions
 * - SocialEngine: GPA influences social status
 * - GoalsEngine: Academic goals generated based on performance
 * - LoreEngine: Legendary academic events
 */

console.log("═══════════════════════════════════════════════════════════");
console.log("  ACADEMICS ENGINE PHASE 2 INTEGRATION DEMO");
console.log("  Bell Curve Protocol: Social & Psychological Simulation");
console.log("═══════════════════════════════════════════════════════════\n");

const fs = require('fs');
const path = require('path');

// Load library
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };

const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);

eval(libraryCode);

const L = LC.lcInit();
L.turn = 1;

console.log("📖 SETTING: Lincoln Heights School - Second Semester\n");
console.log("Three students with different academic trajectories:\n");

// Create three diverse students
L.characters = {
  'Максим': {
    name: 'Максим',
    mentions: 20,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.6
    },
    personality: {
      trust: 0.6,
      bravery: 0.7,
      idealism: 0.7,
      aggression: 0.4
    },
    aptitude: {
      'Математика': 0.8,
      'Литература': 0.7,
      'История': 0.75,
      'Химия': 0.8
    },
    effort: {
      'Математика': 0.85,
      'Литература': 0.8,
      'История': 0.75,
      'Химия': 0.8
    },
    qualia_state: {
      valence: 0.5,
      arousal: 0.5
    },
    tags: []
  },
  'Хлоя': {
    name: 'Хлоя',
    mentions: 18,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 95,
      conformity: 0.5
    },
    personality: {
      trust: 0.5,
      bravery: 0.6,
      idealism: 0.6,
      aggression: 0.3
    },
    aptitude: {
      'Математика': 0.5,
      'Литература': 0.6,
      'История': 0.55,
      'Химия': 0.5
    },
    effort: {
      'Математика': 0.55,
      'Литература': 0.6,
      'История': 0.6,
      'Химия': 0.5
    },
    qualia_state: {
      valence: 0.5,
      arousal: 0.5
    },
    tags: []
  },
  'Эшли': {
    name: 'Эшли',
    mentions: 15,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 85,
      conformity: 0.4
    },
    personality: {
      trust: 0.4,
      bravery: 0.5,
      idealism: 0.5,
      aggression: 0.5
    },
    aptitude: {
      'Математика': 0.4,
      'Литература': 0.45,
      'История': 0.42,
      'Химия': 0.43
    },
    effort: {
      'Математика': 0.4,
      'Литература': 0.45,
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

console.log("👨‍🎓 МАКСИМ - Прилежный отличник");
console.log("   Способности: Высокие");
console.log("   Старательность: Очень высокая");
console.log("   Социальный статус: Обычный член группы\n");

console.log("👩‍🎓 ХЛОЯ - Средняя ученица");
console.log("   Способности: Средние");
console.log("   Старательность: Средняя");
console.log("   Социальный статус: Обычный член группы\n");

console.log("👩‍🎓 ЭШЛИ - Слабая ученица");
console.log("   Способности: Ниже среднего");
console.log("   Старательность: Низкая");
console.log("   Социальный статус: Обычный член группы\n");

console.log("─────────────────────────────────────────────────────────\n");

// ACT 1: First test cycle
console.log("⏰ АКТ 1: Первая контрольная работа (Математика)\n");

const mathGrades = {};
for (const name of ['Максим', 'Хлоя', 'Эшли']) {
  const char = L.characters[name];
  const grade = LC.AcademicsEngine.calculateGrade(char, 'Математика');
  LC.AcademicsEngine.recordGrade(name, 'Математика', grade);
  mathGrades[name] = grade;
  
  console.log(`${name}: ${grade.toFixed(1)}`);
  
  // Check mood
  if (L.character_status[name]) {
    console.log(`   └─ Настроение: ${L.character_status[name].mood}`);
  }
}

console.log("\n─────────────────────────────────────────────────────────\n");

// ACT 2: Simulate a semester with multiple tests
console.log("⏰ АКТ 2: Семестр продолжается (3 месяца тестов)\n");

const subjects = ['Литература', 'История', 'Химия'];

for (let month = 1; month <= 3; month++) {
  console.log(`\nМесяц ${month}:`);
  
  const subject = subjects[month - 1];
  console.log(`  Предмет: ${subject}\n`);
  
  for (const name of ['Максим', 'Хлоя', 'Эшли']) {
    const char = L.characters[name];
    const grade = LC.AcademicsEngine.calculateGrade(char, subject);
    LC.AcademicsEngine.recordGrade(name, subject, grade);
    
    console.log(`  ${name}: ${grade.toFixed(1)}`);
  }
}

console.log("\n─────────────────────────────────────────────────────────\n");

// ACT 3: Calculate GPAs and show social impact
console.log("⏰ АКТ 3: Подведение итогов семестра\n");
console.log("📊 Средние баллы (GPA):\n");

const gpas = {};
for (const name of ['Максим', 'Хлоя', 'Эшли']) {
  const gpa = LC.AcademicsEngine.getGPA(name);
  gpas[name] = gpa;
  
  let status = '───';
  if (gpa >= 4.5) status = '⭐⭐⭐ Отличник';
  else if (gpa >= 4.0) status = '⭐⭐ Хорошист';
  else if (gpa >= 3.0) status = '⭐ Средний ученик';
  else status = '❌ Двоечник';
  
  console.log(`${name}: ${gpa.toFixed(2)} ${status}`);
}

console.log("\n─────────────────────────────────────────────────────────\n");

// ACT 4: Recalculate social hierarchy
console.log("⏰ АКТ 4: Влияние успеваемости на социальный статус\n");

console.log("До пересчета:");
for (const name of ['Максим', 'Хлоя', 'Эшли']) {
  const char = L.characters[name];
  console.log(`  ${name}: Капитал=${char.social.capital}, Статус=${char.social.status}, Теги=${JSON.stringify(char.tags)}`);
}

// Recalculate status (applies GPA bonuses/penalties and tags)
LC.HierarchyEngine.recalculateStatus();

console.log("\nПосле пересчета (с учетом GPA):");
for (const name of ['Максим', 'Хлоя', 'Эшли']) {
  const char = L.characters[name];
  const capitalChange = char.social.capital - (name === 'Максим' ? 100 : name === 'Хлоя' ? 95 : 85);
  const changeSymbol = capitalChange > 0 ? '↑' : capitalChange < 0 ? '↓' : '═';
  
  console.log(`  ${name}: Капитал=${char.social.capital} ${changeSymbol}${Math.abs(capitalChange)}, Статус=${char.social.status}, Теги=${JSON.stringify(char.tags)}`);
}

console.log("\n─────────────────────────────────────────────────────────\n");

// ACT 5: Generate academic goals
console.log("⏰ АКТ 5: Постановка целей на следующий семестр\n");

// Try to generate goals multiple times (it's probabilistic)
for (let i = 0; i < 30; i++) {
  LC.GoalsEngine.generateAcademicGoals();
}

console.log("Цели персонажей:\n");
for (const key in L.goals) {
  const goal = L.goals[key];
  if (goal.academicGoal) {
    console.log(`${goal.character}: "${goal.text}"`);
    console.log(`  └─ План:`);
    for (let i = 0; i < goal.plan.length; i++) {
      console.log(`     ${i + 1}. ${goal.plan[i].text}`);
    }
    console.log("");
  }
}

console.log("─────────────────────────────────────────────────────────\n");

// ACT 6: Create legendary academic events
console.log("⏰ АКТ 6: Драматические события\n");

// Create a student who historically struggled but suddenly excels
L.characters['Виктор'] = {
  name: 'Виктор',
  status: 'ACTIVE',
  social: { status: 'member', capital: 90, conformity: 0.5 },
  aptitude: { 'Математика': 0.4 },
  effort: { 'Математика': 0.4 },
  qualia_state: { valence: 0.5, arousal: 0.5 },
  tags: []
};

L.academics.grades['Виктор'] = {
  'Математика': [
    { grade: 2.3, turn: 1 },
    { grade: 2.5, turn: 2 },
    { grade: 2.7, turn: 3 }
  ]
};

console.log("Виктор - новый студент с плохой успеваемостью:");
console.log(`  Предыдущие оценки по Математике: 2.3, 2.5, 2.7`);
console.log(`  Средний балл: ${LC.AcademicsEngine.getGPA('Виктор').toFixed(2)}\n`);

// Clear lore to isolate this event
const previousLoreCount = L.lore.entries.length;

console.log("Виктор сдает важный тест...");
LC.AcademicsEngine.recordGrade('Виктор', 'Математика', 5.0);
console.log(`  Оценка: 5.0! 🎉\n`);

if (L.lore.entries.length > previousLoreCount) {
  const newLegend = L.lore.entries[L.lore.entries.length - 1];
  console.log("📜 ЛЕГЕНДА СОЗДАНА!");
  console.log(`  Тип: ${newLegend.type}`);
  console.log(`  Описание: ${newLegend.Text}`);
  console.log(`  Потенциал легендарности: ${newLegend.potential}\n`);
}

// Now create a disgrace scenario
console.log("Эшли с тегом 'Двоечник' неожиданно проваливает еще один тест:");
LC.HierarchyEngine.recalculateStatus(); // Ensure Эшли has Двоечник tag

console.log(`  Текущие теги Эшли: ${JSON.stringify(L.characters['Эшли'].tags)}`);
console.log(`  Текущий GPA Эшли: ${LC.AcademicsEngine.getGPA('Эшли').toFixed(2)}\n`);

// Give Эшли leader status and Отличник tag for the disgrace scenario
L.characters['Эшли'].social.status = 'leader';
L.characters['Эшли'].social.capital = 150;
L.characters['Эшли'].tags = ['Отличник'];

console.log("Эшли (теперь отличник и лидер) получает очень плохую оценку...");
const previousLoreCount2 = L.lore.entries.length;
LC.AcademicsEngine.recordGrade('Эшли', 'Математика', 1.5);
console.log(`  Оценка: 1.5! 😱\n`);

if (L.lore.entries.length > previousLoreCount2) {
  const newLegend = L.lore.entries[L.lore.entries.length - 1];
  console.log("📜 ЛЕГЕНДА СОЗДАНА!");
  console.log(`  Тип: ${newLegend.type}`);
  console.log(`  Описание: ${newLegend.Text}`);
  console.log(`  Потенциал легендарности: ${newLegend.potential}\n`);
}

console.log("─────────────────────────────────────────────────────────\n");

// Summary
console.log("=== ИТОГИ ДЕМОНСТРАЦИИ ===\n");
console.log("✨ Продемонстрированные интеграции Phase 2:\n");
console.log("1. ✅ MoodEngine: Оценки влияют на настроение персонажей");
console.log("   └─ Высокие оценки → счастье, низкие → разочарование\n");

console.log("2. ✅ HierarchyEngine: GPA влияет на социальный капитал");
console.log("   └─ Отличники получают бонус +15, двоечники штраф -10\n");

console.log("3. ✅ Автоматические теги на основе успеваемости");
console.log("   └─ 'Отличник' (GPA ≥ 4.5), 'Двоечник' (GPA < 2.5)\n");

console.log("4. ✅ GoalsEngine: Генерация академических целей");
console.log("   └─ Слабые студенты → 'исправить оценки'");
console.log("   └─ Сильные студенты → 'стать лучшим учеником'\n");

console.log("5. ✅ LoreEngine: Легенды академических событий");
console.log("   └─ ACADEMIC_TRIUMPH: Слабый студент получает отлично");
console.log("   └─ ACADEMIC_DISGRACE: Отличник проваливает тест\n");

console.log("📊 Финальные статистики:\n");
console.log("Активные легенды:", L.lore.entries.length);
console.log("Активные цели:", Object.keys(L.goals).filter(k => L.goals[k].status === 'active').length);
console.log("Персонажи с академическими тегами:", 
  Object.values(L.characters).filter(c => c.tags && (c.tags.includes('Отличник') || c.tags.includes('Двоечник'))).length);

console.log("\n🎓 Bell Curve Protocol Phase 2: COMPLETE ✓");
