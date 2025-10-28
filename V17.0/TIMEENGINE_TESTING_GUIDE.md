# TimeEngine Manual Testing Guide (v17.0 Overhauled)

## Overview
This guide provides test cases to verify the Hybrid Smart TimeEngine implementation with Russian support, realistic rates, and context-awareness.

## Prerequisites
1. Upload V17.0/Scripts/Library.txt, Input.txt, Output.txt, and Context.txt to your AI Dungeon scenario
2. Start a new adventure or use an existing one
3. The system initializes with Day 1, 8:00 AM

## Core Functionality Tests

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

### Test 2: Updated Scene Rates
**Setup:** Perform various scene actions and verify rates

**Test Cases:**
1. Generic action: "You look around." → Should add **1 min** (was 10 min)
2. Travel: "You walk to the library." → Should add **5 min** (was 15 min)
3. Combat: "You attack." → Should add **2 min** (unchanged)
4. Dialogue: "You talk to her." → Should add **5 min** (unchanged)

**Verification:** Check `/time stats` after each action

**Result:** PASS / FAIL

---

## Russian Time Anchor Tests

### Test 3: Russian Absolute Time Anchors
**Action:** Test each Russian time anchor:

1. "Утром он проснулся." → Should set time to 8:00 AM
2. "Днём они встретились." → Should set time to 2:00 PM
3. "Вечером была тренировка." → Should set time to 6:00 PM
4. "Ночью все спали." → Should set time to 9:00 PM
5. "В полдень пообедали." → Should set time to 12:00 PM
6. "На рассвете отправились." → Should set time to 6:00 AM
7. "На закате вернулись." → Should set time to 7:00 PM
8. "В полночь встретились." → Should set time to 12:00 AM

**Verification:** `/time` after each

**Result:** PASS / FAIL

---

### Test 4: Russian Event-Based Anchors
**Action:** Test event anchors:

1. "На завтраке обсудили." → Should set to 8:00 AM
2. "Пообедал в столовой." → Should set to 12:30 PM
3. "За ужином разговаривали." → Should set to 7:00 PM
4. "После уроков пошли домой." → Should set to 4:00 PM
5. "После занятий остался." → Should set to 4:00 PM

**Verification:** `/time`

**Result:** PASS / FAIL

---

### Test 5: Russian Relative Time - Hours
**Setup:** Start at 10:00 AM

**Action:**
1. "Спустя 2 часа пришла Хлоя." → Should advance to 12:00 PM
2. "Через три часа начнётся." → Should advance by 3 hours
3. "Час спустя раздался звонок." → Should advance by 1 hour
4. "Через пару часов вернусь." → Should advance by 2 hours
5. "Через несколько часов стемнело." → Should advance by 3 hours

**Verification:** `/time`

**Result:** PASS / FAIL

---

### Test 6: Russian Relative Time - Minutes
**Action:**
1. "Через 5 минут он вернулся." → +5 min
2. "Спустя пятнадцать минут начался урок." → +15 min
3. "Через три минуты раздался звонок." → +3 min
4. "Тридцать минут спустя она позвонила." → +30 min

**Verification:** `/time`

**Result:** PASS / FAIL

---

### Test 7: Montage/Summary Expressions
**Action:**
1. "Весь день они работали." → Should add 8 hours
2. "Всё утро учился." → Should add 4 hours
3. "Несколько часов ждал." → Should add 3 hours
4. "All day they trained." (English) → Should add 8 hours

**Verification:** `/time`

**Result:** PASS / FAIL

---

## Russian Scene Detection Tests

### Test 8: Russian Combat Scene
**Action:** "Максим атаковал противника, нанося серию ударов."

**Expected:** Scene = "combat", rate = 2 min/turn

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 9: Russian Dialogue Scene
**Action:** "Хлоя сказала что-то важное, и Максим ответил."

**Expected:** Scene = "dialogue", rate = 5 min/turn

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 10: Russian Travel Scene
**Action:** "Максим пошёл в библиотеку."

**Expected:** Scene = "travel", rate = 5 min/turn

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 11: Russian Training Scene
**Action:** "Тренировался в спортзале два часа."

**Expected:** Scene = "training", rate = 10 min/turn

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 12: Russian Exploration Scene
**Action:** "Исследовал заброшенное здание."

**Expected:** Scene = "exploration", rate = 8 min/turn

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 13: Russian Rest Scene
**Action:** "Отдыхал на диване весь вечер."

**Expected:** Scene = "rest", rate = 60 min/turn

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

## New Features Tests

### Test 14: Instant Actions
**Action:** Test instant actions (should be 0 minutes):

1. "Повернулся к двери." → 0 min
2. "Кивнул в ответ." → 0 min
3. "Открыл глаза." → 0 min
4. "He turned around." → 0 min
5. "She nodded." → 0 min

**Verification:** `/time` should show no time change

**Result:** PASS / FAIL

---

### Test 15: Travel Distance Awareness
**Setup:** Reset scene tracking, mode = hybrid

**Action:**
1. "Вошёл в соседнюю комнату." → ~1-2 min (short)
2. "Пошёл в здание школы." → ~5 min (medium)
3. "Отправился домой." → ~15 min (long)
4. "Walked to the next room." → ~1-2 min (short, English)

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 16: Emotional/Speed Modifiers
**Setup:** General scene, track time changes

**Action:**
1. "Быстро побежал." → Should reduce time cost (×0.7)
2. "Медленно шёл." → Should increase time cost (×1.5)
3. "He rushed to class." → Should reduce time cost

**Verification:** Compare time costs to baseline

**Result:** PASS / FAIL

---

### Test 17: Weather Modifiers
**Action:**
1. "Шёл под дождём." → Should increase time (×1.3)
2. "Walked through the snow." → Should increase time (×1.3)

**Verification:** Compare to normal walking time

**Result:** PASS / FAIL

---

### Test 18: Group Modifiers
**Action:**
1. "Группа вместе двигалась." → Should increase time (×1.5)
2. "The team moved together." → Should increase time (×1.5)

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 19: Scene Drift with Math.round()
**Setup:** Dialogue scene for extended turns

**Action:** Continue dialogue for 25 turns

**Expected:**
- Turns 1-9: 5 min each
- Turn 10+: ~4 min (70% of 5, rounded)
- Turn 20+: ~3 min (50% of 5, rounded)

**Verification:** `/time stats` at turns 1, 10, 20

**Result:** PASS / FAIL

---

## Regression Tests

### Test 20: English Anchors Still Work
**Action:**
1. "After lessons, they went home." → 4:00 PM
2. "2 hours later, she arrived." → +2 hours
3. "At dawn, they set out." → 6:00 AM
4. "At midnight, the bell rang." → 12:00 AM

**Verification:** `/time`

**Result:** PASS / FAIL

---

### Test 21: English Scene Detection
**Action:**
1. "He attacked the enemy." → combat scene
2. "They talked for a while." → dialogue scene
3. "She walked to town." → travel scene

**Verification:** `/time stats`

**Result:** PASS / FAIL

---

### Test 22: /time Commands Still Work
**Commands:**
1. `/time` → Shows current time
2. `/time skip 2 hours` → Adds 2 hours
3. `/time set 1 14 30` → Sets Day 1, 2:30 PM
4. `/time mode manual` → Changes mode
5. `/time stats` → Shows detailed stats

**Result:** PASS / FAIL

---

## ES5 Compliance Verification

### Test 23: Regex Flag Check
**Manual Code Review:** Check Library.txt Russian patterns

- [ ] All patterns use `/i` flag only (NO `/u` flag)
- [ ] Patterns: time anchors section
- [ ] Patterns: scene detection section

**Result:** PASS / FAIL

---

### Test 24: Scene Drift Math.round()
**Code Review:** Check `_applySceneTime` function

- [ ] Uses `Math.round(rate * 0.7)` for 10+ turns
- [ ] Uses `Math.round(rate * 0.5)` for 20+ turns
- [ ] Uses `Math.round(rate * 0.3)` for near-max

**Result:** PASS / FAIL

---

## Summary

**Total Tests:** 24
**Tests Passed:** ____
**Tests Failed:** ____

**Critical Issues:** (list any)

**Russian Support:**
- [ ] Russian absolute time anchors work
- [ ] Russian event anchors work
- [ ] Russian relative time (hours) work
- [ ] Russian relative time (minutes) work
- [ ] Russian scene detection works

**New Features:**
- [ ] Instant actions = 0 min
- [ ] Travel distance awareness
- [ ] Emotional/speed modifiers
- [ ] Weather modifiers
- [ ] Group modifiers
- [ ] Montage expressions

**Updated Rates:**
- [ ] General: 1 min/turn
- [ ] Travel: 5 min/turn
- [ ] Fallback: 1 min/turn

**Fixes:**
- [ ] Scene drift uses Math.round()
- [ ] ES5 compatible (no /u flag)

**Notes:**
(Add observations, edge cases, issues)
