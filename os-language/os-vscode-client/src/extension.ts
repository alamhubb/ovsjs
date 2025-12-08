/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as serverProtocol from '@volar/language-server/protocol';
import { createLabsInfo, getTsdk } from '@volar/vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  BaseLanguageClient
} from '@volar/vscode/node';
import * as vscode from 'vscode';
import * as path from 'path';

let client: BaseLanguageClient;

// 创建输出通道用于显示调试日志
const outputChannel = vscode.window.createOutputChannel('ObjectScript Language Server', { log: true });

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const logMessage = data !== undefined
    ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}`
    : `[${timestamp}] ${message}`;
  outputChannel.appendLine(logMessage);
  console.log(logMessage);
}

export async function activate(context: vscode.ExtensionContext) {
  log('=== ObjectScript Extension Activating ===');
  log('Extension path', context.extensionPath);
  log('Storage path', context.storagePath);
  log('Global storage path', context.globalStoragePath);

  // Language Server 已打包到 dist/language-server.cjs
  const serverModule = path.join(context.extensionPath, 'dist', 'language-server.cjs');
  log('Server module path', serverModule);

  // 检查服务器模块是否存在
  try {
    const fs = await import('fs');
    if (fs.existsSync(serverModule)) {
      log('Server module exists', true);
    } else {
      log('ERROR: Server module does not exist!');
    }
  } catch (e) {
    log('Error checking server module', e);
  }

  // 获取用户 VSCode 中的 TypeScript SDK 路径
  log('Getting TypeScript SDK...');
  let tsdk: Awaited<ReturnType<typeof getTsdk>> | undefined;
  try {
    // 添加超时，避免卡住
    const tsdkPromise = getTsdk(context);
    const timeoutPromise = new Promise<undefined>((resolve) => {
      setTimeout(() => {
        log('TSDK timeout after 5 seconds, using default');
        resolve(undefined);
      }, 5000);
    });
    tsdk = await Promise.race([tsdkPromise, timeoutPromise]);
    log('TSDK result', tsdk);
  } catch (e) {
    log('Error getting TSDK', e);
  }

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: {
        execArgv: ['--nolazy', '--inspect=6009'],
      },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'objectscript' }],
    initializationOptions: {
      typescript: {
        tsdk: tsdk?.tsdk,
      },
    },
    outputChannel: outputChannel,
  };

  log('Creating Language Client...');
  log('Document selector', clientOptions.documentSelector);
  log('Initialization options', clientOptions.initializationOptions);

  client = new LanguageClient(
    'os-language-server',
    'ObjectScript Language Server',
    serverOptions,
    clientOptions,
  );

  log('Starting ObjectScript Language Client...');
  try {
    await client.start();
    log('=== ObjectScript Language Client Started Successfully! ===');
    log('Client state', client.state);
  } catch (e) {
    log('=== FAILED to start ObjectScript Language Client ===');
    log('Error', e);
    outputChannel.show(); // 自动显示输出面板以便查看错误
    throw e;
  }

  // 注册命令：显示 ObjectScript 日志
  context.subscriptions.push(
    vscode.commands.registerCommand('objectscript.showLog', () => {
      outputChannel.show();
    })
  );

  // 支持 Volar Labs
  const labsInfo = createLabsInfo(serverProtocol);
  labsInfo.addLanguageClient(client);
  log('Labs info created and client added');

  return labsInfo.extensionExports;
}

export function deactivate(): Thenable<void> | undefined {
  log('=== ObjectScript Extension Deactivating ===');
  return client?.stop();
}

