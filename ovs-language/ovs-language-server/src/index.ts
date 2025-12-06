import {
    createConnection,
    createServer,
    createTypeScriptProject,
    loadTsdkByPath
} from '@volar/language-server/node.js';
import { LogUtil } from "./logutil";
import { createTypeScriptServices } from "./typescript";
import { ovsLanguagePlugin } from "./OvsLanguagePlugin";

LogUtil.log('=== OVS Language Server Starting ===');
LogUtil.log('Process ID: ' + process.pid);
LogUtil.log('Node version: ' + process.version);
LogUtil.log('Current directory: ' + process.cwd());

const connection = createConnection();
LogUtil.log('Connection created');

const server = createServer(connection);
LogUtil.log('Server created');

connection.listen();
LogUtil.log('Connection listening...');

connection.onInitialize(params => {
    LogUtil.log('=== onInitialize ===');
    LogUtil.log('Client info:', params.clientInfo);
    LogUtil.log('Root URI:', params.rootUri);
    LogUtil.log('Workspace folders:', params.workspaceFolders);
    LogUtil.log('Initialization options:', params.initializationOptions);

    try {
        // 从客户端传递的 initializationOptions 获取 TypeScript SDK 路径
        const tsdkPath = params.initializationOptions?.typescript?.tsdk;
        LogUtil.log('TSDK path from client: ' + tsdkPath);

        if (!tsdkPath) {
            LogUtil.log('WARNING: No tsdk path provided, using fallback');
        }

        LogUtil.log('Loading TSDK...');
        const tsdk = loadTsdkByPath(tsdkPath, params.locale);
        LogUtil.log('TSDK loaded, TypeScript version: ' + tsdk.typescript.version);

        const languagePlugins = [ovsLanguagePlugin];
        LogUtil.log('Language plugins created: ' + languagePlugins.length);

        const languageServicePlugins = [...createTypeScriptServices(tsdk.typescript)];
        LogUtil.log('Language service plugins created: ' + languageServicePlugins.length);

        const tsProject = createTypeScriptProject(
            tsdk.typescript,
            tsdk.diagnosticMessages,
            () => ({
                languagePlugins: languagePlugins,
            })
        );
        LogUtil.log('TypeScript project created');

        const res = server.initialize(
            params,
            tsProject,
            [...languageServicePlugins],
        );

        LogUtil.log('=== Server Initialized Successfully ===');
        LogUtil.log('Capabilities:', res.capabilities);
        return res;
    } catch (e) {
        LogUtil.log('=== ERROR during initialization ===');
        LogUtil.log('Error type: ' + (e as Error).constructor?.name);
        LogUtil.log('Error message: ' + (e as Error).message);
        LogUtil.log('Error stack: ' + (e as Error).stack);
        throw e;
    }
});

connection.onInitialized(() => {
    LogUtil.log('=== onInitialized - Client confirmed initialization ===');
    server.initialized();
});

connection.onShutdown(() => {
    LogUtil.log('=== onShutdown ===');
    server.shutdown();
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    LogUtil.log('=== Uncaught Exception ===');
    LogUtil.log('Error: ' + error.message);
    LogUtil.log('Stack: ' + error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    LogUtil.log('=== Unhandled Rejection ===');
    LogUtil.log('Reason: ' + String(reason));
});
