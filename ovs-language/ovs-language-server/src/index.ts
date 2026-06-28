import {
  createConnection,
  createServer,
  createTypeScriptProject,
  loadTsdkByPath,
} from '@volar/language-server/node.js'
import { create as createTypeScriptServices } from 'volar-service-typescript'
import { extensionWithoutDot, resolveLanguageServerMetadata } from './LanguageServerMetadata'
import { LogUtil } from './logutil'
import { ovsLanguagePlugin } from './OvsLanguagePlugin'
import { OvsLanguageServicePlugin } from './OvsLanguageServicePlugin'

LogUtil.log('=== OVS Language Server Starting ===')
LogUtil.log('Process ID: ' + process.pid)
LogUtil.log('Node version: ' + process.version)
LogUtil.log('Current directory: ' + process.cwd())

const connection = createConnection()
const server = createServer(connection)

connection.listen()

connection.onInitialize((params) => {
  LogUtil.log('=== onInitialize ===')
  LogUtil.log('Client info:', params.clientInfo)
  LogUtil.log('Root URI:', params.rootUri)
  LogUtil.log('Workspace folders:', params.workspaceFolders)
  LogUtil.log('Initialization options:', params.initializationOptions)

  const tsdkPath = params.initializationOptions?.typescript?.tsdk ?? process.env.QIN_LSP_TYPESCRIPT_TSDK
  if (!tsdkPath) {
    throw new Error('OVS language server requires initializationOptions.typescript.tsdk or QIN_LSP_TYPESCRIPT_TSDK')
  }
  const languageServerMetadata = resolveLanguageServerMetadata(params.initializationOptions)
  const sourceExtension = extensionWithoutDot(languageServerMetadata.sourceExtension)
  LogUtil.log('Language server metadata:', languageServerMetadata)

  const tsdk = loadTsdkByPath(tsdkPath, params.locale)
  const languagePlugins = [ovsLanguagePlugin(languageServerMetadata)]
  const languageServicePlugins = [
    OvsLanguageServicePlugin,
    ...createTypeScriptServices(tsdk.typescript, {
      disableAutoImportCache: true,
      isValidationEnabled(document) {
        return document.languageId !== 'ovs' && !isOvsDocumentUri(document.uri, sourceExtension)
      },
    }),
  ]
  const tsProject = createTypeScriptProject(
    tsdk.typescript,
    tsdk.diagnosticMessages,
    () => ({
      languagePlugins,
    })
  )

  const result = server.initialize(params, tsProject, [...languageServicePlugins])
  LogUtil.log('=== OVS Language Server Initialized ===')
  return result
})

connection.onInitialized(() => {
  server.initialized()
})

connection.onShutdown(() => {
  server.shutdown()
})

process.on('uncaughtException', (error) => {
  LogUtil.log('Uncaught exception:', error.stack || error.message)
})

process.on('unhandledRejection', (reason) => {
  LogUtil.log('Unhandled rejection:', String(reason))
})

function isOvsDocumentUri(uri: string, sourceExtension: string): boolean {
  const lowerUri = uri.toLowerCase()
  return lowerUri.endsWith(`.${sourceExtension}`)
    || lowerUri.includes(`.${sourceExtension}.`)
    || lowerUri.includes(`.${sourceExtension}%`)
    || lowerUri.includes(`%2e${sourceExtension}`)
    || lowerUri.includes(`%252e${sourceExtension}`)
}
