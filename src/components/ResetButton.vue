<template>
  <div class="reset-button-panel">
    <button @click="resetAll" class="reset-btn" :title="$t('reset.resetAll')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
        />
      </svg>
      <span class="button-label">{{ $t("reset.resetAll") }}</span>
    </button>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";
import timerService from "../services/timerService.js";
import multiTimerService from "../services/multiTimerService.js";
import storageService from "../services/storageService.js";

export default {
  name: "ResetButton",
  setup() {
    const { t } = useI18n();

    const resetAll = () => {
      if (confirm(t("reset.confirmReset"))) {
        // Reset single timer
        timerService.stop();
        timerService.reset();

        // Reset multi-timers
        multiTimerService.stopAll();
        const timers = multiTimerService.getState().timers;
        timers.forEach((timer) => {
          multiTimerService.updateTimer(timer.id, {
            running: false,
            completed: false,
            cycleCount: 0,
          });
        });

        // Clear saved state
        storageService.clearState();
      }
    };

    return {
      resetAll,
    };
  },
};
</script>

<style scoped>
.reset-button-panel {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.reset-btn {
  background: #6c757d;
  color: #a7b3bf;
  border: 1px solid #5a6268;
  border-radius: 24px;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  white-space: nowrap;
  opacity: 0.7;
}

.reset-btn:hover {
  background: #5a6268;
  color: #ffffff;
  border-color: #495057;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  opacity: 1;
}

.reset-btn:active {
  transform: scale(0.95);
}

.button-label {
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .reset-button-panel {
    bottom: 10px;
    left: 10px;
  }
}
</style>
