/*
Module: Library — Lincoln v17.0.0-alpha.1
Phase 1: Infrastructure
Contract:
- Provides core state management and utilities
- Implements command registry and system messaging
- No v16 code copied - built from scratch based on MASTER_PLAN_v17.md
*/

(function () {
  const __SCRIPT_SLOT__ = "Library";

  // === GLOBAL SCOPE ACCESS ===
  const _globalScope =
    (typeof globalThis !== "undefined" && globalThis) ||
    (typeof self !== "undefined" && self) ||
    (typeof window !== "undefined" && window) ||
    (typeof global !== "undefined" && global) ||
    {};

  // Initialize LC namespace
  const LC = (_globalScope.LC ||= {});

  // === 1.1: INITIALIZATION (lcInit, #33) ===
  LC.lcInit = function (caller) {
    // Get state.shared access
    const getState = () => (typeof state !== "undefined" ? state : {});
    const s = getState();
    const shared = s.shared || (s.shared = {});
    
    // Initialize lincoln state if not present
    if (!shared.lincoln) {
      shared.lincoln = {
        version: "17.0.0-alpha.1",
        turn: 0,
        stateVersion: 0,
        sysShow: true,           // UI messages enabled by default
        debugMode: false,        // Debug disabled by default
        currentAction: { type: 'story' }, // #34
        
        // System message queue
        sysQueue: [],
        
        // Visible notices
        visibleNotice: [],
        
        // Drafts (#22)
        recapDraft: null,
        epochDraft: null,
        
        // Future structures (placeholders for later phases)
        time: {},
        environment: {},
        characters: {},
        relations: {},
        goals: {},
        secrets: {},
        evergreen: {},
        chronologicalKnowledge: [],
        rumors: [],
        society: { norms: {} },
        myths: [],
        lore: [],
        academics: {}
      };
    }
    
    return shared.lincoln;
  };

  // === 1.2: SYSTEM MESSAGES AND NOTIFICATIONS ===
  
  // Format a single system message line
  LC.sysLine = function (msg) {
    return `⟦SYS⟧ ${msg}`;
  };

  // Format multiple lines as a system block
  LC.sysBlock = function (lines) {
    if (!lines || lines.length === 0) return "";
    return "===\n" + lines.join("\n") + "\n===";
  };

  // Push a notice to visible notices
  LC.pushNotice = function (msg) {
    const L = LC.lcInit('pushNotice');
    L.visibleNotice.push(msg);
  };

  // Consume and clear visible notices
  LC.consumeNotices = function () {
    const L = LC.lcInit('consumeNotices');
    const notices = L.visibleNotice.slice();
    L.visibleNotice = [];
    return notices;
  };

  // Add a system message to the queue
  LC.lcSys = function (msg) {
    const L = LC.lcInit('lcSys');
    L.sysQueue.push(LC.sysLine(msg));
  };

  // Consume all queued system messages
  LC.lcConsumeMsgs = function () {
    const L = LC.lcInit('lcConsumeMsgs');
    const msgs = L.sysQueue.slice();
    L.sysQueue = [];
    return msgs;
  };

  // === 1.3: COMMANDS REGISTRY (#24) ===
  LC.CommandsRegistry = new Map();

  // Register /ping command
  LC.CommandsRegistry.set('/ping', function (L, args) {
    LC.lcSys("Pong!");
  });

  // Register /debug command
  LC.CommandsRegistry.set('/debug', function (L, args) {
    const arg = (args[0] || '').toLowerCase();
    
    if (arg === 'on') {
      L.debugMode = true;
      LC.lcSys("Debug ON.");
    } else if (arg === 'off') {
      L.debugMode = false;
      LC.lcSys("Debug OFF.");
    } else {
      LC.lcSys("Usage: /debug on|off");
    }
  });

  // === 1.4: LC.Tools (#19) ===
  LC.Tools = {
    // Safe regex matching with timeout (stub for Phase 1)
    // TODO: Timeout enforcement will be implemented in Phase 8 (Optimization)
    safeRegexMatch: function (text, regex, timeout) {
      timeout = timeout || 100; // Default 100ms (not enforced in Phase 1)
      try {
        return text.match(regex);
      } catch (e) {
        return null;
      }
    }
  };

  // === 1.5: LC.Utils (#20) ===
  LC.Utils = {
    // Safe number conversion
    toNum: function (x, dflt) {
      dflt = dflt !== undefined ? dflt : 0;
      if (typeof x === "number" && !isNaN(x)) return x;
      const n = Number(x);
      return isNaN(n) ? dflt : n;
    },

    // Safe string conversion
    toStr: function (x) {
      return String(x == null ? "" : x);
    },

    // Safe boolean conversion
    toBool: function (x, dflt) {
      dflt = dflt !== undefined ? dflt : false;
      return x == null ? dflt : !!x;
    }
  };

  // === 1.6: LC.Flags (#21) - Compatibility Facade ===
  LC.Flags = {
    clearCmd: function () {
      // Stub for future compatibility
    },
    
    setCmd: function () {
      // Stub for future compatibility
    },
    
    queueRecap: function () {
      // Stub for future compatibility
    },
    
    queueEpoch: function () {
      // Stub for future compatibility
    }
  };

  // === 1.7: LC.Drafts (#22) - Draft Management ===
  // Structures already initialized in lcInit
  LC.Drafts = {
    applyRecapDraft: function () {
      // Stub for future implementation
    },
    
    applyEpochDraft: function () {
      // Stub for future implementation
    }
  };

  // === 1.8: LC.Turns (#23) - Turn Management ===
  LC.Turns = {
    // Increment turn if action is not command or retry
    incIfNeeded: function (L) {
      const actionType = L.currentAction?.type || 'story';
      if (actionType !== 'command' && actionType !== 'retry') {
        L.turn++;
        L.stateVersion++;
      }
    },

    // Set turn to specific value
    turnSet: function (n) {
      const L = LC.lcInit('turnSet');
      L.turn = LC.Utils.toNum(n, 0);
      L.stateVersion++;
    },

    // Undo turn (decrement)
    turnUndo: function (n) {
      const L = LC.lcInit('turnUndo');
      n = LC.Utils.toNum(n, 1);
      L.turn = Math.max(0, L.turn - n);
      L.stateVersion++;
    }
  };

  // Export to global scope
  _globalScope.LC = LC;

  // Log initialization
  if (typeof console !== 'undefined') {
    console.log('[Lincoln v17.0.0-alpha.1] Library initialized');
  }

})();
