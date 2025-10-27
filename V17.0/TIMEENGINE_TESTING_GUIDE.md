# TimeEngine Manual Testing Guide

## Overview
This guide provides test cases to verify the Hybrid Smart TimeEngine implementation in AI Dungeon.

## Prerequisites
1. Upload V17.0/Scripts/Library.txt, Input.txt, Output.txt, and Context.txt to your AI Dungeon scenario
2. Start a new adventure or use an existing one
3. The system initializes with Day 1, 8:00 AM

## Test Cases

### Test 1: Basic Time Display
**Command:** `/time`

**Expected Output:**
```
=== Current Time ===
Day 1, Morning (8:00 AM)
Scene: general (0 turns)
Mode: hybrid
Total time passed: 0h 0m
```

**Result:** PASS / FAIL

---

### Test 2: Time Anchor - "after lessons"
**Action:** Type or let AI generate: "After lessons, the students gather in the courtyard."

**Expected:** Time should jump to Day 1, Afternoon (4:00 PM)

**Verification:** Type `/time`

**Result:** PASS / FAIL

---

### Test 3: Time Anchor - "2 hours later"
**Setup:** Ensure time is around 12:00

**Action:** "Two hours later, they arrive at the destination."

**Expected:** Time advances by 2 hours (e.g., 12:00 PM → 2:00 PM)

**Verification:** `/time`

**Result:** PASS / FAIL

---

### Test 4: Time Anchor - "overnight"
**Action:** "They camp overnight in the forest."

**Expected:** Next day, morning time (adds ~8 hours, may roll to next day)

**Verification:** `/time`

**Result:** PASS / FAIL

---

### Test 5: Combat Scene Detection
**Action:** "You attack the enemy with your sword, dodging and striking repeatedly."

**Expected:** 
- Scene changes to "combat"
- Time advances by 2 minutes per turn

**Verification:** `/time stats` after 3-4 turns should show 6-8 minutes passed

**Result:** PASS / FAIL

---

### Test 6: Dialogue Scene Detection
**Action:** "'Hello,' she says. You ask her about the quest and she responds thoughtfully."

**Expected:**
- Scene changes to "dialogue"
- Time advances by 5 minutes per turn

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 7: Travel Scene Detection
**Action:** "You walk down the road, traveling through the countryside toward the distant city."

**Expected:**
- Scene changes to "travel"
- Time advances by 15 minutes per turn

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 8: Scene Drift - 10 Turns
**Setup:** Stay in dialogue scene for 10+ turns

**Action:** Continue dialogue for 10 turns

**Expected:** After turn 10, rate should reduce (5 min → ~3.5 min)

**Verification:** Check `/time stats` for scene turn count

**Result:** PASS / FAIL

---

### Test 9: Max Duration Cap - Combat
**Setup:** Use `/time mode auto` and stay in combat

**Action:** Continue combat actions for 15+ turns (30+ minutes)

**Expected:** After ~30 minutes, time stops progressing or slows dramatically

**Verification:** `/time stats` should show sceneMinutes near 30

**Result:** PASS / FAIL

---

### Test 10: /time skip Command
**Command:** `/time skip 2 hours`

**Expected Output:**
```
Skipped 2 hour(s) forward.
=== Current Time ===
Day 1, Afternoon (10:00 AM → 12:00 PM)
...
```

**Result:** PASS / FAIL

---

### Test 11: /time set Command
**Command:** `/time set 2 14 30`

**Expected:** Time set to Day 2, 2:30 PM

**Verification:** `/time`

**Result:** PASS / FAIL

---

### Test 12: /time mode Command
**Command:** `/time mode manual`

**Expected:** Mode changes to manual

**Verification:** Subsequent actions should NOT advance time automatically

**Test:** Take an action, check `/time` - time should not change

**Result:** PASS / FAIL

---

### Test 13: /time stats Command
**Command:** `/time stats`

**Expected Output:**
```
=== Time Statistics ===
Current: Day 1, Morning (8:00 AM)
Day: 1 | Hour: 8 | Minute: 0
Time of Day: Morning
Scene: general
Scene turns: 0
Scene minutes: 0/unlimited
Mode: hybrid
Total elapsed: 0h 0m
```

**Result:** PASS / FAIL

---

### Test 14: No Regression - Commands
**Test:** Try existing commands

**Commands to test:**
- `/ping` → should return "pong"
- `/debug` → should show debug info
- `/turn` → should show current turn
- `/characters` → should list tracked characters
- `/help` → should list all commands including `/time`

**Result:** PASS / FAIL

---

### Test 15: No Regression - Character Tracking
**Action:** Mention character names in story (e.g., "Alice and Bob meet in the town square")

**Verification:** `/characters` should list Alice and Bob

**Result:** PASS / FAIL

---

### Test 16: Hybrid Mode Priority Test
**Setup:** Ensure mode is "hybrid"

**Test Case 1:** "After lessons" in text
- Expected: Anchor takes priority, time jumps to 16:00

**Test Case 2:** No anchor, combat keywords
- Expected: Scene detection works, 2 min/turn

**Test Case 3:** No anchor, no clear scene
- Expected: Fallback rate (15 min/turn)

**Result:** PASS / FAIL

---

## ES5 Compliance Verification

### Manual Code Review
Check V17.0/Scripts/Library.txt for ES6+ features:

- [ ] No `let` or `const` (except const modifier pattern in Input/Output)
- [ ] No arrow functions `=>`
- [ ] No template literals `` ` ``
- [ ] No `.includes()` - uses `.indexOf()` instead
- [ ] No `Map` or `Set`
- [ ] No spread operator `...`
- [ ] No destructuring
- [ ] No class syntax

**Result:** PASS / FAIL

---

## Summary

**Total Tests:** 16
**Tests Passed:** ____
**Tests Failed:** ____

**Critical Failures:** (list any critical failures)

**Notes:**
(Add any observations, edge cases found, or issues encountered)
