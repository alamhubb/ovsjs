import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeParams,
  InitializeResult,
  SemanticTokensRequest,
  SemanticTokensBuilder,
  SemanticTokensLegend, CompletionItem, CompletionItemKind, MarkupKind
} from 'vscode-languageserver/node'

import {fileURLToPath} from 'url'
import {TextDocument} from 'vscode-languageserver-textdocument'
import * as fs from 'fs'
import * as path from 'path'
import {
  CompletionParams,
  Hover,
  HoverParams,
  SemanticTokenModifiers,
  SemanticTokenTypes,
  TextDocumentIdentifier
} from 'vscode-languageserver'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import {es6Tokens, es6TokensObj} from 'subhuti-ts/src/language/es2015/Es6Tokens.ts'
import JsonUtil from 'subhuti/src/utils/JsonUtil.ts'
import {TokenProvider, tokenTypesObj} from "./IntellijTokenUtil.ts";
import OvsParser from "./ovs/parser/OvsParser.ts";
import {LogUtil} from "./logutil.ts";
import {FileUtil, initCompletionMap} from "./utils/FileUtils.ts";
import {ovsToAstUtil} from "./ovs/factory/OvsToAstUtil.ts";
import {EsTreeAstType} from "subhuti-ts/src/language/es2015/Es6CstToEstreeAstUtil.ts";

// 创建连接
const connection = createConnection(ProposedFeatures.all)

// 创建文档管理器
const documents = new TextDocuments(TextDocument)


// 定义日志文件路径

// 定义语义标记类型和修饰符
// const tokenTypes = tokenTypesObj.
const tokenTypes = Object.values(tokenTypesObj).map(item => item.toUpperCase())
const tokenModifiers: string[] = []

// 创建语义标记图例
const legend: SemanticTokensLegend = {
  tokenTypes: tokenTypes,
  tokenModifiers: tokenModifiers
}

interface objtype {
  label: string,
  type: number,
  file: string,
  default: boolean
}

const completionMap: Map<string, objtype> = new Map()
let completionAry: objtype[] = []
let completionItemAry: CompletionItem[] = []


// 1. 基本补全请求处理
connection.onCompletion(
  (params: CompletionParams): CompletionItem[] => {
    // 返回基本的补全列表
    return completionItemAry
  }
);


// 修改初始化处理
connection.onInitialize((params: InitializeParams): InitializeResult => {


  // 确保工作区文件夹存在
  if (params.workspaceFolders && params.workspaceFolders.length > 0) {
    completionItemAry = initCompletionMap(params.workspaceFolders[0].uri)
  }

  return {
    capabilities: {
      semanticTokensProvider: {
        legend,
        full: true,
        range: true
      },
      hoverProvider: true,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.']
      }
    }
  }
})


connection.languages.semanticTokens.on(params => {
  const document = documents.get(params.textDocument.uri)

  if (!document) {
    return {data: []}
  }

  const builder = new SemanticTokensBuilder()
  try {
    const text = document.getText()

    const lexer = new SubhutiLexer(es6Tokens)
    let tokens = lexer.tokenize(text)
    const parser = new OvsParser(tokens)
    let curCst = parser.Program()
    const ast = ovsToAstUtil.createProgramAst(curCst)
    TokenProvider.visitNode(ast)
    JsonUtil.log(TokenProvider.tokens)
    const tokens1 = TokenProvider.tokens

    if (tokens1.length) {
      for (const semanticToken of tokens1) {
        builder.push(
          semanticToken.line,
          semanticToken.char,
          semanticToken.length,
          semanticToken.tokenType,
          semanticToken.tokenModifiers,
        )
      }
    } else {
    }
  } catch (e: Error) {
  }

  const build = builder.build()
  return build
})

// 2. 补全项解析处理 - 对应 completionItem/resolve
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    // 根据 item.data 加载详细信息
    if (item.data === 1) {
      item.detail = 'Function details';
      item.documentation = {
        kind: MarkupKind.Markdown,
        value: '# Documentation\n...'
      };
    }
    return item;
  }
);

// 启动服务器
documents.listen(connection)
connection.listen()
