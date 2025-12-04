import {
    createConnection,
    createServer,
    createTypeScriptProject,
    loadTsdkByPath
} from '@volar/language-server/node';
import {LogUtil} from "./logutil";

LogUtil.log('createTypeScriptServices')

import {createTypeScriptServices} from "./typescript";
import {ovsLanguagePlugin} from "./OvsLanguagePlugin.ts";

const connection = createConnection();


const server = createServer(connection);


connection.listen();

function getLocalTsdkPath() {
    let tsdkPath = "C:\\Users\\qinky\\AppData\\Roaming\\npm\\node_modules\\typescript\\lib";
    // let tsdkPath = "C:\\Users\\qinkaiyuan\\AppData\\Roaming\\npm\\node_modules\\typescript\\lib";
    return tsdkPath.replace(/\\/g, '/');
}

LogUtil.log('getLocalTsdkPath')

const tsdkPath = getLocalTsdkPath();
LogUtil.log('onInitialize')
connection.onInitialize(params => {
    LogUtil.log('params')
    LogUtil.log(params)
    try {
        const tsdk = loadTsdkByPath(tsdkPath, params.locale);
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
        LogUtil.log(7777)
        LogUtil.log(e.message)
    }
});

connection.onInitialized(server.initialized);

connection.onShutdown(server.shutdown);
