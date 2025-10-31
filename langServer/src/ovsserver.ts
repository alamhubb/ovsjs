import {
  createConnection,
  createServer,
  createTypeScriptProject,
  loadTsdkByPath
} from '@volar/language-server/node';
import {LogUtil} from "./logutil";
import * as path from 'path';

LogUtil.log('createTypeScriptServices')

import {createTypeScriptServices} from "./typescript";
import {ovsLanguagePlugin} from "./OvsLanguagePlugin.ts";

const connection = createConnection();


const server = createServer(connection);


connection.listen();

function getLocalTsdkPath() {
  try {
    // 首先尝试从项目 node_modules 中找到 TypeScript
    const tsdkPath = path.dirname(require.resolve('typescript/package.json'));
    LogUtil.log(`✅ Found TypeScript at: ${tsdkPath}`);
    return path.join(tsdkPath, 'lib').replace(/\\/g, '/');
  } catch (err) {
    LogUtil.log(`❌ Failed to resolve TypeScript: ${err.message}`);
    // 降级方案：返回 null，让 Volar 使用默认的 TypeScript
    return '';
  }
}

LogUtil.log('getLocalTsdkPath')

const tsdkPath = getLocalTsdkPath();
LogUtil.log('onInitialize')
connection.onInitialize(params => {
  LogUtil.log('params')
  LogUtil.log(params)
  try {
    const tsdk = loadTsdkByPath(tsdkPath || undefined, params.locale);
    const languagePlugins = [ovsLanguagePlugin]

    //createTypeScriptServicePlugins
    const languageServicePlugins = [...createTypeScriptServices(tsdk.typescript)]
    const tsProject = createTypeScriptProject(
      tsdk.typescript,
      tsdk.diagnosticMessages,
      () => ({
        languagePlugins: languagePlugins,
      }))
    const res = server.initialize(
      params,
      tsProject,
      [
        ...languageServicePlugins
      ],
    )
    LogUtil.log('res.capabilities.completionProvider.triggerCharacters')
    LogUtil.log(res.capabilities)
    return res
  } catch (e) {
    LogUtil.log('❌ LSP Server Initialize Error:')
    LogUtil.log(e.message)
    LogUtil.log(e.stack)
  }
});

connection.onInitialized(server.initialized);

connection.onShutdown(server.shutdown);
