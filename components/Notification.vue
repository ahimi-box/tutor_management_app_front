<template>
  <v-alert
    type="error"
  >
    <span v-for="m in messages" :key="m.id">
      <span>{{ m }}</span><br>
    </span>
  </v-alert>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    messages: {
      type: Array,
      reauired: false,
      default: () => {}
    }
  }
}
</script>