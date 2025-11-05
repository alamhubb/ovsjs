// 测试：import default + named imports 混合语法
// 这是问题#4要验证的场景

// 场景1：default + 单个named
import defaultExport, {name} from './module.js'

// 场景2：default + 多个named
import React, {useState, useEffect} from 'react'

// 场景3：default + named with rename
import axios, {get as axiosGet, post as axiosPost} from 'axios'

// 场景4：default + 多个named（更复杂）
import lodash, {map, filter, reduce, flatten} from 'lodash'







