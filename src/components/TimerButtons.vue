<template>
  <div class="row" style="margin-bottom: 8px">
    <button id="start" class="primary" @click="onStart" :disabled="running">
      {{ $t("buttons.start") }}
    </button>
    <button id="stop" @click="onStop" :disabled="!running">
      {{ $t("buttons.stop") }}
    </button>
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
  emits: ["start", "stop"],
  setup(props, { emit }) {
    const onStart = () => {
      emit("start");
    };

    const onStop = () => {
      emit("stop");
    };

    return {
      onStart,
      onStop,
    };
  },
};
</script>
