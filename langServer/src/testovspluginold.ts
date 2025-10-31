import {vitePluginOvsTransform} from "ovsjs/src";
import {MappingConverter} from "./OvsLanguagePlugin.ts";
import {LogUtil} from "./logutil.ts";
import { SourceMap } from '@volar/source-map';

const code = `createComponentVNode(div,{},[createComponentVNode(...)])
`

const res = vitePluginOvsTransform(code)

console.log(res.code)