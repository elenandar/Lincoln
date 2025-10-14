/*
 * Lincoln v17.0 - Library Script
 * Phase 1.1: Zero System - lcInit & State Management
 * 
 * This is the foundational library script that provides:
 * - Global LC object for all Lincoln functionality
 * - lcInit() function for centralized state initialization
 * 
 * Requirements:
 * - Initialize state.shared.lincoln if it doesn't exist
 * - Return state.shared.lincoln for easy access
 * - Minimal implementation with no game interference
 */

(function () {
  'use strict';

  // Create global LC object
  if (typeof window !== 'undefined') {
    window.LC = window.LC || {};
  } else if (typeof global !== 'undefined') {
    global.LC = global.LC || {};
  }

  // Get reference to LC object
  const LC = (typeof window !== 'undefined') ? window.LC : global.LC;

  /**
   * lcInit - Centralized state initialization with lazy initialization
   * 
   * This function ensures that state.shared.lincoln exists and returns it.
   * It's called by all modifier scripts to ensure the state is initialized.
   * 
   * @returns {Object} state.shared.lincoln - The Lincoln state object
   */
  LC.lcInit = function() {
    // Check if state.shared.lincoln already exists
    if (state && state.shared && state.shared.lincoln) {
      // Initialize sys_msgs array if it doesn't exist
      if (!state.shared.lincoln.sys_msgs) {
        state.shared.lincoln.sys_msgs = [];
      }
      return state.shared.lincoln;
    }

    // Initialize state.shared if it doesn't exist
    if (!state.shared) {
      state.shared = {};
    }

    // Initialize state.shared.lincoln
    state.shared.lincoln = {};

    // Initialize sys_msgs array
    if (!state.shared.lincoln.sys_msgs) {
      state.shared.lincoln.sys_msgs = [];
    }

    // Return the initialized state
    return state.shared.lincoln;
  };

  /**
   * lcSys - Add a system message to the queue
   * 
   * @param {string} message - The message to add to the system message queue
   */
  LC.lcSys = function(message) {
    const L = LC.lcInit();
    L.sys_msgs.push(message);
  };

  /**
   * lcConsumeMsgs - Retrieve and clear all system messages
   * 
   * @returns {Array} Array of system messages
   */
  LC.lcConsumeMsgs = function() {
    const L = LC.lcInit();
    const messages = L.sys_msgs.slice(); // Copy the array
    L.sys_msgs = []; // Clear the queue
    return messages;
  };

  /**
   * sysBlock - Format system messages into a display block
   * 
   * @param {Array} messages - Array of message strings
   * @returns {string} Formatted block with messages, or empty string if no messages
   */
  LC.sysBlock = function(messages) {
    if (!messages || messages.length === 0) {
      return '';
    }

    let block = '========================================\n';
    for (let i = 0; i < messages.length; i++) {
      block += '⟦SYS⟧ ' + messages[i] + '\n';
    }
    block += '========================================\n';
    
    return block;
  };

})();
