<template>
  <div>
    <div style="margin-top: 2em; text-align: center;">
      <p style="color: #42b883; font-size: 2em;">Hello uni-render</p>
    </div>

    <h1 style="font-size: 2em; color: #333; line-height: 1.1; font-weight: bold; margin-top: 1em;">
      {{ msg }}
    </h1>

    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
      <p style="margin-top: 1em;">
        Edit <code>./components/HelloWorldTemplate.vue</code> to test HMR
      </p>
    </div>

    <p style="display: flex; flex-direction: row; justify-content: center; margin-top: 1em;">
      Github:
      <a
          style="font-weight: 500; color: #646cff; margin-left: 0.3em; text-decoration: inherit;"
          href="https://github.com/alamhubb/uni-render"
          target="_blank"
      >
        https://github.com/alamhubb/uni-render
      </a>
    </p>
  </div>
</template>

<script lang="ts">
import {ref, defineComponent} from 'vue'

export default defineComponent({
  props: {
    msg: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const count = ref(0)
    return {count}
  }
})
</script>

<style scoped>
.read-the-docs {
  color: #888;
  margin-top: 1em;
}
</style>
