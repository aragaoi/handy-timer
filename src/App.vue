<template>
  <div class="card">
    <div class="header">
      <div class="title-section">
        <h1>{{ $t("app.title") }}</h1>
        <p class="subtitle">{{ $t("app.subtitle") }}</p>
      </div>
      <LanguageSelector />
    </div>

    <div class="mode-selector">
      <button 
        @click="setMode('single')" 
        :class="{ active: mode === 'single' }"
        class="mode-btn"
      >
        {{ $t("app.singleTimer") }}
      </button>
      <button 
        @click="setMode('multi')" 
        :class="{ active: mode === 'multi' }"
        class="mode-btn"
      >
        {{ $t("app.multiTimer") }}
      </button>
    </div>

    <div v-if="mode === 'single'" class="single-timer">
      <StatusPanel 
        :timers="[singleTimerData]"
        :executionMode="'single'"
        :intervalMs="(minutes * 60 + seconds) * 1000"
        :maxMs="enableMaxTime ? (maxMinutes * 60 + maxSeconds) * 1000 : 0"
        :enableWarningSound="enableMaxTime ? timerState.enableWarningSound : false"
        :warningCycles="enableMaxTime ? timerState.warningCycles : 0"
      />

      <div class="single-timer-controls">
        <TimerButtons
          :running="timerState.running"
          @start="onStart"
          @stop="onStop"
        />
      </div>

      <div class="timer-controls-section">
        <UnifiedTimerCard
          :timer="singleTimerData"
          :show-header="false"
          :show-delete-button="false"
          :single-mode="true"
          @update="onSingleTimerUpdate"
        />
      </div>


    </div>

    <div v-if="mode === 'multi'" class="multi-timer">
      <MultiTimerManager />
    </div>

    <SoundTestPanel />
    <ResetButton />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from "vue";
import TimerButtons from "./components/TimerButtons.vue";
import LanguageSelector from "./components/LanguageSelector.vue";
import MultiTimerManager from "./components/MultiTimerManager.vue";
import StatusPanel from "./components/StatusPanel.vue";
import SoundTestPanel from "./components/SoundTestPanel.vue";
import ResetButton from "./components/ResetButton.vue";
import UnifiedTimerCard from "./components/UnifiedTimerCard.vue";
import timerService from "./services/timerService.js";
import multiTimerService from "./services/multiTimerService.js";
import storageService from "./services/storageService.js";

export default {
  name: "App",
  components: {
    TimerButtons,
    LanguageSelector,
    MultiTimerManager,
    StatusPanel,
    SoundTestPanel,
    ResetButton,
    UnifiedTimerCard,
  },
  setup() {
    const timerState = ref(timerService.getState());
    const minutes = ref(0);
    const seconds = ref(30);
    const maxMinutes = ref(0);
    const maxSeconds = ref(0);
    const enableMaxTime = ref(false);
    const mode = ref("single");

    // Load saved state on initialization
    const loadSavedState = () => {
      const savedState = storageService.loadState();
      if (savedState) {
        // Load single timer settings
        if (savedState.singleTimer) {
          minutes.value = savedState.singleTimer.minutes || 0;
          seconds.value = savedState.singleTimer.seconds || 30;
          maxMinutes.value = savedState.singleTimer.maxMinutes || 0;
          maxSeconds.value = savedState.singleTimer.maxSeconds || 0;
          
          // Apply settings to timer service
          timerService.setVolume(savedState.singleTimer.volume || 0.4);
          timerService.setEnableWarningSound(savedState.singleTimer.enableWarningSound !== false);
          timerService.setWarningCycles(savedState.singleTimer.warningCycles || 3);
        }

        // Load multi-timer settings
        if (savedState.multiTimers && savedState.multiTimers.length > 0) {
          // Clear existing timers
          multiTimerService.timers.clear();
          multiTimerService.nextId = 1;
          
          // Restore timers
          savedState.multiTimers.forEach(timerData => {
            multiTimerService.createTimer({
              name: timerData.name,
              intervalMs: timerData.intervalMs,
              maxMs: timerData.maxMs,
              volume: timerData.volume,
              warningCycles: timerData.warningCycles,
              enableWarningSound: timerData.enableWarningSound,
            });
          });
          
          // Set execution mode
          if (savedState.executionMode) {
            multiTimerService.setExecutionMode(savedState.executionMode);
          }
        }

        // Load current mode
        if (savedState.currentMode) {
          mode.value = savedState.currentMode;
        }
      }
    };

    let unsubscribe = null;

    onMounted(() => {
      loadSavedState();
      unsubscribe = timerService.subscribe((state) => {
        timerState.value = state;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    const onMinutesChange = (value) => {
      minutes.value = value;
    };

    const onSecondsChange = (value) => {
      seconds.value = value;
    };

    const onMaxMinutesChange = (value) => {
      maxMinutes.value = value;
    };

    const onMaxSecondsChange = (value) => {
      maxSeconds.value = value;
    };

    const onVolumeChange = (volume) => {
      timerService.setVolume(volume);
    };

    const onStart = () => {
      const intervalMs = (minutes.value * 60 + seconds.value) * 1000;
      const maxMs = enableMaxTime.value ? (maxMinutes.value * 60 + maxSeconds.value) * 1000 : 0;
      timerService.start(intervalMs, maxMs);
    };

    const onStop = () => {
      timerService.stop();
    };


    const onWarningSettingsChange = (settings) => {
      timerService.setEnableWarningSound(settings.enableWarningSound);
      timerService.setWarningCycles(settings.warningCycles);
    };

    const onEnableMaxTimeChange = (enabled) => {
      enableMaxTime.value = enabled;
      if (!enabled) {
        // Reset max time when disabled
        maxMinutes.value = 0;
        maxSeconds.value = 0;
      }
    };

    const onSingleTimerUpdate = (updates) => {
      if (updates.intervalMs !== undefined) {
        minutes.value = Math.floor(updates.intervalMs / 60000);
        seconds.value = Math.floor((updates.intervalMs % 60000) / 1000);
      }
      if (updates.maxMs !== undefined) {
        enableMaxTime.value = updates.maxMs > 0;
        maxMinutes.value = Math.floor(updates.maxMs / 60000);
        maxSeconds.value = Math.floor((updates.maxMs % 60000) / 1000);
      }
      if (updates.volume !== undefined) {
        timerService.setVolume(updates.volume);
      }
      if (updates.enableWarningSound !== undefined || updates.warningCycles !== undefined) {
        timerService.setEnableWarningSound(updates.enableWarningSound);
        timerService.setWarningCycles(updates.warningCycles);
      }
    };

    const setMode = (newMode) => {
      mode.value = newMode;
      // Save mode change
      storageService.saveState({
        currentMode: newMode,
        singleTimer: {
          minutes: minutes.value,
          seconds: seconds.value,
          maxMinutes: maxMinutes.value,
          maxSeconds: maxSeconds.value,
          volume: timerState.value.volume,
          enableWarningSound: timerState.value.enableWarningSound,
          warningCycles: timerState.value.warningCycles,
        },
        multiTimers: Array.from(multiTimerService.timers.values()).map(timer => ({
          id: timer.id,
          name: timer.name,
          intervalMs: timer.intervalMs,
          maxMs: timer.maxMs,
          volume: timer.volume,
          warningCycles: timer.warningCycles,
          enableWarningSound: timer.enableWarningSound,
        })),
        executionMode: multiTimerService.executionMode,
      });
    };

    const singleTimerData = computed(() => {
      const state = timerState.value;
      const intervalMs = (minutes.value * 60 + seconds.value) * 1000;
      const maxMs = enableMaxTime.value ? (maxMinutes.value * 60 + maxSeconds.value) * 1000 : 0;
      
      
      return {
        id: 'single-timer',
        name: 'Timer',
        intervalMs,
        maxMs,
        running: state.running,
        completed: state.completed,
        cycleCount: state.cycleCount,
        totalCycles: maxMs > 0 ? Math.floor(maxMs / intervalMs) : null,
        enableWarningSound: enableMaxTime.value ? state.enableWarningSound : false,
        warningCycles: enableMaxTime.value ? state.warningCycles : 0,
        volume: state.volume,
        lastTarget: state.lastTarget,
        startTime: state.startTime
      };
    });

    return {
      timerState,
      mode,
      singleTimerData,
      enableMaxTime,
      onMinutesChange,
      onSecondsChange,
      onMaxMinutesChange,
      onMaxSecondsChange,
      onVolumeChange,
      onStart,
      onStop,
      onWarningSettingsChange,
      onEnableMaxTimeChange,
      onSingleTimerUpdate,
      setMode,
    };
  },
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.title-section h1 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--fg);
  background: linear-gradient(135deg, var(--accent), #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-section .subtitle {
  margin: 0;
  font-size: 14px;
  color: #a7b3bf;
  font-weight: 400;
}

.timer-controls-section {
  background: #1a2332;
  border: 1px solid var(--muted);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.single-timer-controls {
  background: #1a2332;
  border: 1px solid var(--muted);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>
