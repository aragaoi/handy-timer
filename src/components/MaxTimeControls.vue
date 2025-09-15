<template>
  <div class="max-time-section">
    <div class="max-time-header">
      <label class="enable-max-time-label">
        <input
          type="checkbox"
          v-model="enableMaxTime"
          @change="onEnableMaxTimeChange"
          :disabled="running"
        />
        {{ $t("controls.enableMaxTime") }}
      </label>
    </div>
    
    <div v-if="enableMaxTime" class="max-time-inputs">
      <div class="row" style="margin-bottom: 10px">
        <label for="maxMinutes">{{ $t("controls.maxTime") }}</label>
        <input
          id="maxMinutes"
          type="number"
          min="0"
          v-model.number="maxMinutes"
          :disabled="running"
          :aria-label="$t('controls.maxMinutes')"
        />
        <span>{{ $t("controls.minutes") }}</span>
        <input
          id="maxSeconds"
          type="number"
          min="0"
          max="59"
          v-model.number="maxSeconds"
          :disabled="running"
          :aria-label="$t('controls.maxSeconds')"
        />
        <span>{{ $t("controls.seconds") }}</span>
      </div>
    </div>
  </div>

  <div v-if="enableMaxTime" class="row warning-settings">
    <label class="warning-label">
      <input
        type="checkbox"
        v-model="enableWarningSound"
        @change="updateWarningSettings"
        :disabled="running"
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
        :disabled="running"
        @input="updateWarningSettings"
        class="warning-slider"
      />
      <span class="warning-value">{{ warningCycles }} {{ $t("controls.cycles") }}</span>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from "vue";

export default {
  name: "MaxTimeControls",
  props: {
    running: {
      type: Boolean,
      default: false,
    },
    intervalMs: {
      type: Number,
      default: 30000,
    },
  },
  emits: ["update:maxMinutes", "update:maxSeconds", "update:warningSettings", "update:enableMaxTime"],
  setup(props, { emit }) {
    const enableMaxTime = ref(false);
    const maxMinutes = ref(0);
    const maxSeconds = ref(0);
    const enableWarningSound = ref(true);
    const warningCycles = ref(3);

    const maxWarningCycles = computed(() => {
      if (!enableMaxTime.value) return 0;
      
      const maxMs = (maxMinutes.value * 60 + maxSeconds.value) * 1000;
      if (maxMs > 0) {
        // Calculate based on max time and interval from parent
        const intervalMs = props.intervalMs;
        const totalCycles = Math.floor(maxMs / intervalMs);
        return Math.max(0, totalCycles); // Can warn on all cycles including the last one
      }
      return 0;
    });

    watch(maxMinutes, (newValue) => {
      emit("update:maxMinutes", newValue);
    });

    watch(maxSeconds, (newValue) => {
      emit("update:maxSeconds", newValue);
    });

    // Watch for changes in max time that might affect warning cycles
    watch([maxMinutes, maxSeconds], () => {
      // If current warning cycles exceed the new maximum, adjust it
      if (warningCycles.value > maxWarningCycles.value) {
        warningCycles.value = Math.max(0, maxWarningCycles.value);
        updateWarningSettings();
      }
    });

    const onEnableMaxTimeChange = () => {
      emit("update:enableMaxTime", enableMaxTime.value);
      
      // If max time is disabled, disable warning sound
      if (!enableMaxTime.value) {
        enableWarningSound.value = false;
        updateWarningSettings();
      }
    };

    const updateWarningSettings = () => {
      emit("update:warningSettings", {
        enableWarningSound: enableWarningSound.value,
        warningCycles: warningCycles.value,
      });
    };

    return {
      enableMaxTime,
      maxMinutes,
      maxSeconds,
      enableWarningSound,
      warningCycles,
      maxWarningCycles,
      onEnableMaxTimeChange,
      updateWarningSettings,
    };
  },
};
</script>

<style scoped>
.max-time-section {
  margin-bottom: 16px;
}

.max-time-header {
  margin-bottom: 12px;
}

.enable-max-time-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: var(--fg);
}

.enable-max-time-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.max-time-inputs {
  margin-left: 20px;
  padding-left: 16px;
  border-left: 2px solid var(--muted);
}

.warning-settings {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--muted);
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.warning-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  cursor: pointer;
}

.warning-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.warning-cycles {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px;
}

.warning-cycles label {
  font-size: 12px;
  min-width: auto;
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
