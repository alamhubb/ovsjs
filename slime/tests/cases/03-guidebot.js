// GuideBot示例 - JavaScript版本
// 展示更复杂的语法：对象、数组、嵌套结构

const guidebotData = {
  title: 'GuideBot',
  description: '我生成了一个超简单版的任务管理工具',
  question: '哪里需要调整？',
  sections: [
    {
      name: '实时预览',
      content: '我的任务'
    },
    {
      name: '需求文档',
      content: '功能清单'
    }
  ]
}

const tasks = [
  { id: 1, name: '完成项目需求文档', completed: false },
  { id: 2, name: '设计页面布局', completed: true }
]

function renderTasks() {
  const result = []
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const status = task.completed ? '已完成' : '进行中'
    result.push({
      id: task.id,
      display: task.name + ' (' + status + ')'
    })
  }
  
  return result
}

const renderedTasks = renderTasks()
console.log('GuideBot任务列表：', renderedTasks)

