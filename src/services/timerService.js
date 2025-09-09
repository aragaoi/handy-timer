import audioService from "./audioService.js";
import i18n from "../i18n";

class TimerService {
  constructor() {
    this.running = false;
    this.timerId = null;
    this.lastTarget = 0;
    this.cycleCount = 0;
    this.totalCycles = null;
    this.intervalMs = 0;
    this.volume = 0.4;
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((callback) => callback(this.getState()));
  }

  getState() {
    return {
      running: this.running,
      cycleCount: this.cycleCount,
      totalCycles: this.totalCycles,
      intervalMs: this.intervalMs,
      volume: this.volume,
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
      if (remaining <= 3) extra += ` ${i18n.global.t("status.alert")}`;
    }

    return `${i18n.global.t("status.nextIn")} ${mm}:${ss}${extra}`;
  }

  scheduleNext() {
    const now = performance.now();
    const next = this.lastTarget + this.intervalMs;
    const delay = Math.max(0, next - now);

    this.timerId = setTimeout(() => {
      if (this.totalCycles !== null) {
        const remainingAfterThis = this.totalCycles - 1 - this.cycleCount;
        if (remainingAfterThis <= 2) {
          audioService.pingAlt(this.volume);
        } else {
          audioService.ping(this.volume);
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
    this.lastTarget = performance.now();
    this.notify();
    this.scheduleNext();
    return true;
  }

  stop(completed = false) {
    this.running = false;
    clearTimeout(this.timerId);
    this.notify();
  }

  setVolume(volume) {
    this.volume = volume;
    this.notify();
  }

  testSound() {
    audioService.ping(this.volume);
  }
}

export default new TimerService();
