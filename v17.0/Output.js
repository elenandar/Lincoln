/*
Module: Output — Lincoln v17.0.0-alpha.1
Phase 1: Infrastructure
Contract:
- Increments turn counter for non-command actions
- Displays system messages when sysShow is enabled
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
