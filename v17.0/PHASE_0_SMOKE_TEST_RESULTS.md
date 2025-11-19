# Phase-0 Smoke Test Results Template

**Date:** _________________  
**Tester:** _________________  
**AI Dungeon Scenario:** _________________

---

## Installation Checklist

- [ ] Opened AI Dungeon scenario
- [ ] Navigated to Settings → Scripts
- [ ] Copied Library.txt to Shared Library field
- [ ] Saved Library.txt (no errors)
- [ ] Copied Input.txt to Input Modifier field
- [ ] Saved Input.txt (no errors)
- [ ] Copied Context.txt to Context Modifier field
- [ ] Saved Context.txt (no errors)
- [ ] Copied Output.txt to Output Modifier field
- [ ] Saved Output.txt (no errors)

---

## Test 1: /ping Command

**Action:** Type `/ping` and press Enter

**Expected Result:**
```
[SYS] pong
```

**Actual Result:**
```
_________________________________
```

**Status:** [ ] PASS [ ] FAIL

**Notes:** _________________________________

---

## Test 2: /help Command

**Action:** Type `/help` and press Enter

**Expected Result:**
```
[SYS] Commands:
/ping
/help
/debug
```

**Actual Result:**
```
_________________________________
```

**Status:** [ ] PASS [ ] FAIL

**Notes:** _________________________________

---

## Test 3: /debug info Command

**Action:** Type `/debug info` and press Enter

**Expected Result:**
```
[SYS] Lincoln v17.0.0 | Turn: 0 | StateVersion: 0
```

**Actual Result:**
```
_________________________________
```

**Status:** [ ] PASS [ ] FAIL

**Notes:** _________________________________

---

## Test 4: /debug state Command

**Action:** Type `/debug state` and press Enter

**Expected Result:**
```
[SYS] State: v0 | Characters: 0 | Rumors: 0 | Fallback Cards: 0
```

**Actual Result:**
```
_________________________________
```

**Status:** [ ] PASS [ ] FAIL

**Notes:** _________________________________

---

## Test 5: Unknown Command

**Action:** Type `/unknown` and press Enter

**Expected Result:**
- AI generates normal story response (command is not intercepted)
- No system message appears

**Actual Result:**
```
_________________________________
```

**Status:** [ ] PASS [ ] FAIL

**Notes:** _________________________________

---

## Test 6: Normal Text Input

**Action:** Type `Hello, world! This is a test.` and press Enter

**Expected Result:**
- AI continues the story normally
- No system messages
- No errors

**Actual Result:**
```
_________________________________
```

**Status:** [ ] PASS [ ] FAIL

**Notes:** _________________________________

---

## Test 7: Console Errors Check

**Action:** Open browser console (F12), check for errors

**Expected Result:**
- No red error messages in console
- No JavaScript errors

**Actual Result:**
```
_________________________________
```

**Status:** [ ] PASS [ ] FAIL

**Notes:** _________________________________

---

## Final Checklist

- [ ] All tests passed
- [ ] Commands intercepted correctly (show [SYS] prefix)
- [ ] Normal text passes through without modification
- [ ] No console errors
- [ ] No script loading errors
- [ ] Story continues normally after tests

---

## Overall Status

**Phase-0 Smoke Test:** [ ] PASSED [ ] FAILED

**If PASSED:**
- Phase-0 is complete ✅
- Foundation is stable
- Ready to proceed to Phase-1 (Qualia Engine)

**If FAILED:**
- Document failures above
- Check script upload integrity
- Verify browser console for specific errors
- Report issues for investigation

---

## Additional Notes

_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________

---

## Sign-off

**Tested by:** _________________  
**Date:** _________________  
**Signature:** _________________

---

## Next Steps (if test passed)

1. Close Phase-0 issue as complete
2. Update project status
3. Begin Phase-1: Qualia Engine implementation
4. Continue with PR-2: Code integration (can run in parallel)

---

**END OF SMOKE TEST RESULTS**
