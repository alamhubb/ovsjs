<script lang="ts">
import {defineComponent, h, ref} from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import HelloWorldTemplate from './components/HelloWorldTemplate.vue'

export default defineComponent({
  setup() {
    const isRenderMode = ref(true) // 默认渲染函数模式

    const toggleMode = () => {
      isRenderMode.value = !isRenderMode.value
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
      isRenderMode.value
          ? h(HelloWorld, {msg: 'Render Function Mode'})
          : h(HelloWorldTemplate, {msg: 'Template Mode'}),
      h('div', {
        style: 'display: flex; justify-content: center; margin: 2em 0;'
      }, [
        h('button', {
          type: 'button',
          onClick: toggleMode,
          style: 'padding: 0.6em 1.2em; font-size: 1em; font-weight: 500; border-radius: 8px; border: 1px solid transparent; background-color: #646cff; color: white; cursor: pointer; transition: background-color 0.25s;'
        }, isRenderMode.value ? '切换为模板代码' : '切换为h函数代码')
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