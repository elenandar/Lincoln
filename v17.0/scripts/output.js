/*
 * Lincoln v17.0 - Output Modifier Script
 * Phase 1.2: System Messages - Display system messages before AI output
 * 
 * This modifier:
 * - Checks if LC is defined (library loaded)
 * - Calls LC.lcInit() to ensure state is initialized
 * - Retrieves and displays system messages before AI text
 * - Returns text with system messages prepended if any exist
 * 
 * Requirements:
 * - If LC is undefined, return text immediately (failsafe)
 * - Call lcConsumeMsgs() to get pending messages
 * - Format messages using sysBlock() and prepend to output
 */

var modifier = (text) => {
  // Failsafe: If LC is not defined, return text unchanged
  if (typeof LC === 'undefined') {
    return { text: String(text || '') };
  }

  // Initialize Lincoln state
  const L = LC.lcInit();
  
  let outputText = String(text || '');

  // Retrieve and display system messages
  const messages = LC.lcConsumeMsgs();
  if (messages && messages.length > 0) {
    const block = LC.sysBlock(messages);
    outputText = block + "\n" + outputText;
  }

  return { text: outputText };
};
