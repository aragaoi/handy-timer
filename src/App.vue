<template>
  <div class="card">
    <div class="header">
      <h1>{{ $t("app.title") }}</h1>
      <LanguageSelector />
    </div>

    <TimerControls
      :running="timerState.running"
      @update:minutes="onMinutesChange"
      @update:seconds="onSecondsChange"
      @volume-change="onVolumeChange"
    />

    <MaxTimeControls
      :running="timerState.running"
      @update:maxMinutes="onMaxMinutesChange"
      @update:maxSeconds="onMaxSecondsChange"
    />

    <TimerButtons
      :running="timerState.running"
      @start="onStart"
      @stop="onStop"
      @test="onTest"
    />

    <div class="hint">
      {{ $t("hint") }}
    </div>

    <TimerStatus :status="timerState.status" />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import TimerControls from "./components/TimerControls.vue";
import MaxTimeControls from "./components/MaxTimeControls.vue";
import TimerButtons from "./components/TimerButtons.vue";
import TimerStatus from "./components/TimerStatus.vue";
import LanguageSelector from "./components/LanguageSelector.vue";
import timerService from "./services/timerService.js";

export default {
  name: "App",
  components: {
    TimerControls,
    MaxTimeControls,
    TimerButtons,
    TimerStatus,
    LanguageSelector,
  },
  setup() {
    const timerState = ref(timerService.getState());
    const minutes = ref(0);
    const seconds = ref(30);
    const maxMinutes = ref(0);
    const maxSeconds = ref(0);

    let unsubscribe = null;

    onMounted(() => {
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
      const maxMs = (maxMinutes.value * 60 + maxSeconds.value) * 1000;
      timerService.start(intervalMs, maxMs);
    };

    const onStop = () => {
      timerService.stop();
    };

    const onTest = () => {
      timerService.testSound();
    };

    return {
      timerState,
      onMinutesChange,
      onSecondsChange,
      onMaxMinutesChange,
      onMaxSecondsChange,
      onVolumeChange,
      onStart,
      onStop,
      onTest,
    };
  },
};
</script>
