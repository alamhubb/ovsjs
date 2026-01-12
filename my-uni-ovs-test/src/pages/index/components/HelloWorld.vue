<script lang="ts">
import {ref, h, defineComponent} from 'vue'

export default defineComponent({
  props: {
    msg: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const count = ref(0)

    return () => h('div', {}, [
      h('div', {
        style: 'margin-top: 2em; text-align: center;'
      }, [
        h('p', {
          style: 'color: #42b883;font-size: 2em'
        }, 'Hello uni-render')
      ]),

      h('h1', {
        style: 'font-size: 2em; color: #333;line-height: 1.1;font-weight: bold;margin-top: 1em;'
      }, props.msg),

      h('div', {class: 'card'}, [
        h('button', {
          type: 'button',
          onClick: () => count.value++
        }, `count is ${count.value}`),
        h('p', {
          style: 'margin-top:1em'
        }, [
          'Edit ',
          h('code', {}, './components/HelloWorld.vue'),
          ' to test HMR'
        ])
      ]),

      h('p', {
        style: 'display: flex;flex-direction: row;justify-content: center;margin-top:1em'
      }, [
        'Github:',
        h('a', {
          style: 'font-weight: 500;color: #646cff;margin-left:0.3em;text-decoration: inherit;',
          href: 'https://github.com/alamhubb/uni-render',
          target: '_blank'
        }, 'https://github.com/alamhubb/uni-render'),
      ])
    ])
  }
})
</script>

<style scoped>
.read-the-docs {
  color: #888;
  margin-top: 1em;
}
</style>
