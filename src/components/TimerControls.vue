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
  </div>
</template>

<script>
import { ref, watch } from "vue";

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

    return {
      minutes,
      seconds,
      volume,
      onVolumeChange,
    };
  },
};
</script>
