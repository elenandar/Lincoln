# Lincoln v16.0.8-compat6d

An advanced interactive storytelling and role-playing system featuring dynamic state management, character relationships, goal tracking, and rich contextual AI interactions.

## Overview

Lincoln is a sophisticated script suite designed for AI-powered interactive narratives. The system provides:

- **Dynamic State Management** - Comprehensive tracking of game state, character relationships, and story progress
- **Goal Tracking System** - Automatic extraction and monitoring of character goals and motivations
- **Relationship Engine** - Complex social dynamics with multiple relationship types and modifiers
- **Temporal System** - In-game time tracking with day/night cycles and event scheduling
- **Knowledge Management** - Chronological knowledge base and information access levels
- **Performance Optimizations** - Unified analysis pipeline and context caching for efficient processing

## Repository Structure

```
Lincoln/
├── Library v16.0.8.patched.txt    # Core library and engine definitions
├── Input v16.0.8.patched.txt      # Input processing and command handling
├── Output v16.0.8.patched.txt     # Output analysis and state updates
├── Context v16.0.8.patched.txt    # Context assembly and AI integration
├── SYSTEM_DOCUMENTATION.md        # Complete system documentation
└── tests/                         # Test suites and demo scripts
    ├── test_*.js                  # Comprehensive test suites
    ├── demo_*.js                  # Feature demonstration scripts
    ├── comprehensive_audit.js     # Full system audit script
    └── validate_*.js              # Validation scripts
```

## Getting Started

### Core Scripts

The four core script files (`Library`, `Input`, `Output`, `Context`) contain the heart of the system and should be deployed together. These files work in concert to:

1. **Library** - Initialize state, define engines, and provide core functionality
2. **Input** - Process user input and commands
3. **Output** - Analyze AI output and update state
4. **Context** - Compose context overlays for AI consumption

### Documentation

For detailed information about the system architecture, features, and usage, see **[SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)**.

The documentation includes:
- Complete architecture overview
- Detailed feature descriptions
- API reference
- Testing and validation guides
- Performance optimization details
- Quick reference guide

### Running Tests

Tests can be run from the repository root:

```bash
# Run specific test suites
node tests/test_engines.js
node tests/test_goals.js
node tests/test_time.js
node tests/test_performance.js

# Run feature demos
node tests/demo_performance.js
node tests/demo_time.js
node tests/demo_character_lifecycle.js

# Run comprehensive system audit
node tests/comprehensive_audit.js
```

## Key Features

### State Management
- Persistent state tracking across turns
- Version-based change detection
- Automatic state synchronization

### Character System
- Dynamic character creation and lifecycle management
- Relationship tracking with multiple dimensions
- Character status and mood tracking
- Population management with demographic pressure

### Goal Tracking
- Automatic goal extraction from narrative
- Goal prioritization and aging
- Context-aware goal presentation

### Time and Events
- Day/night cycle with customizable periods
- Week cycling and date tracking
- Event scheduling with countdowns
- Temporal context in AI prompts

### Knowledge Management
- Chronological knowledge base
- Information access levels (public/private/secret)
- Gossip and rumor tracking
- Secret management system

### Performance
- Unified analysis pipeline
- Context caching with state versioning
- Optimized for retry/continue scenarios

## Technical Details

### Turn Accounting Invariants

- Normal player input and the UI **Continue** button each increment the turn counter (`+1`)
- Slash commands (e.g. `/recap`, `/epoch`, `/continue`), retries, and the service `/continue` command leave the turn counter unchanged (`+0`)
- The `/continue` slash command is the draft acceptance hook and must not be confused with the UI **Continue** button

### Context Overlay Fallback

- If the composed context overlay is empty or invalid, the upstream context text is used as a fallback

## Version

**Current Version:** v16.0.8-compat6d  
**Status:** ✅ Production Ready  
**Last Updated:** 2025-10-10

## License

Internal project for maintaining the Lincoln script suite.
