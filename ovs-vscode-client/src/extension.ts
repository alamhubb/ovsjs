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

export async function activate(context: vscode.ExtensionContext) {
  console.log('OVS Extension activating...');

  // 使用编译后的 JS 文件
  const serverModule = path.join(context.extensionPath, 'node_modules', 'ovs-lang-server', 'dist', 'index.mjs');
  console.log('Server module path:', serverModule);

  // 获取用户 VSCode 中的 TypeScript SDK 路径
  const tsdk = await getTsdk(context);
  console.log('TSDK:', tsdk);

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
    documentSelector: [{ scheme: 'file', language: 'ovs' }],
    initializationOptions: {
      typescript: {
        tsdk: tsdk?.tsdk,
      },
    },
  };

  client = new LanguageClient(
    'ovs-language-server',
    'OVS Language Server',
    serverOptions,
    clientOptions,
  );

  console.log('Starting OVS Language Client...');
  try {
    await client.start();
    console.log('OVS Language Client started successfully!');
  } catch (e) {
    console.error('Failed to start OVS Language Client:', e);
    throw e;
  }

  // 支持 Volar Labs
  const labsInfo = createLabsInfo(serverProtocol);
  labsInfo.addLanguageClient(client);
  return labsInfo.extensionExports;
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

