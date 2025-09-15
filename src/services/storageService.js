const STORAGE_KEY = "handy-timer-state";

class StorageService {
  saveState(state) {
    try {
      const stateToSave = {
        singleTimer: {
          minutes: state.singleTimer?.minutes || 0,
          seconds: state.singleTimer?.seconds || 30,
          maxMinutes: state.singleTimer?.maxMinutes || 0,
          maxSeconds: state.singleTimer?.maxSeconds || 0,
          volume: state.singleTimer?.volume || 0.4,
          enableWarningSound: state.singleTimer?.enableWarningSound !== false,
          warningCycles: state.singleTimer?.warningCycles || 3,
        },
        multiTimers: state.multiTimers || [],
        executionMode: state.executionMode || "sequence",
        currentMode: state.currentMode || "single",
        language: state.language || "pt-BR",
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      return true;
    } catch (error) {
      console.warn("Failed to save state to localStorage:", error);
      return false;
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const parsed = JSON.parse(saved);

      // Check if data is not too old (30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      if (Date.now() - parsed.timestamp > maxAge) {
        this.clearState();
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn("Failed to load state from localStorage:", error);
      this.clearState();
      return null;
    }
  }

  clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn("Failed to clear state from localStorage:", error);
      return false;
    }
  }

  hasState() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
}

export default new StorageService();

