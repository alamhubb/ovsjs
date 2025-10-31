import {vitePluginOvsTransform} from "ovsjs/src";
import {MappingConverter} from "./OvsLanguagePlugin.ts";
import {LogUtil} from "./logutil.ts";
import { SourceMap } from '@volar/source-map';

const code = `export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()`

const res = vitePluginOvsTransform(code)

console.log(res.code)