<script setup lang="ts">
import { ref } from 'vue'
import { CssCls } from './cssts/CssCls'

const count = ref(0)
const isHighlighted = ref(false)
</script>

<template>
  <!-- 
    使用 vite-plugin-cssts 时，直接写逗号分隔的样式：
    :class="CssCls.card, CssCls.textCenter"
    
    插件会自动转换为：
    :class="cssts.$cls(CssCls.card, CssCls.textCenter)"
  -->
  <div :class="CssCls.card, CssCls.textCenter" style="max-width: 500px;">
    <h1 :class="CssCls.title, CssCls.colorBlue">
      🎨 CssTs Demo
    </h1>
    
    <p :class="CssCls.marginBottom">
      Compile-time CSS class management with TypeScript support
    </p>
    
    <div :class="CssCls.flexCenter, CssCls.gap, CssCls.marginTop">
      <!-- 单个样式可以直接使用 -->
      <button 
        :class="CssCls.primaryButton"
        @click="count++"
      >
        Count: {{ count }}
      </button>
      
      <button 
        :class="CssCls.successButton"
        @click="count += 10"
      >
        +10
      </button>
      
      <button 
        :class="CssCls.dangerButton"
        @click="count = 0"
      >
        Reset
      </button>
    </div>
    
    <div :class="CssCls.marginTop">
      <span :class="CssCls.badge, CssCls.bgDark, CssCls.colorWhite">
        TypeScript
      </span>
      <span :class="CssCls.badge, CssCls.bgBlue, CssCls.colorWhite" style="margin-left: 0.5rem;">
        Vue 3
      </span>
      <span :class="CssCls.badge, CssCls.bgGreen, CssCls.colorWhite" style="margin-left: 0.5rem;">
        Vite
      </span>
    </div>
    
    <!-- 条件样式：使用 && 运算符 -->
    <div :class="CssCls.marginTop, CssCls.flexCenter, CssCls.gap">
      <button 
        :class="CssCls.buttonBase, isHighlighted && CssCls.bgRed, !isHighlighted && CssCls.bgGray"
        @click="isHighlighted = !isHighlighted"
      >
        {{ isHighlighted ? 'Highlighted!' : 'Click to highlight' }}
      </button>
    </div>
    
    <p :class="CssCls.marginTop, CssCls.fontSmall, CssCls.colorRed">
      ✨ Type-safe CSS classes with IntelliSense support!
    </p>
  </div>
</template>
