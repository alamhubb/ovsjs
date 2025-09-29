import {vitePluginOvsTransform} from "ovsjs/src";
import {MappingConverter} from "./OvsLanguagePlugin.ts";
import {LogUtil} from "./logutil.ts";
import { SourceMap } from '@volar/source-map';

const code = `let a = 1
let b = a`

const res = vitePluginOvsTransform(code)

console.log(777888)
console.log(res.code)
console.log(res.mapping)

const offsets = MappingConverter.convertMappings(res.mapping)

const mappings = [{
  sourceOffsets: offsets.map(item => item.original.offset),
  generatedOffsets: offsets.map(item => item.generated.offset),
  lengths: offsets.map(item => item.original.length),
  generatedLengths: offsets.map(item => item.generated.length),
  // sourceOffsets: [0],
  // generatedOffsets: [0],
  // lengths: [styleText.length],
  data: {
    completion: true,
    format: true,
    navigation: true,
    semantic: true,
    structure: true,
    verification: true
  },
}]

console.log(mappings)

const defaultMapperFactory = new SourceMap(mappings);

console.log(9988)
//根据位置距离前一个位置的差 ，追加
const res1111 = defaultMapperFactory.toGeneratedLocation(11)
console.log(9977)
console.log(res1111)
for (const res1111Element of res1111) {
  console.log(6666)
  console.log(res1111Element)
}

//问题来自于length太长了
