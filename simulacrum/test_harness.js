#!/usr/bin/env node
/**
 * Project Simulacrum - Test Harness
 * 
 * This module emulates the AI Dungeon runtime environment, allowing local
 * testing of game scripts (Input.js, Output.js, Context.js, Library.js).
 * 
 * @module test_harness
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * Test Harness for AI Dungeon Script Emulation
 */
class TestHarness {
  constructor() {
    this.reset();
  }

  /**
   * Resets all state, history, and globals to initial values
   */
  reset() {
    // AI Dungeon global state object
    global.state = {
      lincoln: {
        _versionCheckDone: true // Prevent version check infinite loop
      },
      memory: {
        frontMemory: "",
        authorsNote: ""
      }
    };

    // AI Dungeon history array (sequence of actions)
    global.history = [];

    // AI Dungeon world info entries
    global.worldInfo = [];

    // AI Dungeon info object (metadata)
    global.info = {
      actionCount: 0,
      characters: []
    };

    // Loaded script modules
    this.scripts = {};
    
    // Last AI response (for testing)
    this.lastAIResponse = "";
    
    // Last context sent to AI
    this.lastContext = "";
  }

  /**
   * Loads a game script file and makes it available for execution
   * 
   * @param {string} filePath - Path to the script file (Input.js, Output.js, etc.)
   * @returns {boolean} True if loaded successfully
   */
  loadScript(filePath) {
    try {
      const absolutePath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(process.cwd(), filePath);
      
      const scriptName = path.basename(filePath, path.extname(filePath));
      const code = fs.readFileSync(absolutePath, 'utf8');
      
      // Store the script code
      this.scripts[scriptName] = code;
      
      // Execute Library immediately if it's the Library script
      if (scriptName.includes('Library')) {
        eval(code);
      }
      
      return true;
    } catch (e) {
      console.error(`Failed to load script ${filePath}:`, e.message);
      return false;
    }
  }

  /**
   * Executes the Input modifier with the given text
   * 
   * @param {string} inputText - User input text
   * @returns {object} Result object with {text, stop} properties
   */
  _executeInput(inputText) {
    const scriptKey = Object.keys(this.scripts).find(k => k.includes('Input'));
    if (!scriptKey) {
      throw new Error('Input script not loaded');
    }

    // The script defines 'modifier' function and ends with 'return modifier(text)'
    // We wrap it in a function to handle the return statement
    const text = inputText;
    const wrappedCode = `(function() { ${this.scripts[scriptKey]} })()`;
    
    const result = eval(wrappedCode);
    
    // Add to history
    global.history.push({
      type: 'action',
      text: result.text || inputText,
      message: result.text || inputText
    });
    global.info.actionCount++;
    
    return result;
  }

  /**
   * Executes the Context modifier to build the context
   * 
   * @param {string} upstreamText - The upstream context text
   * @returns {object} Result object with {text} property containing the context
   */
  _executeContext(upstreamText = "") {
    const scriptKey = Object.keys(this.scripts).find(k => k.includes('Context'));
    if (!scriptKey) {
      // If no Context script, return upstream as-is
      return { text: upstreamText };
    }

    // The script defines 'modifier' function and ends with 'return modifier(text)'
    const text = upstreamText;
    const wrappedCode = `(function() { ${this.scripts[scriptKey]} })()`;
    
    const result = eval(wrappedCode);
    return result;
  }

  /**
   * Executes the Output modifier with the AI response
   * 
   * @param {string} aiResponse - The AI's generated response
   * @returns {object} Result object with {text} property
   */
  _executeOutput(aiResponse) {
    const scriptKey = Object.keys(this.scripts).find(k => k.includes('Output'));
    if (!scriptKey) {
      // If no Output script, return AI response as-is
      return { text: aiResponse };
    }

    // The script defines 'modifier' function and ends with 'return modifier(text)'
    const text = aiResponse;
    const wrappedCode = `(function() { ${this.scripts[scriptKey]} })()`;
    
    const result = eval(wrappedCode);
    return result;
  }

  /**
   * Simulates a complete game turn
   * 
   * @param {string} inputText - User input text
   * @param {string} [aiResponse=""] - Optional AI response (for testing)
   * @returns {object} Object with context and output
   */
  executeTurn(inputText, aiResponse = "") {
    // Step 1: Execute Input.js
    const inputResult = this._executeInput(inputText);
    
    if (inputResult.stop) {
      // Command that stops execution (e.g., /help)
      return {
        stopped: true,
        commandOutput: inputResult.text,
        context: "",
        output: ""
      };
    }

    // Step 2: Execute Context.js to build context
    const contextResult = this._executeContext(inputResult.text);
    this.lastContext = contextResult.text;

    // Step 3: Simulate AI response (or use provided one)
    if (!aiResponse) {
      aiResponse = "[AI response would go here]";
    }
    this.lastAIResponse = aiResponse;

    // Step 4: Execute Output.js with AI response
    const outputResult = this._executeOutput(aiResponse);

    return {
      stopped: false,
      context: contextResult.text,
      output: outputResult.text,
      aiResponse: aiResponse
    };
  }

  /**
   * Simulates the "Say" action (normal story input)
   * 
   * @param {string} text - What the user says/does
   * @returns {object} Turn execution result
   */
  performSay(text) {
    // Set action type to story
    if (global.state && global.state.lincoln) {
      global.state.lincoln.currentAction = { type: 'story' };
    }
    
    return this.executeTurn(text);
  }

  /**
   * Simulates the "Retry" action
   * 
   * @returns {object} Turn execution result
   */
  performRetry() {
    // Set action type to retry
    if (global.state && global.state.lincoln) {
      global.state.lincoln.currentAction = { type: 'retry' };
    }

    // Remove last history entry
    if (global.history.length > 0) {
      global.history.pop();
    }

    // Re-execute with empty input (retry uses last context)
    return this.executeTurn("");
  }

  /**
   * Simulates the "Continue" action
   * 
   * @returns {object} Turn execution result
   */
  performContinue() {
    // Set action type to continue
    if (global.state && global.state.lincoln) {
      global.state.lincoln.currentAction = { type: 'continue' };
    }

    // Continue doesn't modify history, just requests more output
    return this.executeTurn("");
  }

  /**
   * Simulates the "Erase" action (undo last entry)
   * 
   * @returns {boolean} True if an entry was erased
   */
  performErase() {
    if (global.history.length > 0) {
      global.history.pop();
      global.info.actionCount = Math.max(0, global.info.actionCount - 1);
      
      // Also decrement turn counter if it exists
      if (global.state && global.state.lincoln && global.state.lincoln.turn > 0) {
        global.state.lincoln.turn--;
      }
      
      return true;
    }
    return false;
  }

  /**
   * Gets the current Lincoln state object
   * 
   * @returns {object} The Lincoln state
   */
  getState() {
    return global.state.lincoln || {};
  }

  /**
   * Gets the current history array
   * 
   * @returns {array} The history array
   */
  getHistory() {
    return global.history || [];
  }

  /**
   * Gets the current world info
   * 
   * @returns {array} The worldInfo array
   */
  getWorldInfo() {
    return global.worldInfo || [];
  }

  /**
   * Sets initial memory/context
   * 
   * @param {string} frontMemory - The front memory text
   * @param {string} [authorsNote=""] - Optional author's note
   */
  setMemory(frontMemory, authorsNote = "") {
    if (global.state && global.state.memory) {
      global.state.memory.frontMemory = frontMemory;
      global.state.memory.authorsNote = authorsNote;
    }
  }

  /**
   * Adds a world info entry
   * 
   * @param {object} entry - World info entry object
   */
  addWorldInfo(entry) {
    if (global.worldInfo) {
      global.worldInfo.push(entry);
    }
  }

  /**
   * Gets the last context that was sent to the AI
   * 
   * @returns {string} The last context
   */
  getLastContext() {
    return this.lastContext;
  }

  /**
   * Gets the last AI response
   * 
   * @returns {string} The last AI response
   */
  getLastAIResponse() {
    return this.lastAIResponse;
  }
}

// Export singleton instance
const harness = new TestHarness();

module.exports = harness;
