import audioService from "./audioService.js";
import i18n from "../i18n";
import storageService from "./storageService.js";

class TimerService {
  constructor() {
    this.running = false;
    this.timerId = null;
    this.lastTarget = 0;
    this.cycleCount = 0;
    this.totalCycles = null;
    this.intervalMs = 0;
    this.volume = 0.4;
    this.warningCycles = 3;
    this.enableWarningSound = true;
    this.listeners = new Set();
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
      singleTimer: {
        minutes: Math.floor(this.intervalMs / 60000),
        seconds: Math.floor((this.intervalMs % 60000) / 1000),
        maxMinutes: Math.floor(this.maxMs / 60000),
        maxSeconds: Math.floor((this.maxMs % 60000) / 1000),
        volume: this.volume,
        enableWarningSound: this.enableWarningSound,
        warningCycles: this.warningCycles,
      },
    });
  }

  getState() {
    return {
      running: this.running,
      cycleCount: this.cycleCount,
      totalCycles: this.totalCycles,
      intervalMs: this.intervalMs,
      volume: this.volume,
      warningCycles: this.warningCycles,
      enableWarningSound: this.enableWarningSound,
      lastTarget: this.lastTarget,
      startTime: this.startTime,
      status: this.getStatus(),
    };
  }

  getStatus() {
    if (!this.running) return i18n.global.t("status.stopped");

    const now = performance.now();
    const nextInMs = Math.max(0, this.lastTarget + this.intervalMs - now);
    const sec = Math.ceil(nextInMs / 1000);
    const mm = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");

    let extra = ` | ${i18n.global.t("status.interval")}: ${(
      this.intervalMs / 1000
    ).toFixed(0)}s`;
    if (this.totalCycles !== null) {
      const remaining = Math.max(0, this.totalCycles - this.cycleCount);
      extra += ` | ${i18n.global.t("status.remainingCycles")}: ${remaining}`;
      if (this.enableWarningSound && remaining <= this.warningCycles) {
        extra += ` ${i18n.global.t("status.alert")}`;
      }
    }

    return `${i18n.global.t("status.nextIn")} ${mm}:${ss}${extra}`;
  }

  scheduleNext() {
    const now = performance.now();
    const next = this.lastTarget + this.intervalMs;
    const delay = Math.max(0, next - now);

    this.timerId = setTimeout(() => {
      if (this.enableWarningSound) {
        if (this.totalCycles !== null) {
          const remainingAfterThis = this.totalCycles - 1 - this.cycleCount;
          if (remainingAfterThis < this.warningCycles) {
            audioService.pingAlt(this.volume);
          } else {
            audioService.ping(this.volume);
          }
        } else {
          // No max time set - play warning at the end of each cycle
          audioService.pingAlt(this.volume);
        }
      } else {
        audioService.ping(this.volume);
      }

      this.cycleCount++;
      this.lastTarget = next;

      if (this.totalCycles !== null && this.cycleCount >= this.totalCycles) {
        audioService.pingFinal(this.volume);
        this.stop(true);
        return;
      }

      this.notify();
      this.scheduleNext();
    }, delay);
  }

  start(intervalMs, maxMs = 0) {
    if (this.running) return false;

    if (intervalMs <= 0) {
      alert(i18n.global.t("alerts.invalidInterval"));
      return false;
    }

    this.intervalMs = intervalMs;

    if (maxMs > 0) {
      this.totalCycles = Math.floor(maxMs / intervalMs);
      if (this.totalCycles <= 0) {
        alert(i18n.global.t("alerts.invalidMaxTime"));
        return false;
      }
    } else {
      this.totalCycles = null;
    }

    this.running = true;
    this.cycleCount = 0;
    this.startTime = performance.now();
    this.lastTarget = this.startTime;
    this.notify();
    this.scheduleNext();

    // Update lastTarget continuously for countdown
    this.updateInterval = setInterval(() => {
      if (this.running) {
        this.lastTarget = this.startTime + this.cycleCount * this.intervalMs;
        this.notify();
      }
    }, 100);

    return true;
  }

  stop(completed = false) {
    this.running = false;
    clearTimeout(this.timerId);
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.notify();
  }

  setVolume(volume) {
    this.volume = volume;
    this.notify();
  }

  setWarningCycles(warningCycles) {
    this.warningCycles = warningCycles;
    this.notify();
  }

  setEnableWarningSound(enableWarningSound) {
    this.enableWarningSound = enableWarningSound;
    this.notify();
  }

  testSound() {
    audioService.ping(this.volume);
  }
}

export default new TimerService();
