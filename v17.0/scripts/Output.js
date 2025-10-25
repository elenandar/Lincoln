/*
Module: Output — Lincoln v17.0.0-alpha.2
Phase 1: Infrastructure
Phase 2: Physical World
Contract:
- Increments turn counter for non-command actions
- Displays system messages when sysShow is enabled
- Phase 2: Advances time and logs events to CKB
- No v16 code copied - built from scratch based on MASTER_PLAN_v17.md
*/

(function () {
  const __SCRIPT_SLOT__ = "Output";

  // Get LC namespace
  const LC = (typeof globalThis !== "undefined" ? globalThis.LC : 
              (typeof self !== "undefined" ? self.LC : {}));

  if (!LC || !LC.lcInit) {
    throw new Error('[Output] LC.lcInit not found. Library.js must be loaded first.');
  }

  // Initialize state
  const L = LC.lcInit('Output');

  // Increment turn counter if needed
  LC.Turns.incIfNeeded(L);

  // Phase 2: Advance time after turn increment
  if (LC.TimeEngine && LC.TimeEngine.advance) {
    LC.TimeEngine.advance(L);
  }

  // Phase 2: Log the AI's output to Chronological Knowledge Base
  if (LC.EnvironmentEngine && LC.EnvironmentEngine.log) {
    const outputText = (typeof text !== 'undefined') ? text : '';
    if (outputText && L.currentAction?.type !== 'command') {
      LC.EnvironmentEngine.log(L, outputText);
    }
  }

  // Consume any system messages
  const sysMsgs = LC.lcConsumeMsgs();

  // If sysShow is enabled and there are messages, add them to output
  if (L.sysShow && sysMsgs.length > 0) {
    // Get current text
    let outputText = (typeof text !== 'undefined') ? text : '';
    
    // Format system messages as a block
    const sysBlock = LC.sysBlock(sysMsgs);
    
    // Append to output
    if (outputText) {
      outputText = outputText + '\n\n' + sysBlock;
    } else {
      outputText = sysBlock;
    }
    
    // Update text
    if (typeof text !== 'undefined') {
      text = outputText;
    }
  }

  // Log processing
  if (L.debugMode && typeof console !== 'undefined') {
    console.log('[Output] Turn:', L.turn, 'Action:', L.currentAction.type);
  }

})();
