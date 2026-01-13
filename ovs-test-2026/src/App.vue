<script setup lang="ts">
import HelloWorldOvs from './components/HelloWorldOvs.ovs'
import HelloWorldOvsRuntime from './components/HelloWorldOvsRuntime.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.png" width="125" height="125" />

    <div class="wrapper">
      <h2>1. OVS 运行时（手写 IIFE）</h2>
      <HelloWorldOvsRuntime></HelloWorldOvsRuntime>

      <hr style="margin: 40px 0;" />

      <h2>2. OVS 编译（.ovs 文件）</h2>
      <HelloWorldOvs></HelloWorldOvs>
    </div>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
