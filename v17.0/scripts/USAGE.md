# How to Use Lincoln v17.0 Scripts in AI Dungeon

## Quick Start Guide

### Step 1: Access Script Settings

1. Open your AI Dungeon adventure
2. Click on the "Settings" icon (gear icon)
3. Navigate to the "Scripts" tab

### Step 2: Load the Scripts

Load the scripts in this **exact order**:

#### 1. Library Script
- **Slot**: Library
- **File**: `library.js`
- **Purpose**: Core functionality and state management

#### 2. Input Modifier
- **Slot**: Input Modifier
- **File**: `input.js`
- **Purpose**: Processes player input

#### 3. Context Modifier
- **Slot**: Context Modifier
- **File**: `context.js`
- **Purpose**: Processes context sent to AI

#### 4. Output Modifier
- **Slot**: Output Modifier
- **File**: `output.js`
- **Purpose**: Processes AI output

### Step 3: Verify Installation

After loading all scripts:

1. Start or continue your adventure
2. Type any action (e.g., "look around")
3. The game should work exactly as before
4. **No errors** should appear in the browser console

### Step 4: Check State (Optional)

To verify the Zero System is working:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Type: `state.shared.lincoln`
4. You should see: `{}` (empty object)

This confirms the Lincoln state is initialized and ready!

## What to Expect

### Current Behavior (Phase 1.1)

- ✅ Scripts load without errors
- ✅ Game works exactly as normal
- ✅ No visible changes to gameplay
- ✅ State is initialized in the background

### What's NOT Working Yet

- ❌ No commands available yet
- ❌ No special features active
- ❌ Pure foundation only

This is **intentional**! The Zero System is designed to be invisible and stable.

## Troubleshooting

### Error: "LC is not defined"

**Problem**: Library script didn't load properly  
**Solution**: 
1. Make sure `library.js` is loaded in the **Library** slot
2. Reload the scripts
3. Refresh the page

### Error in Console

**Problem**: One of the modifiers has a syntax error  
**Solution**:
1. Check that you copied the entire file content
2. Make sure no extra characters were added
3. Try loading the scripts again

### Game Feels Laggy

**Problem**: Scripts might be running too many times  
**Solution**:
1. This should NOT happen with Zero System
2. Check browser console for repeated errors
3. Try disabling and re-enabling scripts

### State Not Initialized

**Problem**: `state.shared.lincoln` is undefined  
**Solution**:
1. Make sure all 4 scripts are loaded
2. Perform at least one action in the game
3. Check browser console for errors

## Developer Notes

### For Testing

If you're testing the scripts outside AI Dungeon:

```bash
# Run comprehensive tests
node test_zero_system.js

# Run interactive demonstration
node demo_zero_system.js
```

### For Development

The Zero System is Phase 1.1 of the MASTER_PLAN_v17.md. It provides:

- `LC` global object
- `LC.lcInit()` function for state management
- `state.shared.lincoln` object (currently empty)

All future features will build on this foundation.

## Next Phase

Once you confirm the Zero System is working, you're ready for:

**Phase 1.2**: System Messages & Commands
- `/ping` command
- System message formatting
- Command registry
- Action type detection

Stay tuned!

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all 4 scripts are loaded correctly
3. Make sure you're using the latest version
4. See README.md for technical details

## Version

- **Version**: v17.0
- **Phase**: 1.1 - Zero System
- **Status**: ✅ Complete and Stable
- **Date**: October 2025
