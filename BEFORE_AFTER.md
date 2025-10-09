# Before/After Comparison: Flag to currentAction Refactoring

## Pattern 1: State Initialization

### Before
```javascript
// In lcInit
L.flags = L.flags || {};
```

### After
```javascript
// In lcInit
L.currentAction = L.currentAction || {};
```

---

## Pattern 2: Setting Retry State

### Before
```javascript
// In detectInputType
this.lcSetFlag("isRetry", true);
this.lcSetFlag("isContinue", false);
```

### After
```javascript
// In detectInputType
L.currentAction = { type: 'retry' };
```

---

## Pattern 3: Checking Command State

### Before
```javascript
// In shouldIncrementTurn
const isCmd = this.lcGetFlag("isCmd", false);
const isRetry = this.lcGetFlag("isRetry", false);
return !isCmd && !isRetry;
```

### After
```javascript
// In shouldIncrementTurn
const isCmd = L.currentAction?.type === 'command';
const isRetry = L.currentAction?.type === 'retry';
return !isCmd && !isRetry;
```

---

## Pattern 4: Setting Task Flags

### Before
```javascript
// In /recap command
LC.lcSetFlag("wantRecap", false);
LC.lcSetFlag("doRecap", true);
```

### After
```javascript
// In /recap command
L.currentAction = { type: 'story', task: 'recap' };
```

---

## Pattern 5: Checking Task State

### Before
```javascript
// In composeContextOverlay
if (!LC.lcGetFlag("isCmd", false) && LC.lcGetFlag("doRecap", false)) {
  priority.push("⟦TASK⟧ NOW WRITE A RECAP: ...");
}
```

### After
```javascript
// In composeContextOverlay
if (L.currentAction?.type !== 'command' && L.currentAction?.task === 'recap') {
  priority.push("⟦TASK⟧ NOW WRITE A RECAP: ...");
}
```

---

## Pattern 6: Continue Detection

### Before
```javascript
// In Input modifier
const _isCont = LC.lcGetFlag("isContinue", false);
const _isRet = LC.lcGetFlag("isRetry", false);
```

### After
```javascript
// In Input modifier
const _isCont = L.currentAction?.type === 'continue';
const _isRet = L.currentAction?.type === 'retry';
```

---

## Pattern 7: Output State Reading

### Before
```javascript
// In Output modifier
const isCmd = LC.lcGetFlag("isCmd", false);
const isRetry = LC.lcGetFlag("isRetry", false);
const wantsRecap = LC.lcGetFlag("doRecap", false);
const wantsEpoch = LC.lcGetFlag("doEpoch", false);
```

### After
```javascript
// In Output modifier
const isCmd = L.currentAction?.type === 'command';
const isRetry = L.currentAction?.type === 'retry';
const wantsRecap = L.currentAction?.task === 'recap';
const wantsEpoch = L.currentAction?.task === 'epoch';
```

---

## Pattern 8: Clearing State

### Before
```javascript
// In turnSet
LC.lcSetFlag("wantRecap", false);
LC.lcSetFlag("doRecap", false);
LC.lcSetFlag("doEpoch", false);
```

### After
```javascript
// In turnSet
if (L.currentAction) {
  delete L.currentAction.wantRecap;
  delete L.currentAction.task;
}
```

---

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| State Location | Scattered in L.flags | Unified in L.currentAction |
| Type Safety | String-based keys | Object properties |
| Readability | `lcGetFlag('isRetry')` | `type === 'retry'` |
| Complexity | 2 functions + flags object | 1 object only |
| Debugging | Multiple flag checks | Single object inspection |
| Default Values | Required in every call | Optional chaining (?.) |

---

## Migration Impact

- **Files Changed**: 4 (Library, Input, Output, Context)
- **Lines Modified**: ~100+ lines across all files
- **Functions Removed**: 2 (lcSetFlag, lcGetFlag)
- **New Pattern**: Unified state object
- **Breaking Changes**: None (LC.Flags facade maintained)
- **Performance**: Same or better (direct property access vs function calls)
