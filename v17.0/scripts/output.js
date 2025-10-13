/*
 * Lincoln v17.0 - Output Modifier Script
 * Phase 1.1: Zero System - Pass-through Modifier
 * 
 * This is a pass-through modifier that:
 * - Checks if LC is defined (library loaded)
 * - Calls LC.lcInit() to ensure state is initialized
 * - Returns text unchanged (no game interference)
 * 
 * Requirements:
 * - If LC is undefined, return text immediately (failsafe)
 * - Call lcInit() even if result is not used yet
 * - Return text without any modifications
 */

var modifier = (text) => {
  // Failsafe: If LC is not defined, return text unchanged
  if (typeof LC === 'undefined') {
    return { text: String(text || '') };
  }

  // Initialize Lincoln state (even if not used yet)
  const L = LC.lcInit();

  // Pass-through: Return text unchanged
  return { text: String(text || '') };
};
