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
      return state.shared.lincoln;
    }

    // Initialize state.shared if it doesn't exist
    if (!state.shared) {
      state.shared = {};
    }

    // Initialize state.shared.lincoln
    state.shared.lincoln = {};

    // Return the initialized state
    return state.shared.lincoln;
  };

})();
