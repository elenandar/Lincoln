/*
Module: Library — Lincoln v17.0.0-alpha.2
Phase 1: Infrastructure
Phase 2: Physical World
Contract:
- Provides core state management and utilities
- Implements command registry and system messaging
- Phase 2: TimeEngine, EnvironmentEngine, ChronologicalKnowledgeBase
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
        version: "17.0.0-alpha.2",
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
        
        // Phase 2: Physical World
        time: {
          turn: 0,
          day: 1,
          timeOfDay: 'Morning',    // Morning, Day, Evening, Night
          dayOfWeek: 'Monday'      // Monday through Sunday
        },
        environment: {
          location: 'Unknown',
          weather: 'Clear'
        },
        chronologicalKnowledge: [],
        
        // Future structures (placeholders for later phases)
        characters: {},
        relations: {},
        goals: {},
        secrets: {},
        evergreen: {},
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

  // === PHASE 2: PHYSICAL WORLD ===

  // === 2.1: TimeEngine (#7) ===
  LC.TimeEngine = {
    // Time of day progression: Morning -> Day -> Evening -> Night -> Morning
    timesOfDay: ['Morning', 'Day', 'Evening', 'Night'],
    
    // Days of the week
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    
    // Advance time based on current turn
    advance: function (L) {
      if (!L || !L.time) return;
      
      // Sync turn counter
      L.time.turn = L.turn;
      
      // Calculate time progression (1 turn = 1 time period)
      const totalPeriods = L.turn;
      const periodsPerDay = 4; // Morning, Day, Evening, Night
      
      // Calculate day
      L.time.day = Math.floor(totalPeriods / periodsPerDay) + 1;
      
      // Calculate time of day
      const periodIndex = totalPeriods % periodsPerDay;
      L.time.timeOfDay = this.timesOfDay[periodIndex];
      
      // Calculate day of week
      const daysSinceStart = Math.floor(totalPeriods / periodsPerDay);
      const dayOfWeekIndex = daysSinceStart % 7;
      L.time.dayOfWeek = this.daysOfWeek[dayOfWeekIndex];
    },
    
    // Get formatted time string
    getTimeString: function (L) {
      if (!L || !L.time) return 'Time unknown';
      return `Day ${L.time.day}, ${L.time.dayOfWeek}, ${L.time.timeOfDay} (Turn ${L.time.turn})`;
    }
  };

  // Register /time command
  LC.CommandsRegistry.set('/time', function (L, args) {
    if (args.length === 0) {
      // Display current time
      LC.lcSys(LC.TimeEngine.getTimeString(L));
    } else {
      LC.lcSys("Usage: /time (to display current time)");
    }
  });

  // === 2.2: EnvironmentEngine (#8) ===
  LC.EnvironmentEngine = {
    // Log an event to the Chronological Knowledge Base
    log: function (L, text) {
      if (!L || !L.chronologicalKnowledge) return;
      
      const entry = {
        turn: L.turn,
        day: L.time.day,
        timeOfDay: L.time.timeOfDay,
        dayOfWeek: L.time.dayOfWeek,
        location: L.environment.location,
        weather: L.environment.weather,
        text: text,
        timestamp: Date.now()
      };
      
      L.chronologicalKnowledge.push(entry);
      L.stateVersion++;
    },
    
    // Change weather
    changeWeather: function (L, newWeather) {
      if (!L || !L.environment) return;
      L.environment.weather = newWeather;
      L.stateVersion++;
    },
    
    // Change location
    changeLocation: function (L, newLocation) {
      if (!L || !L.environment) return;
      L.environment.location = newLocation;
      L.stateVersion++;
    }
  };

  // Register /env command
  LC.CommandsRegistry.set('/env', function (L, args) {
    if (args.length === 0) {
      // Display current environment
      LC.lcSys(`Location: ${L.environment.location}`);
      LC.lcSys(`Weather: ${L.environment.weather}`);
    } else if (args[0] === 'set' && args.length >= 3) {
      const key = args[1];
      const value = args.slice(2).join(' ');
      
      if (key === 'location') {
        LC.EnvironmentEngine.changeLocation(L, value);
        LC.lcSys(`Location set to: ${value}`);
      } else if (key === 'weather') {
        LC.EnvironmentEngine.changeWeather(L, value);
        LC.lcSys(`Weather set to: ${value}`);
      } else {
        LC.lcSys("Unknown environment key. Use: location or weather");
      }
    } else {
      LC.lcSys("Usage: /env or /env set <location|weather> <value>");
    }
  });

  // === 2.3: ChronologicalKnowledgeBase (CKB, #18) ===
  // Register /ckb command
  LC.CommandsRegistry.set('/ckb', function (L, args) {
    const limit = args[0] ? parseInt(args[0]) : 5;
    const entries = L.chronologicalKnowledge.slice(-limit);
    
    if (entries.length === 0) {
      LC.lcSys("Chronological Knowledge Base is empty.");
    } else {
      LC.lcSys(`Recent ${entries.length} entries from CKB:`);
      entries.forEach((entry, idx) => {
        const timeStr = `Day ${entry.day}, ${entry.timeOfDay}`;
        LC.lcSys(`[${idx + 1}] ${timeStr} - ${entry.text.substring(0, 60)}...`);
      });
    }
  });

  // Export to global scope
  _globalScope.LC = LC;

  // Log initialization
  if (typeof console !== 'undefined') {
    console.log('[Lincoln v17.0.0-alpha.2] Library initialized (Phase 2)');
  }

})();
