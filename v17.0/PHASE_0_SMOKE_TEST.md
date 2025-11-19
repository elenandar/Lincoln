# Phase-0 Smoke Test - Quick Reference

**Purpose:** Verify Lincoln v17 Phase-0 loads and runs correctly in AI Dungeon.

---

## Pre-Test Checklist

- [ ] AI Dungeon account ready
- [ ] New scenario or test game loaded
- [ ] Scripts panel open (Settings → Scripts)

---

## Installation Steps

1. **Open Scripts Panel**
   - Click Settings (gear icon)
   - Navigate to Scripts tab

2. **Upload Library.txt**
   - Open `v17.0/Library.txt` in editor
   - Select ALL text (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)
   - Paste into "Shared Library" field
   - Click Save

3. **Upload Input.txt**
   - Open `v17.0/Input.txt`
   - Copy all text
   - Paste into "Input Modifier" field
   - Click Save

4. **Upload Context.txt**
   - Open `v17.0/Context.txt`
   - Copy all text
   - Paste into "Context Modifier" field
   - Click Save

5. **Upload Output.txt**
   - Open `v17.0/Output.txt`
   - Copy all text
   - Paste into "Output Modifier" field
   - Click Save

6. **Verify All Saved**
   - All 4 scripts should show green checkmarks
   - No error messages
   - Close settings

---

## Test Sequence

### Test 1: Basic Connectivity
```
Type: /ping
Expected: pong
Result: ___________
```

### Test 2: Version Info
```
Type: /debug info
Expected: Lincoln v17.0.0 | Turn: 0 | StateVersion: 0
Result: ___________
```

### Test 3: State Info
```
Type: /debug state
Expected: State: v0 | Characters: 0 | Rumors: 0 | Fallback Cards: 0
Result: ___________
```

### Test 4: Normal Input
```
Type: Hello, world!
Expected: Story continues normally (no errors, no weird output)
Result: ___________
```

### Test 5: Console Check
```
Action: Press F12 → Console tab
Expected: No red error messages
Result: ___________
```

---

## Success Criteria

**All must pass:**
- [x] `/ping` returns "pong"
- [x] `/debug info` shows version 17.0.0
- [x] `/debug state` shows state info
- [x] Normal text works
- [x] No console errors

**If all pass:** Phase-0 is COMPLETE ✅

---

## Troubleshooting

### Script Won't Save
- **Issue:** Error message on save
- **Fix:** Check for copy-paste errors, try re-copying file

### Command Not Working
- **Issue:** `/ping` does nothing
- **Fix:** Verify Library.txt and Input.txt both saved correctly

### Console Errors
- **Issue:** Red errors in console (F12)
- **Fix:** Check which script failed, re-upload that file

### Normal Text Broken
- **Issue:** Story doesn't continue normally
- **Fix:** Check Output.txt saved correctly

---

## Report Results

**If all tests pass:**
```
✅ Phase-0 smoke test PASSED
- All commands working
- No errors
- Ready for Phase-1
```

**If any test fails:**
```
❌ Phase-0 smoke test FAILED
- Failed test: ___________
- Error message: ___________
- Console output: ___________
```

---

## Next Steps

**After successful test:**
1. Mark Phase-0 as complete
2. Close Phase-0 issue
3. Begin Phase-1: Qualia Engine

**If test fails:**
1. Review error messages
2. Check script upload
3. Verify file integrity
4. Report issue for investigation

---

**Quick Test (1 minute):**
1. Upload all 4 scripts
2. Type: `/ping`
3. See: `pong`
4. ✅ Done!

---

END OF QUICK REFERENCE
