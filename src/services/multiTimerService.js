import audioService from "./audioService.js";
import i18n from "../i18n";
import storageService from "./storageService.js";

class MultiTimerService {
  constructor() {
    this.timers = new Map();
    this.nextId = 1;
    this.listeners = new Set();
    this.executionMode = "sequence"; // "sequence" or "simultaneous"
    this.repeatSequence = false; // repeat entire sequence indefinitely
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((callback) => callback(state));
    this.saveToStorage();
  }

  saveToStorage() {
    storageService.saveState({
      multiTimers: Array.from(this.timers.values()).map((timer) => ({
        id: timer.id,
        name: timer.name,
        intervalMs: timer.intervalMs,
        maxMs: timer.maxMs,
        volume: timer.volume,
        warningCycles: timer.warningCycles,
        enableWarningSound: timer.enableWarningSound,
        running: false, // Don't save running state
        completed: false, // Don't save completed state
        cycleCount: 0, // Reset cycle count
        totalCycles: null,
        lastTarget: 0,
        timerId: null,
      })),
      executionMode: this.executionMode,
      repeatSequence: this.repeatSequence,
    });
  }

  getState() {
    return {
      timers: Array.from(this.timers.values()),
      executionMode: this.executionMode,
      repeatSequence: this.repeatSequence,
      isRunning: this.isAnyRunning(),
    };
  }

  createTimer(config = {}) {
    const id = this.nextId++;
    const timer = {
      id,
      name: config.name || `Timer ${id}`,
      intervalMs: config.intervalMs || 30000,
      maxMs: config.maxMs || 0,
      volume: config.volume || 0.4,
      warningCycles: config.warningCycles || 3,
      enableWarningSound: config.enableWarningSound !== false,
      running: false,
      cycleCount: 0,
      totalCycles: null,
      lastTarget: 0,
      timerId: null,
      completed: false,
    };

    this.timers.set(id, timer);
    this.notify();
    return id;
  }

  createTimerAt(index, config = {}) {
    const id = this.nextId++;
    const timer = {
      id,
      name: config.name || `Timer ${id}`,
      intervalMs: config.intervalMs || 30000,
      maxMs: config.maxMs || 0,
      volume: config.volume || 0.4,
      warningCycles: config.warningCycles || 3,
      enableWarningSound: config.enableWarningSound !== false,
      running: false,
      cycleCount: 0,
      totalCycles: null,
      lastTarget: 0,
      timerId: null,
      completed: false,
    };

    // Convert Map to array, insert at index, then recreate Map
    const timersArray = Array.from(this.timers.values());
    timersArray.splice(index, 0, timer);

    this.timers.clear();
    timersArray.forEach((t) => this.timers.set(t.id, t));

    this.notify();
    return id;
  }

  updateTimer(id, updates) {
    const timer = this.timers.get(id);
    if (!timer) return false;

    Object.assign(timer, updates);
    this.notify();
    return true;
  }

  deleteTimer(id) {
    const timer = this.timers.get(id);
    if (!timer) return false;

    if (timer.running) {
      this.stopTimer(id);
    }

    this.timers.delete(id);
    this.notify();
    return true;
  }

  setExecutionMode(mode) {
    this.executionMode = mode;
    this.notify();
  }

  setRepeatSequence(repeat) {
    this.repeatSequence = repeat;
    this.notify();
  }

  isAnyRunning() {
    return Array.from(this.timers.values()).some((timer) => timer.running);
  }

  startAll() {
    if (this.executionMode === "simultaneous") {
      this.timers.forEach((timer) => {
        if (!timer.completed) {
          this.startTimer(timer.id);
        }
      });
    } else {
      this.startSequence();
    }
  }

  startSequence() {
    const activeTimers = Array.from(this.timers.values())
      .filter((timer) => !timer.completed)
      .sort((a, b) => a.id - b.id);

    if (activeTimers.length === 0) return;

    this.startTimer(activeTimers[0].id);
  }

  startTimer(id) {
    const timer = this.timers.get(id);
    if (!timer || timer.running) return false;

    if (timer.intervalMs <= 0) {
      alert(i18n.global.t("alerts.invalidInterval"));
      return false;
    }

    if (timer.maxMs > 0) {
      timer.totalCycles = Math.floor(timer.maxMs / timer.intervalMs);
      if (timer.totalCycles <= 0) {
        alert(i18n.global.t("alerts.invalidMaxTime"));
        return false;
      }
    } else {
      timer.totalCycles = null;
    }

    timer.running = true;
    timer.cycleCount = 0;
    timer.lastTarget = performance.now();
    timer.completed = false;

    this.scheduleNext(timer);
    this.notify();
    return true;
  }

  stopTimer(id) {
    const timer = this.timers.get(id);
    if (!timer) return false;

    timer.running = false;
    clearTimeout(timer.timerId);
    this.notify();
    return true;
  }

  stopAll() {
    this.timers.forEach((timer) => {
      if (timer.running) {
        this.stopTimer(timer.id);
      }
    });
  }

  scheduleNext(timer) {
    const now = performance.now();
    const next = timer.lastTarget + timer.intervalMs;
    const delay = Math.max(0, next - now);

    timer.timerId = setTimeout(() => {
      if (timer.enableWarningSound) {
        if (timer.totalCycles !== null) {
          const remainingAfterThis = timer.totalCycles - 1 - timer.cycleCount;
          if (remainingAfterThis < timer.warningCycles) {
            audioService.pingAlt(timer.volume);
          } else {
            audioService.ping(timer.volume);
          }
        } else {
          // No max time set - play warning at the end of each cycle
          audioService.pingAlt(timer.volume);
        }
      } else {
        audioService.ping(timer.volume);
      }

      timer.cycleCount++;
      timer.lastTarget = next;

      if (timer.totalCycles !== null && timer.cycleCount >= timer.totalCycles) {
        audioService.pingFinal(timer.volume);
        timer.completed = true;
        timer.running = false;
        this.notify();

        if (this.executionMode === "sequence") {
          this.startNextInSequence(timer.id);
        }
        return;
      }

      // In sequence mode, timers without max time should complete after one cycle
      if (this.executionMode === "sequence" && timer.totalCycles === null) {
        timer.completed = true;
        timer.running = false;
        this.notify();
        this.startNextInSequence(timer.id);
        return;
      }

      this.scheduleNext(timer);
    }, delay);
  }

  startNextInSequence(currentId) {
    const activeTimers = Array.from(this.timers.values())
      .filter((timer) => !timer.completed && timer.id !== currentId)
      .sort((a, b) => a.id - b.id);

    if (activeTimers.length > 0) {
      this.startTimer(activeTimers[0].id);
    } else if (this.repeatSequence) {
      // All timers completed, restart the sequence
      this.restartSequence();
    }
  }

  restartSequence() {
    // Reset all timers and start the first one immediately
    Array.from(this.timers.values()).forEach((timer) => {
      timer.completed = false;
      timer.running = false;
      timer.cycleCount = 0;
      timer.lastTarget = 0;
      if (timer.timerId) {
        clearTimeout(timer.timerId);
        timer.timerId = null;
      }
    });

    this.notify();

    // Start the first timer immediately
    const firstTimer = Array.from(this.timers.values()).sort(
      (a, b) => a.id - b.id
    )[0];
    if (firstTimer) {
      this.startTimer(firstTimer.id);
    }
  }

  getTimerStatus(timer) {
    if (!timer.running) return i18n.global.t("status.stopped");
    if (timer.completed) return i18n.global.t("status.completed");

    const now = performance.now();
    const nextInMs = Math.max(0, timer.lastTarget + timer.intervalMs - now);
    const sec = Math.ceil(nextInMs / 1000);
    const mm = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");

    let extra = ` | ${i18n.global.t("status.interval")}: ${(
      timer.intervalMs / 1000
    ).toFixed(0)}s`;
    if (timer.totalCycles !== null) {
      const remaining = Math.max(0, timer.totalCycles - timer.cycleCount);
      extra += ` | ${i18n.global.t("status.remainingCycles")}: ${remaining}`;
      if (timer.enableWarningSound && remaining <= timer.warningCycles) {
        extra += ` ${i18n.global.t("status.alert")}`;
      }
    }

    return `${i18n.global.t("status.nextIn")} ${mm}:${ss}${extra}`;
  }

  testSound(volume = 0.4) {
    audioService.ping(volume);
  }
}

export default new MultiTimerService();
