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

let client: BaseLanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  // 从 node_modules 中找到 server 的 .ts 入口文件
  const serverModule = vscode.Uri.joinPath(context.extensionUri, 'node_modules', 'ovs-lang-server', 'src', 'index.ts').fsPath;

  // 获取用户 VSCode 中的 TypeScript SDK 路径
  const tsdk = await getTsdk(context);

  const serverOptions: ServerOptions = {
    run: {
      command: 'npx',
      args: ['tsx', serverModule, '--stdio'],
      transport: TransportKind.stdio,
      options: { shell: true }
    },
    debug: {
      command: 'npx',
      args: ['tsx', serverModule, '--stdio'],
      transport: TransportKind.stdio,
      options: { shell: true }
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

  await client.start();

  // 支持 Volar Labs
  const labsInfo = createLabsInfo(serverProtocol);
  labsInfo.addLanguageClient(client);
  return labsInfo.extensionExports;
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
