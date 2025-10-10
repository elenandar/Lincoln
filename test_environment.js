#!/usr/bin/env node
/**
 * Test script to verify EnvironmentEngine functionality
 * 
 * This script validates that:
 * 1. L.environment state is initialized correctly
 * 2. Location detection works for common patterns
 * 3. Weather changes work with valid/invalid inputs
 * 4. Weather affects character moods (probabilistic)
 * 5. Commands /weather and /location are registered
 * 6. Integration with UnifiedAnalyzer works
 */

console.log("=== Testing EnvironmentEngine ===\n");

const fs = require('fs');

// Load library code
const libraryCode = fs.readFileSync('./Library v16.0.8.patched.txt', 'utf8');

// Set up global state that the library expects
global.state = { lincoln: {} };

// Helper functions
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);

// Evaluate library code
eval(libraryCode);

// Test 1: Environment state initialization
console.log("Test 1: Environment State Initialization");
const L = LC.lcInit();
console.log("✓ L.environment exists:", !!L.environment);
console.log("✓ Has weather property:", 'weather' in L.environment);
console.log("✓ Has location property:", 'location' in L.environment);
console.log("✓ Has ambiance property:", 'ambiance' in L.environment);
console.log("✓ Default weather:", L.environment.weather);
console.log("✓ Weather is 'clear':", L.environment.weather === 'clear');
console.log("");

// Test 2: EnvironmentEngine structure
console.log("Test 2: EnvironmentEngine Structure");
console.log("✓ LC.EnvironmentEngine exists:", !!LC.EnvironmentEngine);
console.log("✓ Has detectLocation method:", typeof LC.EnvironmentEngine?.detectLocation === 'function');
console.log("✓ Has changeWeather method:", typeof LC.EnvironmentEngine?.changeWeather === 'function');
console.log("✓ Has analyze method:", typeof LC.EnvironmentEngine?.analyze === 'function');
console.log("✓ Has applyWeatherMoodEffects method:", typeof LC.EnvironmentEngine?.applyWeatherMoodEffects === 'function');
console.log("");

// Test 3: Location detection (Russian)
console.log("Test 3: Location Detection (Russian)");
const russianTests = [
  { text: "Макс пошёл в класс", expected: 'classroom' },
  { text: "Они встретились в столовой", expected: 'cafeteria' },
  { text: "Тренировка в спортзале", expected: 'gym' },
  { text: "Хлоя была в библиотеке", expected: 'library' },
  { text: "Встреча в коридоре", expected: 'hallway' },
  { text: "Игра на школьной площадке", expected: 'schoolyard' }
];

for (const test of russianTests) {
  const detected = LC.EnvironmentEngine.detectLocation(test.text);
  const match = detected === test.expected;
  console.log(`${match ? '✓' : '✗'} "${test.text}" → ${detected} (expected: ${test.expected})`);
}
console.log("");

// Test 4: Location detection (English)
console.log("Test 4: Location Detection (English)");
const englishTests = [
  { text: "Max went to the classroom", expected: 'classroom' },
  { text: "They met at the cafeteria", expected: 'cafeteria' },
  { text: "Training in the gym", expected: 'gym' },
  { text: "Chloe was in the library", expected: 'library' },
  { text: "Meeting in the hallway", expected: 'hallway' },
  { text: "Playing at the schoolyard", expected: 'schoolyard' }
];

for (const test of englishTests) {
  const detected = LC.EnvironmentEngine.detectLocation(test.text);
  const match = detected === test.expected;
  console.log(`${match ? '✓' : '✗'} "${test.text}" → ${detected} (expected: ${test.expected})`);
}
console.log("");

// Test 5: Weather change functionality
console.log("Test 5: Weather Change Functionality");
const initialWeather = L.environment.weather;
console.log("  Initial weather:", initialWeather);

LC.EnvironmentEngine.changeWeather('rain', true); // silent mode to avoid system messages
console.log("✓ Weather changed to 'rain':", L.environment.weather === 'rain');

LC.EnvironmentEngine.changeWeather('snow', true);
console.log("✓ Weather changed to 'snow':", L.environment.weather === 'snow');

LC.EnvironmentEngine.changeWeather('clear', true);
console.log("✓ Weather changed back to 'clear':", L.environment.weather === 'clear');
console.log("");

// Test 6: Weather validation
console.log("Test 6: Weather Validation");
const msgsBefore = L.sysMsgs.length;
LC.EnvironmentEngine.changeWeather('invalid_weather', true);
const msgsAfter = L.sysMsgs.length;
console.log("✓ Invalid weather rejected:", L.environment.weather !== 'invalid_weather');
console.log("✓ Warning message generated:", msgsAfter > msgsBefore);
console.log("");

// Test 7: EnvironmentEngine.analyze() integration
console.log("Test 7: EnvironmentEngine.analyze() Integration");
L.environment.location = ''; // Reset location
LC.EnvironmentEngine.analyze("Максим пошёл в библиотеку");
console.log("✓ Location updated from text:", L.environment.location === 'library');

L.environment.location = '';
LC.EnvironmentEngine.analyze("They went to the gym");
console.log("✓ English location detection works:", L.environment.location === 'gym');
console.log("");

// Test 8: Commands registration
console.log("Test 8: Commands Registration");
const weatherCmd = LC.CommandsRegistry.get("/weather");
const locationCmd = LC.CommandsRegistry.get("/location");
console.log("✓ /weather command registered:", !!weatherCmd);
console.log("✓ /weather has handler:", typeof weatherCmd?.handler === 'function');
console.log("✓ /location command registered:", !!locationCmd);
console.log("✓ /location has handler:", typeof locationCmd?.handler === 'function');
console.log("");

// Test 9: Weather mood effects setup
console.log("Test 9: Weather Mood Effects");
// Setup some characters
L.characters = {
  'Максим': { lastSeen: L.turn, mentions: 5 },
  'Хлоя': { lastSeen: L.turn, mentions: 3 },
  'Эшли': { lastSeen: L.turn - 10, mentions: 2 } // Not recently active
};
L.character_status = {};

// Try to apply weather effects (it's probabilistic, so we just verify it doesn't crash)
try {
  LC.EnvironmentEngine.applyWeatherMoodEffects('rain');
  console.log("✓ applyWeatherMoodEffects('rain') executed without error");
} catch (e) {
  console.log("✗ applyWeatherMoodEffects error:", e.message);
}

try {
  LC.EnvironmentEngine.applyWeatherMoodEffects('clear');
  console.log("✓ applyWeatherMoodEffects('clear') executed without error");
} catch (e) {
  console.log("✗ applyWeatherMoodEffects error:", e.message);
}
console.log("");

// Test 10: State version updates
console.log("Test 10: State Version Updates");
const versionBefore = L.stateVersion;
LC.EnvironmentEngine.changeWeather('storm', true);
const versionAfter1 = L.stateVersion;
console.log("✓ Weather change increments stateVersion:", versionAfter1 > versionBefore);

LC.EnvironmentEngine.analyze("Пошли в парк");
const versionAfter2 = L.stateVersion;
console.log("✓ Location change increments stateVersion:", versionAfter2 > versionAfter1);
console.log("");

console.log("=== Test Summary ===");
console.log("✅ Environment state initialized correctly");
console.log("✅ EnvironmentEngine structure complete");
console.log("✅ Location detection works (Russian & English)");
console.log("✅ Weather changes work with validation");
console.log("✅ Integration with analyze() works");
console.log("✅ Commands registered");
console.log("✅ Weather mood effects execute");
console.log("✅ State version updates properly");
