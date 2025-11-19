// === LC.Tools.safeLog (diagnostic helper) ===
if (!LC.Tools) LC.Tools = {};
LC.Tools.safeLog = function(label, value) {
  var kind = (value === undefined) ? 'UNDEFINED' : (value === null ? 'NULL' : (typeof value));
  try {
    console.log('[LOG] ' + label + ' [' + kind + ']: ' + (value === undefined ? '(undef)' : (value === null ? '(null)' : String(value))));
  } catch (e) {
    // as a fallback, attempt minimal log
    console.log('[LOG] ' + label + ' [' + kind + ']');
  }
};

// === LC.StoryCards (safe wrapper with fallback) ===
LC.StoryCards = {
  available: function() {
    try {
      if (typeof storyCards === 'undefined') return false;
      // probe length accessor safely
      var len = storyCards.length;
      return typeof len === 'number';
    } catch (e) {
      console.log('StoryCards unavailable:', e);
      return false;
    }
  },

  add: function(keys, entry, type) {
    // fallback path if Memory Bank is disabled
    if (!this.available()) {
      if (!state.lincoln.fallbackCards) state.lincoln.fallbackCards = [];
      state.lincoln.fallbackCards.push({ keys: keys, entry: entry, type: type });
      if (state.lincoln && typeof state.lincoln.stateVersion === 'number') state.lincoln.stateVersion++;
      return false;
    }
    try {
      var result = addStoryCard(keys, entry, type);
      if (state.lincoln && typeof state.lincoln.stateVersion === 'number') state.lincoln.stateVersion++;
      return result;
    } catch (e) {
      console.log('addStoryCard error:', e);
      return false;
    }
  },

  update: function(index, keys, entry, type) {
    if (!this.available()) return false;
    try {
      updateStoryCard(index, keys, entry, type);
      if (state.lincoln && typeof state.lincoln.stateVersion === 'number') state.lincoln.stateVersion++;
      return true;
    } catch (e) {
      console.log('updateStoryCard error:', e);
      return false;
    }
  },

  remove: function(index) {
    if (!this.available()) return false;
    try {
      removeStoryCard(index);
      if (state.lincoln && typeof state.lincoln.stateVersion === 'number') state.lincoln.stateVersion++;
      return true;
    } catch (e) {
      console.log('removeStoryCard error:', e);
      return false;
    }
  }
};
