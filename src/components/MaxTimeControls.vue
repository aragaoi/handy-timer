<template>
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
    <span style="font-size: 12px; opacity: 0.8">{{
      $t("controls.maxTimeHint")
    }}</span>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "MaxTimeControls",
  props: {
    running: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:maxMinutes", "update:maxSeconds"],
  setup(props, { emit }) {
    const maxMinutes = ref(0);
    const maxSeconds = ref(0);

    watch(maxMinutes, (newValue) => {
      emit("update:maxMinutes", newValue);
    });

    watch(maxSeconds, (newValue) => {
      emit("update:maxSeconds", newValue);
    });

    return {
      maxMinutes,
      maxSeconds,
    };
  },
};
</script>
