### 4.6 Environment Simulation (EnvironmentEngine)

#### Overview

The EnvironmentEngine tracks and simulates environmental factors including weather, location, and ambiance. It integrates with the MoodEngine to create realistic atmospheric effects on character emotions.

#### State Structure

```javascript
state.lincoln.environment = {
  weather: 'clear',    // Current weather condition
  location: '',        // Current location name
  ambiance: ''         // Ambient atmosphere description
};
```

#### Weather System

**Supported Weather Types:**
- `clear` — ☀️ Clear, sunny weather
- `rain` — 🌧️ Rainy weather
- `snow` — ❄️ Snowy weather
- `storm` — ⛈️ Stormy weather
- `fog` — 🌫️ Foggy weather
- `cloudy` — ☁️ Cloudy weather

**Weather Effects:**
Weather changes can affect character moods with 20% probability:
- Rain → Melancholic mood
- Storm → Anxious mood
- Clear → Cheerful mood
- Snow → Excited mood

#### Location Detection

The engine automatically detects location changes from narrative text:

**Recognized Locations:**
- Classroom (класс, classroom)
- Cafeteria (столовая, cafeteria)
- Gym (спортзал, gym)
- Library (библиотека, library)
- Hallway (коридор, hallway)
- Schoolyard (площадка, schoolyard)
- Park (парк, park)
- Home (дом, home)
- Street (улица, street)

**Detection Example:**
```
Input: "Макс пошёл в библиотеку"
Result: L.environment.location = 'library'
System: 📍 Location: library (director-level)
```

#### Commands

**`/weather`** — Show current weather
```
Output: ☀️ Current weather: clear
```

**`/weather set <type>`** — Change weather
```
Example: /weather set rain
Output: ✅ Weather changed to: rain
System: 🌧️ Погода изменилась: Дождь (director-level)
```

**`/location`** — Show current location
```
Output: 📍 Current location: library
```

**`/location set <name>`** — Set location manually
```
Example: /location set cafeteria
Output: 📍 Location set to: cafeteria
```

#### Integration with Other Systems

**MoodEngine Integration:**
- Weather changes can trigger mood effects on active characters
- 20% chance to apply mood when weather changes
- Affects one random recently active character

**UnifiedAnalyzer Integration:**
- Automatically called during text analysis
- Detects location mentions in narrative
- Updates environment state

#### Architecture

```
Output/UnifiedAnalyzer
    ↓ Calls: LC.EnvironmentEngine.analyze(text)
Library/EnvironmentEngine
    ↓ detectLocation() → Update L.environment.location
    ↓ changeWeather() → Update L.environment.weather
    ↓ applyWeatherMoodEffects() → Update character moods
Library/MoodEngine
    ↓ Mood changes persist for 3 turns
Context
    → Environment affects narrative atmosphere
```

#### Practical Examples

**Example 1: Automatic Location Detection**

Input: `"После уроков Макс пошёл в библиотеку"`

Result:
```javascript
L.environment.location = 'library'
// System message (director): 📍 Location: library
```

**Example 2: Manual Weather Change**

Command: `/weather set storm`

Result:
```javascript
L.environment.weather = 'storm'
// System message (director): ⛈️ Погода изменилась: Гроза
// 20% chance: Random active character becomes anxious
```

**Example 3: Weather Mood Effect**

```javascript
// Before
L.environment.weather = 'clear'
L.characters['Хлоя'] = { lastSeen: 10 }

// After /weather set rain
L.environment.weather = 'rain'
L.character_status['Хлоя'] = {
  mood: 'melancholic',
  reason: 'дождливая погода',
  expires: 13  // turn + 3
}
```

---
