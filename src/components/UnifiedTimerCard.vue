<template>
  <div class="unified-timer-card" :class="{ completed: timer?.completed }">
    <div v-if="showHeader" class="timer-header">
      <input
        v-model="timerName"
        @blur="updateName"
        @keyup.enter="updateName"
        class="timer-name-input"
        :disabled="timer?.running"
        :placeholder="$t('timerCard.timerName')"
      />
      <button
        v-if="showDeleteButton"
        @click="deleteTimer"
        class="delete-btn"
        :disabled="timer?.running"
        :title="$t('multiTimer.removeTimer')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
          />
        </svg>
      </button>
    </div>

    <div class="timer-controls">
      <!-- Interval Controls -->
      <div class="row">
        <label>{{ $t("controls.interval") }}:</label>
        <input
          type="number"
          min="0"
          v-model.number="minutes"
          :disabled="timer?.running"
          @change="updateTimer"
        />
        <span>{{ $t("controls.minutes") }}</span>
        <input
          type="number"
          min="0"
          max="59"
          v-model.number="seconds"
          :disabled="timer?.running"
          @change="updateTimer"
        />
        <span>{{ $t("controls.seconds") }}</span>
      </div>

      <!-- Max Time Section -->
      <div class="row max-time-section">
        <label class="max-time-header">
          <input
            type="checkbox"
            v-model="enableMaxTime"
            @change="onEnableMaxTimeChange"
            :disabled="timer?.running"
          />
          {{ $t("controls.enableMaxTime") }}
        </label>
        <div v-if="enableMaxTime" class="max-time-inputs">
          <label>{{ $t("controls.maxTime") }}:</label>
          <input
            type="number"
            min="0"
            v-model.number="maxMinutes"
            :disabled="timer?.running"
            @change="updateTimer"
          />
          <span>{{ $t("controls.minutes") }}</span>
          <input
            type="number"
            min="0"
            max="59"
            v-model.number="maxSeconds"
            :disabled="timer?.running"
            @change="updateTimer"
          />
          <span>{{ $t("controls.seconds") }}</span>
        </div>
      </div>

      <!-- Volume Controls -->
      <div class="row">
        <label>{{ $t("controls.volume") }}:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model.number="volume"
          :disabled="timer?.running"
          @input="updateVolume"
        />
        <button @click="testSound" class="test-btn">
          {{ $t("buttons.testSound") }}
        </button>
      </div>

      <!-- Warning Settings -->
      <div v-if="enableMaxTime" class="row warning-settings">
        <label class="warning-label">
          <input
            type="checkbox"
            v-model="enableWarningSound"
            @change="updateWarningSettings"
            :disabled="timer?.running"
          />
          {{ $t("controls.enableWarningSound") }}
        </label>
        <div v-if="enableWarningSound" class="warning-cycles">
          <label>{{ $t("controls.warningCycles") }}:</label>
          <input
            type="range"
            :min="0"
            :max="maxWarningCycles"
            v-model.number="warningCycles"
            :disabled="timer?.running"
            @input="updateWarningSettings"
            class="warning-slider"
          />
          <span class="warning-value"
            >{{ warningCycles }} {{ $t("controls.cycles") }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import audioService from "../services/audioService.js";

export default {
  name: "UnifiedTimerCard",
  props: {
    timer: {
      type: Object,
      default: null,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    showDeleteButton: {
      type: Boolean,
      default: false,
    },
    // For single timer mode
    singleMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update", "delete", "test"],
  setup(props, { emit }) {
    const { t } = useI18n();

    // Initialize values from timer or defaults
    const timerName = ref(props.timer?.name || "Timer");
    const minutes = ref(
      props.timer
        ? Math.floor(props.timer.intervalMs / 60000)
        : 0
    );
    const seconds = ref(
      props.timer
        ? Math.floor((props.timer.intervalMs % 60000) / 1000)
        : 30
    );
    const enableMaxTime = ref(props.timer?.maxMs > 0);
    const maxMinutes = ref(
      props.timer
        ? Math.floor(props.timer.maxMs / 60000)
        : 0
    );
    const maxSeconds = ref(
      props.timer
        ? Math.floor((props.timer.maxMs % 60000) / 1000)
        : 0
    );
    const volume = ref(props.timer?.volume || 0.4);
    const enableWarningSound = ref(props.timer?.enableWarningSound || false);
    const warningCycles = ref(props.timer?.warningCycles || 3);

    const maxWarningCycles = computed(() => {
      if (enableMaxTime.value && (props.timer?.intervalMs || (minutes.value * 60 + seconds.value) * 1000) > 0) {
        const maxMs = (maxMinutes.value * 60 + maxSeconds.value) * 1000;
        const intervalMs = props.timer?.intervalMs || (minutes.value * 60 + seconds.value) * 1000;
        const totalCycles = Math.floor(maxMs / intervalMs);
        return Math.max(0, totalCycles);
      }
      return 0;
    });

    const updateName = () => {
      emit("update", { name: timerName.value });
    };

    const updateTimer = () => {
      const intervalMs = (minutes.value * 60 + seconds.value) * 1000;
      const maxMs = enableMaxTime.value ? (maxMinutes.value * 60 + maxSeconds.value) * 1000 : 0;
      emit("update", { intervalMs, maxMs });
    };

    const onEnableMaxTimeChange = () => {
      if (!enableMaxTime.value) {
        enableWarningSound.value = false;
        updateWarningSettings();
      }
      updateTimer();
    };

    const updateVolume = () => {
      emit("update", { volume: volume.value });
    };

    const updateWarningSettings = () => {
      emit("update", {
        enableWarningSound: enableWarningSound.value,
        warningCycles: warningCycles.value,
      });
    };

    const testSound = () => {
      audioService.ping(volume.value);
    };

    const deleteTimer = () => {
      emit("delete");
    };

    // Watch for changes in max time that might affect warning cycles
    watch([maxMinutes, maxSeconds], () => {
      if (warningCycles.value > maxWarningCycles.value) {
        warningCycles.value = Math.max(0, maxWarningCycles.value);
        updateWarningSettings();
      }
    });

    return {
      timerName,
      minutes,
      seconds,
      enableMaxTime,
      maxMinutes,
      maxSeconds,
      volume,
      enableWarningSound,
      warningCycles,
      maxWarningCycles,
      updateName,
      updateTimer,
      onEnableMaxTimeChange,
      updateVolume,
      updateWarningSettings,
      testSound,
      deleteTimer,
    };
  },
};
</script>

<style scoped>
.unified-timer-card {
  background: #0e141b;
  border: 1px solid var(--muted);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.unified-timer-card.completed {
  opacity: 0.7;
  border-color: #28a745;
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.timer-name-input {
  background: transparent;
  border: none;
  color: var(--fg);
  font-size: 16px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  flex: 1;
  margin-right: 12px;
}

.timer-name-input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.timer-name-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timer-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

label {
  font-size: 12px;
  color: #a7b3bf;
  font-weight: 500;
  min-width: auto;
}

input[type="number"] {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid var(--muted);
  border-radius: 4px;
  background: #0e141b;
  color: var(--fg);
  font-size: 14px;
  text-align: center;
}

input[type="range"] {
  flex: 1;
  margin: 0 8px;
  height: 6px;
  background: #2a3441;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.test-btn {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.test-btn:hover {
  background: #5a6268;
}

.test-btn:active {
  background: #495057;
}

/* Max time section styles */
.max-time-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.max-time-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--fg);
  cursor: pointer;
}

.max-time-header input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
}

.max-time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 24px;
  flex-wrap: wrap;
}

.max-time-inputs label {
  font-size: 12px;
  color: #a7b3bf;
  font-weight: 500;
  min-width: auto;
}

.warning-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--fg);
  cursor: pointer;
}

.warning-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
}

.warning-cycles {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 24px;
  flex-wrap: wrap;
}

.warning-slider {
  flex: 1;
  margin: 0 8px;
  height: 6px;
  background: #2a3441;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.warning-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.warning-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.warning-value {
  font-size: 12px;
  opacity: 0.9;
  min-width: 60px;
  text-align: right;
}

.warning-cycles {
  margin-bottom: 16px;
}
</style>






