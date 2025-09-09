<template>
  <div class="timer-status" id="status">{{ status }}</div>
</template>

<script>
export default {
  name: "TimerStatus",
  props: {
    status: {
      type: String,
      default: "Parado",
    },
  },
};
</script>
