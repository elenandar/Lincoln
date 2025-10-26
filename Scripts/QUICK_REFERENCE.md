# Lincoln v17 Phase 1 - Quick Reference

## Installation

1. Copy the contents of these files to your AI Dungeon scenario:
   - `Scripts/Library.txt` → Library script
   - `Scripts/Input.txt` → Input modifier
   - `Scripts/Output.txt` → Output modifier
   - `Scripts/Context.txt` → Context modifier

2. Save and test with `/ping`

## Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/ping` | Health check | `/ping` |
| `/help` | List all commands | `/help` or `/help [command]` |
| `/debug` | System information | `/debug` |
| `/turn` | Turn management | `/turn` or `/turn set <number>` |
| `/action` | Current action type | `/action` |
| `/test-phase1` | Run tests | `/test-phase1` |

## Infrastructure Components

### LC.Tools (Safety Utilities)
```javascript
LC.Tools.safeRegexMatch(text, pattern)  // Safe regex matching
LC.Tools.escapeRegex(str)               // Escape regex characters
LC.Tools.truncate(str, maxLen)          // Truncate string
LC.Tools.safeString(value, fallback)    // Safe string extraction
```

### LC.Utils (Type Conversion)
```javascript
LC.Utils.toNum(value, fallback)    // Convert to number
LC.Utils.toStr(value, fallback)    // Convert to string
LC.Utils.toBool(value)              // Convert to boolean
LC.Utils.clamp(value, min, max)    // Clamp to range
LC.Utils.clone(obj)                // Deep clone object
```

### LC.Turns (Turn Counter)
```javascript
LC.Turns.get()          // Get current turn
LC.Turns.increment()    // Increment turn
LC.Turns.set(value)     // Set turn (for testing)
```

### LC.Drafts (Message Queue)
```javascript
LC.Drafts.add(message)              // Add message to queue
LC.Drafts.getAll()                  // Get all messages
LC.Drafts.clear()                   // Clear queue
LC.Drafts.flush(separator)          // Flush and concatenate
```

### currentAction (Action Type Tracker)
```javascript
LC.currentAction.set(type)          // Set action type (do/say/story)
LC.currentAction.get()              // Get action type
LC.currentAction.detect(text)       // Auto-detect from input
LC.currentAction.clear()            // Clear action type
```

### LC.Flags (Compatibility Facade)
```javascript
LC.Flags.isDo()             // Check if action is "do"
LC.Flags.isSay()            // Check if action is "say"
LC.Flags.isStory()          // Check if action is "story"
LC.Flags.getActionType()    // Get action type as string
```

## State Structure

```javascript
state.lincoln = {
  version: "17.0.0",
  stateVersion: 0,      // Increments on writes
  turn: 0,              // Current turn
  currentAction: null,  // do/say/story
  drafts: [],           // Message queue
  
  // Future phases (scaffolding ready)
  characters: {},
  relations: {},
  hierarchy: {},
  rumors: [],
  lore: [],
  myths: [],
  time: {},
  environment: {},
  evergreen: [],
  secrets: []
};
```

## Automatic Features

- **Turn Counter**: Auto-increments on each player input
- **Action Detection**: Auto-detects do/say/story from input
- **Message Queue**: Auto-flushes in output
- **Action Clearing**: Auto-clears after output

## Testing

Run tests locally:
```bash
node Scripts/test-phase1.js    # 99 Phase 1 tests
node Scripts/test-phase0.js    # 20 Phase 0 tests
```

## Troubleshooting

### Scripts not loading
- Check for syntax errors in AI Dungeon console
- Verify all four .txt files are uploaded
- Test with `/ping` to verify Library.txt is running

### Commands not working
- Type `/help` to verify commands are registered
- Check command spelling (case-insensitive)
- Use `/debug` to check system state

### Turn not incrementing
- Use `/turn` to check current turn
- Verify Input.txt is being executed
- Check `/debug` for system information

## Next Steps

Phase 1 provides the foundation for:
- **Phase 2**: Physical World (Time, Environment)
- **Phase 3**: Basic Data (Goals, Knowledge)
- **Phase 4**: Consciousness (Qualia, Information) - Critical
- **Phase 5**: Social Dynamics (Relations, Mood, Personality)
- **Phase 6**: Social Hierarchy (Status, Gossip, Norms)
- **Phase 7**: Cultural Memory (Myths, Legends, Lore)
- **Phase 8**: Optimization (Caching, UnifiedAnalyzer)

## Support

See full documentation:
- `Scripts/PHASE1_COMPLETION.md` - Complete implementation checklist
- `Scripts/README.md` - Detailed documentation
- `v17.0/PROJECT_LINCOLN_v17_MASTER_PLAN_v2.md` - Full roadmap

## Version

- **Current**: 17.0.0-phase1
- **Status**: Complete ✅
- **Tests**: 99/99 passing (100%)
- **Date**: October 26, 2025
