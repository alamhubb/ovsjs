import {
    createConnection,
    createServer,
    createTypeScriptProject,
    loadTsdkByPath
} from '@volar/language-server/node.js';
import { LogUtil } from "./logutil";
import { createTypeScriptServices } from "./typescript";
import { ovsLanguagePlugin } from "./OvsLanguagePlugin";

const connection = createConnection();
const server = createServer(connection);

connection.listen();

connection.onInitialize(params => {
    LogUtil.log('onInitialize params:');
    LogUtil.log(params);

    try {
        // 从客户端传递的 initializationOptions 获取 TypeScript SDK 路径
        const tsdkPath = params.initializationOptions?.typescript?.tsdk;

        if (!tsdkPath) {
            LogUtil.log('Warning: No tsdk path provided, using fallback');
        }

        const tsdk = loadTsdkByPath(tsdkPath, params.locale);
        const languagePlugins = [ovsLanguagePlugin];
        const languageServicePlugins = [...createTypeScriptServices(tsdk.typescript)];

        const tsProject = createTypeScriptProject(
            tsdk.typescript,
            tsdk.diagnosticMessages,
            () => ({
                languagePlugins: languagePlugins,
            })
        );

        const res = server.initialize(
            params,
            tsProject,
            [...languageServicePlugins],
        );

        LogUtil.log('Server initialized with capabilities:');
        LogUtil.log(res.capabilities);
        return res;
    } catch (e) {
        LogUtil.log('Error during initialization:');
        LogUtil.log(e.message);
        throw e;
    }
});

connection.onInitialized(server.initialized);

connection.onShutdown(server.shutdown);
