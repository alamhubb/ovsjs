import {
    createConnection,
    createServer,
    createTypeScriptProject,
    loadTsdkByPath
} from '@volar/language-server/node.js';
import { DiagnosticSeverity } from 'vscode-languageserver';
import type { DidChangeTextDocumentParams, DidOpenTextDocumentParams } from 'vscode-languageserver';
import { LogUtil } from "./logutil";
import { createTypeScriptServices } from "./typescript";
import { formatOvsTransformErrorMessage, ovsLanguagePlugin } from "./OvsLanguagePlugin";
import { vitePluginOvsTransform } from "ovs-compiler";

LogUtil.log('=== OVS Language Server Starting ===');
LogUtil.log('Process ID: ' + process.pid);
LogUtil.log('Node version: ' + process.version);
LogUtil.log('Current directory: ' + process.cwd());

const connection = createConnection();
LogUtil.log('Connection created');

const server = createServer(connection);
LogUtil.log('Server created');

const openDocuments = new Map<string, string>();

function positionToOffset(text: string, line: number, character: number): number {
    let currentLine = 0;
    let offset = 0;
    while (currentLine < line && offset < text.length) {
        const next = text.indexOf('\n', offset);
        if (next < 0) {
            return text.length;
        }
        offset = next + 1;
        currentLine++;
    }
    return Math.min(offset + character, text.length);
}

function applyDocumentChanges(text: string, params: DidChangeTextDocumentParams): string {
    let nextText = text;
    for (const change of params.contentChanges) {
        if (!('range' in change) || !change.range) {
            nextText = change.text;
            continue;
        }
        const start = positionToOffset(nextText, change.range.start.line, change.range.start.character);
        const end = positionToOffset(nextText, change.range.end.line, change.range.end.character);
        nextText = nextText.slice(0, start) + change.text + nextText.slice(end);
    }
    return nextText;
}

function shouldValidateOvsDocument(uri: string, languageId?: string): boolean {
    return languageId === 'ovs' || uri.toLowerCase().endsWith('.ovs');
}

function validateOvsDocument(uri: string, text: string): void {
    LogUtil.log('=== OVS LSP Diagnostics Start ===');
    LogUtil.log('Document URI: ' + uri);
    try {
        vitePluginOvsTransform(text);
        connection.sendDiagnostics({ uri, diagnostics: [] });
        LogUtil.log('OVS transform diagnostics count: 0');
    } catch (error: unknown) {
        const message = formatOvsTransformErrorMessage(error);
        connection.sendDiagnostics({
            uri,
            diagnostics: [{
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: Math.max(text.split(/\r\n|\r|\n/).length - 1, 0), character: 0 },
                },
                severity: DiagnosticSeverity.Error,
                source: 'ovs',
                message,
            }],
        });
        LogUtil.log('OVS transform diagnostics count: 1');
        LogUtil.log('Diagnostic message: ' + message);
    }
}

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
        const tsdkPath = params.initializationOptions?.typescript?.tsdk ?? process.env.QIN_LSP_TYPESCRIPT_TSDK;
        LogUtil.log('TSDK path from client: ' + tsdkPath);

        if (!tsdkPath) {
            throw new Error('OVS language server requires initializationOptions.typescript.tsdk or QIN_LSP_TYPESCRIPT_TSDK');
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

connection.onDidOpenTextDocument((params: DidOpenTextDocumentParams) => {
    const { uri, languageId, text } = params.textDocument;
    openDocuments.set(uri, text);
    if (shouldValidateOvsDocument(uri, languageId)) {
        validateOvsDocument(uri, text);
    }
});

connection.onDidChangeTextDocument((params: DidChangeTextDocumentParams) => {
    const uri = params.textDocument.uri;
    const previousText = openDocuments.get(uri) ?? '';
    const nextText = applyDocumentChanges(previousText, params);
    openDocuments.set(uri, nextText);
    if (shouldValidateOvsDocument(uri)) {
        validateOvsDocument(uri, nextText);
    }
});

connection.onDidCloseTextDocument((params) => {
    const uri = params.textDocument.uri;
    openDocuments.delete(uri);
    if (shouldValidateOvsDocument(uri)) {
        connection.sendDiagnostics({ uri, diagnostics: [] });
    }
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
