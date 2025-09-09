<template>
  <div class="row" style="margin-bottom: 8px">
    <button id="start" class="primary" @click="onStart" :disabled="running">
      {{ $t("buttons.start") }}
    </button>
    <button id="stop" @click="onStop" :disabled="!running">
      {{ $t("buttons.stop") }}
    </button>
    <button id="test" @click="onTest">{{ $t("buttons.testSound") }}</button>
  </div>
</template>

<script>
export default {
  name: "TimerButtons",
  props: {
    running: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["start", "stop", "test"],
  setup(props, { emit }) {
    const onStart = () => {
      emit("start");
    };

    const onStop = () => {
      emit("stop");
    };

    const onTest = () => {
      emit("test");
    };

    return {
      onStart,
      onStop,
      onTest,
    };
  },
};
</script>
