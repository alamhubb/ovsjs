export class SlimeCodeLocation {
  type: string = ''
  line: number = 0
  value: string = ''
  column: number = 0
  length: number = 0
  //只有length无法计算index，结尾的时候有length，但是没有空白字符数量，所以无法计算index
  index: number = 0
}

export default class SlimeCodeMapping {
  source: SlimeCodeLocation = null
  generate: SlimeCodeLocation = null
}

export interface SlimeGeneratorResult {
  code: string
  mapping: SlimeCodeMapping[]
}
