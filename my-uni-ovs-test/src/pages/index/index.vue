<script lang="ts">
import { defineComponent, h, ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import HelloWorldTemplate from './components/HelloWorldTemplate.vue'
import HelloWorldOvs from './components/HelloWorldOvs.ovs'

export default defineComponent({
  setup() {
    // 0: h函数, 1: 模板, 2: OVS
    const mode = ref(2) // 默认 OVS 模式

    const toggleMode = () => {
      mode.value = (mode.value + 1) % 3
    }

    const getModeLabel = () => {
      switch (mode.value) {
        case 0: return 'h 函数模式'
        case 1: return '模板模式'
        case 2: return 'OVS 语法模式'
        default: return ''
      }
    }

    const getButtonLabel = () => {
      switch (mode.value) {
        case 0: return '切换为模板模式'
        case 1: return '切换为 OVS 模式'
        case 2: return '切换为 h 函数模式'
        default: return ''
      }
    }

    return () => h('div', {}, [
      h('div', {
        style: 'display: flex;flex-direction: row;justify-content: center'
      }, [
        h('a', {
          href: 'https://uniapp.dcloud.net.cn/',
          target: '_blank'
        }, [
          h('img', {
            src: '/static/logo.png',
            class: 'logo',
            alt: 'Uniapp logo'
          })
        ]),
        h('a', {
          href: 'https://github.com/alamhubb/uni-render',
          target: '_blank'
        }, [
          h('img', {
            src: '/static/renderlogo.png',
            class: 'render logo',
            alt: 'UniRender logo'
          })
        ])
      ]),
      // 根据 mode 显示不同组件
      mode.value === 0
        ? h(HelloWorld, { msg: 'Render Function Mode' })
        : mode.value === 1
          ? h(HelloWorldTemplate, { msg: 'Template Mode' })
          : h(HelloWorldOvs),
      h('div', {
        style: 'display: flex; justify-content: center; margin: 2em 0;'
      }, [
        h('button', {
          type: 'button',
          onClick: toggleMode,
          style: 'padding: 0.6em 1.2em; font-size: 1em; font-weight: 500; border-radius: 8px; border: 1px solid transparent; background-color: #646cff; color: white; cursor: pointer; transition: background-color 0.25s;'
        }, getButtonLabel())
      ]),
    ])
  }
})
</script>
<style>
.logo {
  height: 6em;
  width: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.render:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>