import type { LanguageServicePlugin } from '@volar/language-service'
import { DiagnosticSeverity } from 'vscode-languageserver-protocol'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import { vitePluginOvsTransform } from 'ovs-compiler'
import { formatOvsTransformErrorMessage } from './OvsLanguagePlugin'

function isOvsDocument(document: TextDocument): boolean {
  return document.languageId === 'ovs' || document.uri.toLowerCase().endsWith('.ovs')
}

export const OvsLanguageServicePlugin: LanguageServicePlugin = {
  name: 'ovs-transform-diagnostics',
  capabilities: {
    diagnosticProvider: {
      interFileDependencies: false,
      workspaceDiagnostics: false,
    },
  },
  create() {
    return {
      provideDiagnostics(document: TextDocument) {
        if (!isOvsDocument(document)) {
          return []
        }
        try {
          vitePluginOvsTransform(document.getText())
          return []
        } catch (error: unknown) {
          const lineCount = Math.max(document.getText().split(/\r\n|\r|\n/).length - 1, 0)
          return [{
            range: {
              start: { line: 0, character: 0 },
              end: { line: lineCount, character: 0 },
            },
            severity: DiagnosticSeverity.Error,
            source: 'ovs',
            message: formatOvsTransformErrorMessage(error),
          }]
        }
      },
    }
  },
}
