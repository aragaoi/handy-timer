<template>
  <div class="multi-timer-manager">
    <StatusPanel
      :timers="timers"
      :execution-mode="executionMode"
      :intervalMs="getFirstTimerInterval()"
      :maxMs="getFirstTimerMaxTime()"
      :enableWarningSound="getFirstTimerWarningSound()"
      :warningCycles="getFirstTimerWarningCycles()"
    />

    <div class="execution-controls">
      <div class="execution-mode">
        <label>{{ $t("multiTimer.executionMode") }}:</label>
        <select v-model="executionMode" @change="updateExecutionMode">
          <option value="sequence">{{ $t("multiTimer.sequence") }}</option>
          <option value="simultaneous">
            {{ $t("multiTimer.simultaneous") }}
          </option>
        </select>
      </div>

      <div class="global-controls">
        <button
          @click="startAll"
          :disabled="!canStartAll"
          class="start-all-btn"
        >
          {{
            executionMode === "sequence"
              ? $t("multiTimer.startSequence")
              : $t("multiTimer.startAll")
          }}
        </button>
        <button @click="stopAll" :disabled="!isRunning" class="stop-all-btn">
          {{
            executionMode === "sequence"
              ? $t("multiTimer.stopSequence")
              : $t("multiTimer.stopAll")
          }}
        </button>
        <button
          @click="addTimer"
          class="add-timer-btn"
          :title="$t('multiTimer.addTimer')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
      </div>

      <div v-if="executionMode === 'sequence'" class="repeat-sequence">
        <label class="repeat-label">
          <input
            type="checkbox"
            v-model="repeatSequence"
            @change="updateRepeatSequence"
            :disabled="isRunning"
          />
          {{ $t("multiTimer.repeatSequence") }}
        </label>
      </div>
    </div>

    <div class="timers-list">
      <template v-for="(timer, index) in timers" :key="timer.id">
        <button
          @click="addTimerAt(index)"
          class="add-timer-small-btn"
          :title="$t('multiTimer.addTimer')"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>

        <UnifiedTimerCard
          :timer="timer"
          :show-header="true"
          :show-delete-button="true"
          @update="(updates) => updateTimer(timer.id, updates)"
          @delete="() => deleteTimer(timer.id)"
        />
      </template>

      <button
        @click="addTimerAt(timers.length)"
        class="add-timer-small-btn"
        :title="$t('multiTimer.addTimer')"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>

    <div v-if="timers.length === 0" class="empty-state">
      <p>{{ $t("multiTimer.noTimers") }}</p>
      <button @click="addTimer" class="add-first-timer-btn">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          style="margin-right: 8px"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        {{ $t("multiTimer.addFirstTimer") }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import UnifiedTimerCard from "./UnifiedTimerCard.vue";
import StatusPanel from "./StatusPanel.vue";
import multiTimerService from "../services/multiTimerService.js";

export default {
  name: "MultiTimerManager",
  components: {
    UnifiedTimerCard,
    StatusPanel,
  },
  setup() {
    const state = ref(multiTimerService.getState());
    const executionMode = ref(state.value.executionMode);
    const repeatSequence = ref(state.value.repeatSequence || false);

    let unsubscribe = null;

    onMounted(() => {
      unsubscribe = multiTimerService.subscribe((newState) => {
        state.value = newState;
        executionMode.value = newState.executionMode;
        repeatSequence.value = newState.repeatSequence || false;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    const timers = computed(() => state.value.timers);
    const isRunning = computed(() => state.value.isRunning);

    const canStartAll = computed(() => {
      return timers.value.some((timer) => !timer.completed && !timer.running);
    });

    const addTimer = () => {
      multiTimerService.createTimer({
        name: `Timer ${timers.value.length + 1}`,
        intervalMs: 30000,
        maxMs: 0,
        volume: 0.4,
      });
    };

    const addTimerAt = (index) => {
      multiTimerService.createTimerAt(index, {
        name: `Timer ${timers.value.length + 1}`,
        intervalMs: 30000,
        maxMs: 0,
        volume: 0.4,
      });
    };

    const updateTimer = (id, updates) => {
      multiTimerService.updateTimer(id, updates);
    };

    const deleteTimer = (id) => {
      multiTimerService.deleteTimer(id);
    };

    const startAll = () => {
      multiTimerService.startAll();
    };

    const stopAll = () => {
      multiTimerService.stopAll();
    };

    const updateExecutionMode = () => {
      multiTimerService.setExecutionMode(executionMode.value);
      multiTimerService.setRepeatSequence(repeatSequence.value);
    };

    const updateRepeatSequence = () => {
      multiTimerService.setRepeatSequence(repeatSequence.value);
    };


    const getFirstTimerInterval = () => {
      return timers.value[0]?.intervalMs || 30000;
    };

    const getFirstTimerMaxTime = () => {
      return timers.value[0]?.maxMs || 0;
    };

    const getFirstTimerWarningSound = () => {
      const firstTimer = timers.value[0];
      if (!firstTimer) return false;
      // Only enable warning sound if max time is enabled
      return firstTimer.maxMs > 0 && firstTimer.enableWarningSound !== false;
    };

    const getFirstTimerWarningCycles = () => {
      const firstTimer = timers.value[0];
      if (!firstTimer) return 0;
      // Only return warning cycles if max time is enabled
      return firstTimer.maxMs > 0 ? firstTimer.warningCycles || 3 : 0;
    };

    return {
      timers,
      isRunning,
      canStartAll,
      executionMode,
      addTimer,
      addTimerAt,
      updateTimer,
      deleteTimer,
      startAll,
      stopAll,
      updateExecutionMode,
      updateRepeatSequence,
      getFirstTimerInterval,
      getFirstTimerMaxTime,
      getFirstTimerWarningSound,
      getFirstTimerWarningCycles,
    };
  },
};
</script>

<style scoped>
.multi-timer-manager {
  max-width: 800px;
  margin: 0 auto;
}

.execution-controls {
  background: #1a2332;
  border: 1px solid var(--muted);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.execution-mode {
  display: flex;
  align-items: center;
  gap: 12px;
}

.execution-mode label {
  font-size: 14px;
  font-weight: 600;
}

.execution-mode select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--muted);
  background: #0e141b;
  color: var(--fg);
  font-size: 14px;
  cursor: pointer;
}

.global-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.start-all-btn {
  background: var(--accent);
  color: #0a1014;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
}

.start-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stop-all-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
}

.stop-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-timer-btn {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
}

.timers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.add-timer-small-btn {
  background: #2a3441;
  color: #a7b3bf;
  border: 1px solid #3a4754;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.add-timer-small-btn:hover {
  background: #3a4754;
  color: var(--accent);
  border-color: var(--accent);
  opacity: 1;
  transform: scale(1.1);
}

.add-timer-small-btn:active {
  transform: scale(0.95);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #a7b3bf;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 16px;
}

.add-first-timer-btn {
  background: var(--accent);
  color: #0a1014;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
}

/* Repeat sequence styles */
.repeat-sequence {
  margin-top: 12px;
  padding: 12px;
  background: #0e141b;
  border-radius: 8px;
  border: 1px solid var(--muted);
}

.repeat-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
  cursor: pointer;
}

.repeat-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
}

@media (max-width: 768px) {
  .execution-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .global-controls {
    justify-content: center;
  }
}
</style>
