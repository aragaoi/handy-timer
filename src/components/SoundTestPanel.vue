<template>
  <div class="sound-test-panel" :class="{ expanded: expanded }">
    <button
      @click="togglePanel"
      class="panel-toggle"
      :title="$t('soundTest.testSounds')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
        />
      </svg>
      <span class="button-label">{{ $t("soundTest.testSounds") }}</span>
    </button>

    <div v-if="expanded" class="panel-content">
      <h4>{{ $t("soundTest.testSounds") }}</h4>

      <div class="sound-buttons">
        <button
          @click="testPing"
          class="sound-btn ping-btn"
          :title="$t('soundTest.ping')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
          {{ $t("soundTest.ping") }}
        </button>

        <button
          @click="testPingAlt"
          class="sound-btn ping-alt-btn"
          :title="$t('soundTest.pingAlt')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
          {{ $t("soundTest.pingAlt") }}
        </button>

        <button
          @click="testPingFinal"
          class="sound-btn ping-final-btn"
          :title="$t('soundTest.pingFinal')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"
            />
          </svg>
          {{ $t("soundTest.pingFinal") }}
        </button>
      </div>

      <div class="volume-control">
        <label>{{ $t("soundTest.volume") }}:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          v-model.number="testVolume"
          class="volume-slider"
        />
        <span class="volume-value">{{ Math.round(testVolume * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import audioService from "../services/audioService.js";

export default {
  name: "SoundTestPanel",
  setup() {
    const expanded = ref(false);
    const testVolume = ref(0.4);

    const togglePanel = () => {
      expanded.value = !expanded.value;
    };

    const testPing = () => {
      audioService.ping(testVolume.value);
    };

    const testPingAlt = () => {
      audioService.pingAlt(testVolume.value);
    };

    const testPingFinal = () => {
      audioService.pingFinal(testVolume.value);
    };

    return {
      expanded,
      testVolume,
      togglePanel,
      testPing,
      testPingAlt,
      testPingFinal,
    };
  },
};
</script>

<style scoped>
.sound-test-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.panel-toggle {
  background: var(--accent);
  color: #0a1014;
  border: none;
  border-radius: 24px;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.panel-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.panel-toggle:active {
  transform: scale(0.95);
}

.button-label {
  font-size: 14px;
  font-weight: 600;
}

.panel-content {
  position: absolute;
  top: 60px;
  right: 0;
  background: #1a2332;
  border: 1px solid var(--muted);
  border-radius: 12px;
  padding: 20px;
  min-width: 280px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
}

.panel-content h4 {
  margin: 0 0 16px 0;
  color: var(--fg);
  font-size: 16px;
  font-weight: 600;
}

.sound-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.sound-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--muted);
  border-radius: 8px;
  background: #0e141b;
  color: var(--fg);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.sound-btn:hover {
  background: #2a3441;
  border-color: var(--accent);
  transform: translateX(4px);
}

.ping-btn:hover {
  color: #4caf50;
}

.ping-alt-btn:hover {
  color: #ff9800;
}

.ping-final-btn:hover {
  color: #f44336;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.volume-control label {
  color: var(--fg);
  font-weight: 500;
  min-width: 50px;
}

.volume-slider {
  flex: 1;
  height: 4px;
  background: #2a3441;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.volume-value {
  color: var(--muted);
  font-weight: 500;
  min-width: 35px;
  text-align: right;
}

@media (max-width: 768px) {
  .sound-test-panel {
    top: 10px;
    right: 10px;
  }

  .panel-content {
    min-width: 260px;
    right: -10px;
  }
}
</style>
