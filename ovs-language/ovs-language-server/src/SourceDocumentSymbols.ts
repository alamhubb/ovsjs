import ts from 'typescript'
import type { DocumentSymbol } from 'vscode-languageserver-protocol'
import { SymbolKind } from 'vscode-languageserver-protocol'
import type { TextDocument } from 'vscode-languageserver-textdocument'

export function provideSourceDocumentSymbols(document: TextDocument): DocumentSymbol[] {
  const sourceFile = ts.createSourceFile(
    document.uri,
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  return sourceFile.statements
    .map(statement => symbolFromStatement(document, statement))
    .filter((symbol): symbol is DocumentSymbol => Boolean(symbol))
}

function symbolFromStatement(document: TextDocument, statement: ts.Statement): DocumentSymbol | undefined {
  if (ts.isInterfaceDeclaration(statement)) {
    return createSymbol(document, statement.name, statement, SymbolKind.Interface, statement.members.map(member => symbolFromTypeElement(document, member)).filter(Boolean) as DocumentSymbol[])
  }
  if (ts.isTypeAliasDeclaration(statement)) {
    const children = ts.isTypeLiteralNode(statement.type)
      ? statement.type.members.map(member => symbolFromTypeElement(document, member)).filter(Boolean) as DocumentSymbol[]
      : []
    return createSymbol(document, statement.name, statement, SymbolKind.TypeParameter, children)
  }
  if (ts.isClassDeclaration(statement) && statement.name) {
    return createSymbol(document, statement.name, statement, SymbolKind.Class, statement.members.map(member => symbolFromClassElement(document, member)).filter(Boolean) as DocumentSymbol[])
  }
  if (ts.isFunctionDeclaration(statement) && statement.name) {
    return createSymbol(document, statement.name, statement, SymbolKind.Function)
  }
  if (ts.isVariableStatement(statement)) {
    const declarations = statement.declarationList.declarations
    if (declarations.length === 1 && ts.isIdentifier(declarations[0].name)) {
      return createSymbol(document, declarations[0].name, statement, SymbolKind.Variable, symbolChildrenFromInitializer(document, declarations[0].initializer))
    }
  }
  return undefined
}

function symbolFromTypeElement(document: TextDocument, member: ts.TypeElement): DocumentSymbol | undefined {
  const name = getDeclarationName(member)
  if (!name) return undefined
  if (ts.isMethodSignature(member) || ts.isCallSignatureDeclaration(member) || ts.isConstructSignatureDeclaration(member)) {
    return createSymbol(document, name, member, SymbolKind.Method)
  }
  return createSymbol(document, name, member, SymbolKind.Property)
}

function symbolFromClassElement(document: TextDocument, member: ts.ClassElement): DocumentSymbol | undefined {
  const name = getDeclarationName(member)
  if (!name) return undefined
  if (ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member)) {
    return createSymbol(document, name, member, SymbolKind.Method)
  }
  return createSymbol(document, name, member, SymbolKind.Property)
}

function symbolChildrenFromInitializer(document: TextDocument, initializer: ts.Expression | undefined): DocumentSymbol[] {
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) return []
  return initializer.properties
    .map(property => {
      const name = getDeclarationName(property)
      return name ? createSymbol(document, name, property, SymbolKind.Property) : undefined
    })
    .filter((symbol): symbol is DocumentSymbol => Boolean(symbol))
}

function getDeclarationName(node: ts.Node): ts.Node | undefined {
  const named = node as ts.NamedDeclaration
  if (named.name) return named.name
  if (ts.isConstructorDeclaration(node)) return node
  return undefined
}

function createSymbol(document: TextDocument, nameNode: ts.Node, rangeNode: ts.Node, kind: SymbolKind, children: DocumentSymbol[] = []): DocumentSymbol {
  return {
    name: symbolName(nameNode),
    kind,
    range: {
      start: document.positionAt(rangeNode.getStart()),
      end: document.positionAt(rangeNode.getEnd()),
    },
    selectionRange: {
      start: document.positionAt(nameNode.getStart()),
      end: document.positionAt(nameNode.getEnd()),
    },
    children,
  }
}

function symbolName(node: ts.Node): string {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text
  if (ts.isConstructorDeclaration(node)) return 'constructor'
  return node.getText()
}
