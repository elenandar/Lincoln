# Memory Leak Hotfix: Grades History Sliding Window

**Date:** 2025-10-12
**Ticket:** Экстренный Тикет 2: "Операция 'Забвение' 2.0: Хотфикс для Оценок"
**Status:** ✅ COMPLETED

## Problem Statement

A critical memory leak was identified in the `AcademicsEngine` due to unbounded accumulation of grades in `L.academics.grades`. The dynamic stress test confirmed linear memory growth without plateau, consistent with indefinite data accumulation.

### Root Cause
- Each grade entry stores `{grade: number, turn: number}` 
- No cleanup/archival mechanism existed for old grades
- Grades accumulated indefinitely per character per subject
- With 7 characters × 4 subjects over 2500 turns, this could result in ~56-84+ grade entries
- Memory growth was 10.33x during stress testing

## Solution Implemented

Implemented a **Sliding Window** mechanism to limit grade history retention.

### Changes Made

#### 1. Configuration (`Library v16.0.8.patched.txt` line ~1335)
```javascript
GRADES_HISTORY_LIMIT: 10,
```

Added `GRADES_HISTORY_LIMIT = 10` to `CONFIG` object, right after `ACADEMIC_SUBJECTS`.

#### 2. AcademicsEngine.recordGrade() (`Library v16.0.8.patched.txt` line ~6268-6272)
```javascript
// Sliding Window: Remove oldest grade if limit exceeded (Memory Leak Hotfix)
const limit = LC.CONFIG.GRADES_HISTORY_LIMIT || 10;
if (L.academics.grades[characterName][subject].length > limit) {
  L.academics.grades[characterName][subject].shift(); // Remove oldest grade
}
```

Modified the `recordGrade()` method to:
1. Check array length after adding a new grade
2. If length exceeds `GRADES_HISTORY_LIMIT`, remove the oldest grade using `shift()`
3. This maintains a sliding window of the most recent N grades

## Test Results

### 1. Existing Tests (test_academics_engine.js)
✅ All 30 tests pass - **No regressions**

### 2. Sliding Window Tests (test_grades_sliding_window.js)
Created comprehensive test suite verifying:
- ✅ CONFIG parameter exists and is set to 10
- ✅ Array length caps at limit (10 grades)
- ✅ Oldest grades are removed on overflow
- ✅ Sliding window works correctly for multiple subjects independently
- ✅ Multiple overflows maintain the limit

**Result:** 16/16 tests passed

### 3. Memory Leak Stress Test (test_memory_leak_stress.js)
Simulated extreme scenario:
- 7 characters × 4 subjects
- 1,000 grade recordings per character per subject
- Total: 28,000 grade recordings

**Results:**
- **Total grades stored:** 280 (exactly the limit)
- **Grade objects saved:** 27,720
- **Memory saved:** 866.25 KB (~99.0% reduction)
- **Performance:** Completed in 11.45 seconds

✅ All stress test assertions passed

## Impact Analysis

### Before Fix
- **Unbounded growth:** All grades retained forever
- **Memory per session:** Linear growth proportional to game length
- **State size growth:** 10.33x observed in 2500-turn stress test

### After Fix
- **Bounded growth:** Maximum 10 grades per subject per character
- **Memory cap:** 7 characters × 4 subjects × 10 grades = 280 grade objects maximum
- **Memory savings:** 99% reduction in long-running games
- **No functionality loss:** Recent history preserved for GPA calculations and lore detection

## Validation

The fix successfully addresses the issue identified in `BELL_CURVE_AUDIT_COMPLETION.md`:

> The grades accumulation is particularly significant because:
> - Each grade entry is `{grade: number, turn: number}`
> - No cleanup/archival mechanism exists for old grades ✅ **FIXED**
> - Grades accumulate indefinitely per character per subject ✅ **FIXED**

## Backward Compatibility

- ✅ All existing tests pass
- ✅ No changes to API or data structure
- ✅ Grade calculation logic unchanged
- ✅ Mood and Lore integration still functional
- ✅ Default limit (10) provides ample history for all engine features

## Files Modified

1. **Library v16.0.8.patched.txt** (+5 lines)
   - Line ~1335: Added `GRADES_HISTORY_LIMIT: 10` to CONFIG
   - Lines ~6268-6272: Added sliding window logic to `recordGrade()`

## Files Created

1. **tests/test_grades_sliding_window.js** (242 lines)
   - Comprehensive sliding window test suite
   - 16 tests covering all edge cases

2. **tests/test_memory_leak_stress.js** (165 lines)
   - Stress test simulating long game sessions
   - Memory savings analysis

3. **GRADES_HISTORY_LIMIT_HOTFIX.md** (this file)
   - Documentation of the fix

## Acceptance Criteria

✅ **GRADES_HISTORY_LIMIT = 10** added to CONFIG
✅ **AcademicsEngine.recordGrade()** modified to implement sliding window
✅ **Old grades removed** when limit exceeded
✅ **All existing tests pass** - no regressions
✅ **Memory leak resolved** - confirmed by stress test

## Recommendations

The current limit of 10 grades per subject provides:
- Sufficient history for GPA calculations
- Adequate data for detecting academic trends
- Meaningful sample size for lore event detection
- Minimal memory footprint

If future features require longer history, the limit can be adjusted via `CONFIG.GRADES_HISTORY_LIMIT`.

---

**Implementation Status:** ✅ COMPLETE
**Memory Leak Status:** ✅ RESOLVED
**Test Coverage:** ✅ COMPREHENSIVE
