import OvsAPI from '@/ovs/OvsAPI.ts'

export const hello = {
  name123: 123,
  render: function render() {
    (function () {
      OvsAPI.createVNode(div, 123)
    })()
  },

}

