<template>
  <div class="row" style="margin-bottom: 10px">
    <label for="minutes">{{ $t("controls.interval") }}</label>
    <input
      id="minutes"
      type="number"
      min="0"
      v-model.number="minutes"
      :disabled="running"
      :aria-label="$t('controls.minutes')"
    />
    <span>{{ $t("controls.minutes") }}</span>
    <input
      id="seconds"
      type="number"
      min="0"
      max="59"
      v-model.number="seconds"
      :disabled="running"
      :aria-label="$t('controls.seconds')"
    />
    <span>{{ $t("controls.seconds") }}</span>

    <div class="spacer"></div>

    <label for="volume">{{ $t("controls.volume") }}</label>
    <input
      id="volume"
      type="range"
      min="0"
      max="1"
      step="0.01"
      v-model.number="volume"
      @input="onVolumeChange"
    />
    
    <button @click="testSound" class="test-btn">
      {{ $t("buttons.testSound") }}
    </button>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import audioService from "../services/audioService.js";

export default {
  name: "TimerControls",
  props: {
    running: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:minutes", "update:seconds", "volume-change"],
  setup(props, { emit }) {
    const minutes = ref(0);
    const seconds = ref(30);
    const volume = ref(0.4);

    watch(minutes, (newValue) => {
      emit("update:minutes", newValue);
    });

    watch(seconds, (newValue) => {
      emit("update:seconds", newValue);
    });

    const onVolumeChange = () => {
      emit("volume-change", volume.value);
    };

    const testSound = () => {
      audioService.ping(volume.value);
    };

    return {
      minutes,
      seconds,
      volume,
      onVolumeChange,
      testSound,
    };
  },
};
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.spacer {
  flex: 1;
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
</style>
