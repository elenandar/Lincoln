### 4.5 Information Access Levels

#### Overview

The Information Access Levels system allows players to control what system information they see, enabling deeper immersion by hiding "director-level" meta-information while in "character mode".

This feature is critical for maintaining narrative surprise and authentic role-playing experience.

#### Modes

**1. Character Mode (Default)**
- Player sees only information their character would know
- Director-level system messages are hidden
- Maintains immersion and preserves plot surprises
- Example: Hidden messages about weather changes, rumor generation, location tracking

**2. Director Mode**
- Player sees all system messages including meta-information
- Useful for debugging and understanding game mechanics
- Shows all engine activity (gossip, environment, etc.)

#### State Structure

```javascript
state.lincoln.playerInfoLevel = 'character'; // or 'director'
```

#### Commands

**`/mode`** — Show current mode

**`/mode character`** — Switch to character mode (default)
- Hides director-level messages
- Provides immersive experience

**`/mode director`** — Switch to director mode
- Shows all system messages
- Useful for debugging

#### Message Levels

System messages can have two levels:

```javascript
// Character-level message (always visible)
LC.lcSys("Player-visible message");

// Director-level message (hidden in character mode)
LC.lcSys({ text: "Meta information", level: 'director' });

// Or with options parameter
LC.lcSys("Meta information", { level: 'director' });
```

#### Implementation Details

**Library.txt Changes:**
- `L.playerInfoLevel` state added in `lcInit()`
- `LC.lcSys()` modified to accept level parameter
- Messages stored as `{ text, level }` objects

**Output.txt Changes:**
- Filtering logic added before displaying messages
- Director-level messages filtered when `playerInfoLevel === 'character'`

#### Use Cases

**Character Mode:**
- Normal gameplay for maximum immersion
- Player discovers information organically
- Preserves story surprises

**Director Mode:**
- Debugging game mechanics
- Understanding why certain events occurred
- Viewing internal engine state

---
