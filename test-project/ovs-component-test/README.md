# OVS 组件测试项目

测试 OVS 语法开发的 Vue 组件是否正常工作。

## 测试组件

| 组件 | 功能 | 测试点 |
|------|------|--------|
| **OvsButton** | 按钮组件 | 类型变体、点击事件、computed 属性 |
| **OvsCounter** | 计数器组件 | ref 响应式、事件处理、条件渲染 |
| **OvsInput** | 输入框组件 | 表单输入、watch 监听、双向绑定 |
| **OvsCard** | 卡片组件 | props.children 传递、条件渲染 |

## 运行

```bash
cd test-project/ovs-component-test
npm install
npm run dev
```

然后访问 http://localhost:5173 (或控制台显示的端口)

## OVS 语法特点

```javascript
// 使用 view 定义组件
view OvsButton(props) {
  // 支持 Vue 3 Composition API
  const buttonClass = computed(() => {
    return `ovs-button ovs-button--${props.type || 'primary'}`
  })

  // 使用 HTML 标签语法
  button(class = buttonClass.value, onClick = handleClick) {
    props.children  // 子组件通过 props.children 传递
  }
}
```

## 项目结构

```
ovs-component-test/
├── src/
│   ├── components/
│   │   ├── OvsButton.ovs    # 按钮组件
│   │   ├── OvsCounter.ovs   # 计数器组件
│   │   ├── OvsInput.ovs     # 输入框组件
│   │   └── OvsCard.ovs      # 卡片组件
│   ├── assets/
│   │   └── main.css         # 样式
│   ├── App.vue              # 主应用 (Vue SFC)
│   └── main.ts              # 入口
├── package.json
├── vite.config.ts           # Vite 配置 (使用 vite-plugin-ovs)
└── tsconfig.json
```

## 验证结果

✅ OVS 组件可以被 vite-plugin-ovs 正确编译
✅ 支持 Vue 3 Composition API (ref, computed, watch)
✅ 支持事件处理 (onClick 等)
✅ 支持 props 传递和 children
✅ 可以在 Vue SFC 中导入和使用 OVS 组件
