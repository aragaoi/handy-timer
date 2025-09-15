<template>
  <div class="status-panel" :class="{ active: isActive }">
    <div class="status-header">
      <h3>{{ $t("statusPanel.title") }}</h3>
      <div class="status-indicator" :class="statusClass">
        <div class="indicator-dot"></div>
        <span>{{ statusText }}</span>
      </div>
    </div>

    <div v-if="isActive" class="status-content">
      <!-- Simultaneous mode: show all timers -->
      <div v-if="executionMode === 'simultaneous'" class="all-timers">
        <div class="timers-header">
          <h4>{{ $t("statusPanel.allTimers") }}</h4>
          <div class="timers-summary">
            {{ activeTimersCount }} {{ $t("statusPanel.running") }} •
            {{ completedCount }} {{ $t("statusPanel.completed") }} •
            {{ pendingCount }} {{ $t("statusPanel.pending") }}
          </div>
        </div>
        <div class="timers-list">
          <div
            v-for="(timer, index) in allTimers"
            :key="timer.id"
            class="timer-item"
            :class="getTimerStatusClass(timer)"
          >
            <div class="timer-order">{{ index + 1 }}</div>
            <div class="timer-info">
              <div class="timer-name">{{ timer.name }}</div>
              <div class="timer-status">{{ getTimerStatusText(timer) }}</div>
              <div
                v-if="timer.running && !timer.completed"
                class="timer-countdown"
              >
                {{ getTimerCountdown(timer) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sequence mode: show current and next -->
      <div v-else class="sequence-timers">
        <div class="current-timer">
          <div class="timer-name">{{ currentTimerName }}</div>
          <div class="countdown">{{ countdown }}</div>
          <div class="timer-details">
            <span class="interval"
              >{{ $t("statusPanel.interval") }}: {{ intervalText }}</span
            >
            <span v-if="remainingCycles !== null" class="cycles">
              {{ $t("statusPanel.remainingCycles") }}: {{ remainingCycles }}
              <span
                v-if="
                  currentTimer?.enableWarningSound &&
                  remainingCycles <= currentTimer?.warningCycles
                "
                class="alert"
                >{{ $t("status.alert") }}</span
              >
            </span>
          </div>
        </div>

        <div v-if="nextTimer" class="next-timer">
          <div class="next-label">{{ $t("statusPanel.next") }}:</div>
          <div class="timer-name">{{ nextTimer.name }}</div>
        </div>

        <div class="sequence-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <div class="progress-text">
            {{ completedCount }} / {{ totalCount }}
            {{ $t("statusPanel.completed") }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="status-idle">
      <p>{{ $t("statusPanel.noActiveTimers") }}</p>
      <div class="timer-description">
        <h4>{{ $t("description.title") }}</h4>
        <p v-html="descriptionText"></p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

export default {
  name: "StatusPanel",
  props: {
    timers: {
      type: Array,
      default: () => [],
    },
    executionMode: {
      type: String,
      default: "sequence",
    },
    intervalMs: {
      type: Number,
      default: 30000,
    },
    maxMs: {
      type: Number,
      default: 0,
    },
    enableWarningSound: {
      type: Boolean,
      default: true,
    },
    warningCycles: {
      type: Number,
      default: 3,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const forceUpdate = ref(0);

    // Force update every 100ms to keep countdown reactive
    let intervalId = null;

    onMounted(() => {
      intervalId = setInterval(() => {
        forceUpdate.value++;
      }, 100);
    });

    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });

    const activeTimers = computed(() => {
      return props.timers.filter((timer) => timer.running && !timer.completed);
    });

    const isActive = computed(() => {
      return activeTimers.value.length > 0;
    });

    const currentTimer = computed(() => {
      if (props.executionMode === "sequence") {
        return activeTimers.value[0] || null;
      } else {
        // In simultaneous mode, show the first active timer or any running timer
        return (
          activeTimers.value[0] ||
          props.timers.find((timer) => timer.running) ||
          null
        );
      }
    });

    const currentTimerName = computed(() => {
      return currentTimer.value?.name || "";
    });

    const countdown = computed(() => {
      // Use forceUpdate to trigger reactivity
      forceUpdate.value;

      if (!currentTimer.value) return "00:00";

      const now = performance.now();
      const lastTarget = currentTimer.value.lastTarget || now;
      const intervalMs = currentTimer.value.intervalMs || 30000;

      const nextInMs = Math.max(0, lastTarget + intervalMs - now);
      const sec = Math.ceil(nextInMs / 1000);

      // Handle NaN values
      if (isNaN(sec) || !isFinite(sec)) return "00:00";

      const mm = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
      const ss = (sec % 60).toString().padStart(2, "0");

      return `${mm}:${ss}`;
    });

    const intervalText = computed(() => {
      if (!currentTimer.value) return "0s";
      return `${(currentTimer.value.intervalMs / 1000).toFixed(0)}s`;
    });

    const remainingCycles = computed(() => {
      if (!currentTimer.value || currentTimer.value.totalCycles === null)
        return null;
      return Math.max(
        0,
        currentTimer.value.totalCycles - currentTimer.value.cycleCount
      );
    });

    const statusClass = computed(() => {
      if (!isActive.value) return "idle";
      if (remainingCycles.value !== null && remainingCycles.value <= 3)
        return "alert";
      return "active";
    });

    const statusText = computed(() => {
      if (!isActive.value) return t("statusPanel.idle");
      if (remainingCycles.value !== null && remainingCycles.value <= 3)
        return t("statusPanel.alert");
      return t("statusPanel.running");
    });

    const completedCount = computed(() => {
      return props.timers.filter((timer) => timer.completed).length;
    });

    const totalCount = computed(() => {
      return props.timers.length;
    });

    const progressPercentage = computed(() => {
      if (totalCount.value === 0) return 0;
      return (completedCount.value / totalCount.value) * 100;
    });

    const activeTimersCount = computed(() => {
      return activeTimers.value.length;
    });

    const allTimers = computed(() => {
      return props.timers;
    });

    const pendingCount = computed(() => {
      return props.timers.filter((timer) => !timer.running && !timer.completed)
        .length;
    });

    const nextTimer = computed(() => {
      if (props.executionMode !== "sequence") return null;
      const completedTimers = props.timers.filter((timer) => timer.completed);
      const nextIndex = completedTimers.length;
      return props.timers[nextIndex + 1] || null;
    });

    const getTimerStatusClass = (timer) => {
      if (timer.completed) return "completed";
      if (timer.running) return "running";
      return "pending";
    };

    const getTimerStatusText = (timer) => {
      if (timer.completed) return t("statusPanel.completed");
      if (timer.running) return t("statusPanel.running");
      return t("statusPanel.pending");
    };

    const getTimerCountdown = (timer) => {
      if (!timer.running || timer.completed) return "00:00";

      // Access forceUpdate to ensure reactivity
      forceUpdate.value;

      const now = performance.now();
      const lastTarget = timer.lastTarget || now;
      const intervalMs = timer.intervalMs || 30000;

      const nextInMs = Math.max(0, lastTarget + intervalMs - now);
      const sec = Math.ceil(nextInMs / 1000);

      if (isNaN(sec) || !isFinite(sec)) return "00:00";

      const mm = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
      const ss = (sec % 60).toString().padStart(2, "0");

      return `${mm}:${ss}`;
    };

    const descriptionText = computed(() => {
      // Use current timer's interval if available, otherwise use first timer or props
      const currentTimerInterval = currentTimer.value?.intervalMs;
      const firstTimerInterval = props.timers[0]?.intervalMs;
      const intervalMs =
        currentTimerInterval || firstTimerInterval || props.intervalMs || 0;
      const intervalMinutes = Math.floor(intervalMs / 60000);
      const intervalSeconds = Math.floor((intervalMs % 60000) / 1000);

      let intervalText = "";
      if (intervalMinutes > 0) {
        intervalText += `${intervalMinutes}${t("description.minute")}`;
        if (intervalSeconds > 0) {
          intervalText += ` ${intervalSeconds}${t("description.second")}`;
        }
      } else {
        intervalText = `${intervalSeconds}${t("description.second")}`;
      }

      // Use current timer's maxMs if available, otherwise use first timer or props
      const currentTimerMaxMs = currentTimer.value?.maxMs;
      const firstTimerMaxMs = props.timers[0]?.maxMs;
      const maxMs = currentTimerMaxMs || firstTimerMaxMs || props.maxMs || 0;
      const maxTimeMinutes = Math.floor(maxMs / 60000);
      const maxTimeSeconds = Math.floor((maxMs % 60000) / 1000);

      let maxTimeText = "";
      if (maxTimeMinutes > 0) {
        maxTimeText += `${maxTimeMinutes}${t("description.minute")}`;
        if (maxTimeSeconds > 0) {
          maxTimeText += ` ${maxTimeSeconds}${t("description.second")}`;
        }
      } else if (maxTimeSeconds > 0) {
        maxTimeText = `${maxTimeSeconds}${t("description.second")}`;
      }

      // Use current timer's settings if available, otherwise use first timer or props
      const currentTimerEnableWarning = currentTimer.value?.enableWarningSound;
      const currentTimerWarningCycles = currentTimer.value?.warningCycles;
      const firstTimerEnableWarning = props.timers[0]?.enableWarningSound;
      const firstTimerWarningCycles = props.timers[0]?.warningCycles;

      const enableWarningSound =
        currentTimerEnableWarning !== undefined
          ? currentTimerEnableWarning
          : firstTimerEnableWarning !== undefined
          ? firstTimerEnableWarning
          : props.enableWarningSound;
      const warningCycles =
        currentTimerWarningCycles !== undefined
          ? currentTimerWarningCycles
          : firstTimerWarningCycles !== undefined
          ? firstTimerWarningCycles
          : props.warningCycles;

      let description = "";

      if (maxMs > 0) {
        const totalCycles = Math.floor(maxMs / intervalMs);
        description = t("description.withMaxTime", {
          interval: `<strong>${intervalText}</strong>`,
          maxTime: `<em>${maxTimeText}</em>`,
          totalCycles: totalCycles,
        });

        if (enableWarningSound && warningCycles > 0) {
          description += ` ${t("description.warningCycles", {
            cycles: warningCycles,
          })}`;
        }
      } else {
        // Without max time, only show warning sound if it's enabled
        if (enableWarningSound) {
          description =
            t("description.basic", {
              interval: `<strong>${intervalText}</strong>`,
            }) + ` ${t("description.warningEveryCycle")}`;
        } else {
          description = t("description.basic", {
            interval: `<strong>${intervalText}</strong>`,
          });
        }
      }

      return description;
    });

    return {
      isActive,
      currentTimerName,
      countdown,
      intervalText,
      remainingCycles,
      statusClass,
      statusText,
      completedCount,
      totalCount,
      progressPercentage,
      activeTimersCount,
      allTimers,
      pendingCount,
      nextTimer,
      getTimerStatusClass,
      getTimerStatusText,
      getTimerCountdown,
      descriptionText,
    };
  },
};
</script>

<style scoped>
.status-panel {
  background: #1a2332;
  border: 1px solid var(--muted);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.status-panel.active {
  border-color: var(--accent);
  box-shadow: 0 0 20px rgba(102, 194, 168, 0.2);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-indicator.idle {
  background: #6c757d;
  color: white;
}

.status-indicator.active {
  background: var(--accent);
  color: #0a1014;
}

.status-indicator.alert {
  background: #dc3545;
  color: white;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-timer {
  text-align: center;
}

.timer-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 8px;
}

.countdown {
  font-size: 48px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  margin-bottom: 12px;
  text-shadow: 0 0 20px rgba(102, 194, 168, 0.3);
}

.timer-details {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  color: #a7b3bf;
}

.timer-details span {
  padding: 4px 8px;
  background: #0e141b;
  border-radius: 6px;
  border: 1px solid var(--muted);
}

.timer-details .alert {
  color: #dc3545;
  border-color: #dc3545;
}

.sequence-info,
.simultaneous-info {
  background: #0e141b;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--muted);
}

.sequence-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #2a3441;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: #a7b3bf;
}

.active-timers {
  text-align: center;
  font-size: 14px;
  color: var(--fg);
  font-weight: 600;
  margin-bottom: 12px;
}

.timer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #1a2332;
  border-radius: 6px;
  border: 1px solid var(--muted);
}

.timer-item .timer-name {
  font-size: 12px;
  color: var(--fg);
  font-weight: 500;
}

.timer-item .timer-status {
  font-size: 11px;
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* All timers view */
.all-timers {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timers-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
}

.timers-summary {
  font-size: 12px;
  color: #a7b3bf;
}

.timers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.timer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #0e141b;
  border-radius: 8px;
  border: 1px solid var(--muted);
  transition: all 0.2s ease;
  min-width: 140px;
  flex: 1;
  max-width: 200px;
}

.timer-item.running {
  border-color: var(--accent);
  background: #0e141b;
}

.timer-item.completed {
  border-color: #28a745;
  background: #0e141b;
  opacity: 0.8;
}

.timer-item.pending {
  border-color: #6c757d;
  background: #0e141b;
  opacity: 0.6;
}

.timer-order {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--muted);
  color: var(--fg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.timer-item.running .timer-order {
  background: var(--accent);
  color: #0a1014;
}

.timer-item.completed .timer-order {
  background: #28a745;
  color: white;
}

.timer-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
  width: 100%;
}

.timer-info .timer-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
}

.timer-info .timer-status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer-item.running .timer-status {
  color: var(--accent);
}

.timer-item.completed .timer-status {
  color: #28a745;
}

.timer-item.pending .timer-status {
  color: #6c757d;
}

.timer-countdown {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
}

/* Sequence timers view */
.sequence-timers {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.next-timer {
  background: #0e141b;
  border: 1px solid var(--muted);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.next-label {
  font-size: 12px;
  color: #a7b3bf;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.next-timer .timer-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
}

.status-idle {
  text-align: center;
  padding: 20px;
  color: #a7b3bf;
}

.status-idle p {
  margin: 0;
  font-size: 14px;
}

.timer-description {
  margin-top: 20px;
  padding: 16px;
  background: #0e141b;
  border-radius: 8px;
  border: 1px solid var(--muted);
}

.timer-description h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
}

.timer-description p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #a7b3bf;
}

.timer-description p strong {
  color: var(--accent);
  font-weight: 600;
}

.timer-description p em {
  color: #e6f3ff;
  font-style: italic;
}

@media (max-width: 768px) {
  .countdown {
    font-size: 36px;
  }

  .timer-details {
    flex-direction: column;
    gap: 8px;
  }

  .status-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>
