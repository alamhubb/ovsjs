// Parser
export { default as CssTsParser } from './parser/CssTsParser.js'
export { default as CssTsTokenConsumer, cssTsTokens, CssTsContextualKeywordTypes } from './parser/CssTsTokenConsumer.js'

// AST Transformer
export { default as cssTsCstToAst, CssTsCstToAst, type CssStyleInfo } from './factory/CssTsCstToAst.js'

// Utility functions
export { 
  camelToKebab, 
  kebabToCamel,
  collectAllCssClasses, 
  generateCssClsInterface, 
  generateCssClsStyles,
  analyzeUsedClasses,
  // 样式冲突替换
  getCssProperty,
  registerCssPropertyMap,
  replaceConflictingStyles,
} from './utils/cssUtils.js'

// Runtime
export { cssts, $cls } from './runtime/index.js'
