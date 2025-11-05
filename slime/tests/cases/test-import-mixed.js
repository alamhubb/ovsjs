// 测试混合导入语法
// 问题#4验证：import default, {named} from 'module'

// 测试1：默认导入 + 命名导入
import React, {useState, useEffect} from 'react'

// 测试2：默认导入 + namespace导入
import Vue, * as VueRouter from 'vue-router'

// 测试3：单独的默认导入（对照组）
import defaultOnly from './module1.js'

// 测试4：单独的命名导入（对照组）
import {named1, named2} from './module2.js'

// 测试5：单独的namespace导入（对照组）
import * as Everything from './module3.js'

