<script setup lang="ts">
import HelloWorld from './components/HelloWorld.ovs'
import HelloWorldManual from './components/HelloWorldManual.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.png" width="125" height="125" />

    <div class="wrapper">
      <h2>手写三层嵌套（验证方案）</h2>
      <HelloWorldManual></HelloWorldManual>
      
      <hr style="margin: 40px 0;" />
      
      <h2>OVS 编译（原始）</h2>
      <HelloWorld></HelloWorld>
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
