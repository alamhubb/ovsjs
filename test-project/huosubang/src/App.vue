<script setup lang="ts">
import HelloWorld from './components/HelloWorld.ovs'
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld></HelloWorld>
    </div>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
  padding: 2rem;
}

header .wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
