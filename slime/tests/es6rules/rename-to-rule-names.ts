/**
 * 批量重命名测试文件：让文件名包含精确的规则名
 * 格式：编号-规则名.js
 * 例如：001-Literal.js (而不是 001-literal.js)
 */

import * as fs from 'fs'
import * as path from 'path'

// 规则名映射表（从Es2025Parser.ts提取的152个规则）
const ruleMapping: Record<string, string> = {
  // Literals (001-007)
  '001': 'Literal',
  '002': 'ArrayLiteral',
  '003': 'ObjectLiteral',
  '004': 'LiteralPropertyName',
  '005': 'TemplateLiteral',
  '006': 'TemplateSpans',
  '007': 'TemplateMiddleList',

  // Identifiers (101-120)
  '101': 'IdentifierReference',
  '102': 'BindingIdentifier',
  '103': 'LabelIdentifier',
  '104': 'DotIdentifier',
  '105': 'IdentifierName',
  '106': 'BindingPattern',
  '107': 'ObjectBindingPattern',
  '108': 'ArrayBindingPattern',
  '109': 'BindingPropertyList',
  '110': 'BindingElementList',
  '111': 'BindingElisionElement',
  '112': 'BindingProperty',
  '113': 'BindingElement',
  '114': 'SingleNameBinding',
  '115': 'BindingRestElement',
  '116': 'ForBinding',
  '117': 'ImportedDefaultBindingCommaNameSpaceImport',
  '118': 'ImportedDefaultBindingCommaNamedImports',
  '119': 'ImportedDefaultBinding',
  '120': 'ImportedBinding',

  // Expressions (201-232)
  '201': 'PrimaryExpression',
  '202': 'ParenthesizedExpression',
  '203': 'NewMemberExpressionArguments',
  '204': 'MemberExpression',
  '205': 'DotMemberExpression',
  '206': 'BracketExpression',
  '207': 'NewExpression',
  '208': 'CallExpression',
  '209': 'LeftHandSideExpression',
  '210': 'PostfixExpression',
  '211': 'UnaryExpression',
  '212': 'MultiplicativeExpression',
  '213': 'AdditiveExpression',
  '214': 'ShiftExpression',
  '215': 'RelationalExpression',
  '216': 'EqualityExpression',
  '217': 'BitwiseANDExpression',
  '218': 'BitwiseXORExpression',
  '219': 'BitwiseORExpression',
  '220': 'LogicalANDExpression',
  '221': 'LogicalORExpression',
  '222': 'ConditionalExpression',
  '223': 'Expression',
  '224': 'AssignmentExpression',
  '225': 'ExpressionStatement',
  '226': 'FunctionExpression',
  '227': 'GeneratorExpression',
  '228': 'YieldExpression',
  '229': 'AwaitExpression',
  '230': 'ClassExpression',
  '231': 'DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression',
  '232': 'AssignmentExpressionEmptySemicolon',

  // Operators (301-302)
  '301': 'MultiplicativeOperator',
  '302': 'AssignmentOperator',

  // Statements (401-428)
  '401': 'Statement',
  '402': 'BreakableStatement',
  '403': 'BlockStatement',
  '404': 'EmptyStatement',
  '405': 'IfStatement',
  '406': 'IterationStatement',
  '407': 'DoWhileStatement',
  '408': 'WhileStatement',
  '409': 'ForStatement',
  '410': 'ForInOfStatement',
  '411': 'ForDeclaration',
  '412': 'ContinueStatement',
  '413': 'BreakStatement',
  '414': 'ReturnStatement',
  '415': 'WithStatement',
  '416': 'SwitchStatement',
  '417': 'LabelledStatement',
  '418': 'ThrowStatement',
  '419': 'TryStatement',
  '420': 'DebuggerStatement',
  '421': 'FunctionFormalParameters',
  '422': 'FormalParameterList',
  '423': 'FunctionFormalParametersBodyDefine',
  '424': 'StatementList',
  '425': 'StatementListItem',
  '426': 'ImportSpecifier',
  '427': 'ModuleSpecifier',
  '428': 'ExportSpecifier',

  // Functions (501-506)
  '501': 'FunctionDeclaration',
  '502': 'FunctionBodyDefine',
  '503': 'FunctionBody',
  '504': 'ArrowFunction',
  '505': 'GeneratorMethod',
  '506': 'GeneratorDeclaration',

  // Classes (601-610)
  '601': 'PropertyNameMethodDefinition',
  '602': 'GetMethodDefinition',
  '603': 'SetMethodDefinition',
  '604': 'MethodDefinition',
  '605': 'ClassDeclaration',
  '606': 'ClassTail',
  '607': 'ClassHeritage',
  '608': 'ClassBody',
  '609': 'ClassElementList',
  '610': 'ClassElement',

  // Modules (701-713)
  '701': 'ModuleItemList',
  '702': 'ImportDeclaration',
  '703': 'ImportClause',
  '704': 'NameSpaceImport',
  '705': 'NamedImports',
  '706': 'FromClause',
  '707': 'ImportsList',
  '708': 'AsteriskFromClauseEmptySemicolon',
  '709': 'ExportClauseFromClauseEmptySemicolon',
  '710': 'ExportClauseEmptySemicolon',
  '711': 'ExportDeclaration',
  '712': 'ExportClause',
  '713': 'ExportsList',

  // Others (801-934) - 完整的34个规则
  '801': 'ElementList',
  '802': 'Elision',
  '803': 'SpreadElement',
  '804': 'PropertyDefinitionList',
  '805': 'PropertyDefinition',
  '806': 'PropertyName',
  '807': 'ComputedPropertyName',
  '808': 'CoverInitializedName',
  '809': 'SuperProperty',
  '810': 'MetaProperty',
  '811': 'NewTarget',
  '812': 'SuperCall',
  '813': 'Arguments',
  '814': 'ArgumentList',
  '815': 'Declaration',
  '816': 'VariableLetOrConst',
  '817': 'VariableDeclarationList',
  '818': 'VariableDeclaration',
  '819': 'VariableDeclarator',
  '820': 'Initializer',
  '821': 'HoistableDeclaration',
  '822': 'Block',
  '823': 'CaseBlock',
  '824': 'CaseClauses',
  '825': 'CaseClause',
  '826': 'DefaultClause',
  '827': 'LabelledItem',
  '828': 'Catch',
  '829': 'Finally',
  '830': 'CatchParameter',
  '831': 'RestParameter',
  '832': 'ConciseBody',
  '833': 'FieldDefinition',
  '834': 'Program',
  
  // 原本900系列的规则（现在对应901-934）
  '901': 'ElementList',
  '902': 'Elision',
  '903': 'SpreadElement',
  '904': 'PropertyDefinitionList',
  '905': 'PropertyDefinition',
  '906': 'PropertyName',
  '907': 'ComputedPropertyName',
  '908': 'CoverInitializedName',
  '909': 'SuperProperty',
  '910': 'MetaProperty',
  '911': 'NewTarget',
  '912': 'SuperCall',
  '913': 'Arguments',
  '914': 'ArgumentList',
  '915': 'Declaration',
  '916': 'VariableLetOrConst',
  '917': 'VariableDeclarationList',
  '918': 'VariableDeclaration',
  '919': 'VariableDeclarator',
  '920': 'Initializer',
  '921': 'HoistableDeclaration',
  '922': 'Block',
  '923': 'CaseBlock',
  '924': 'CaseClauses',
  '925': 'CaseClause',
  '926': 'DefaultClause',
  '927': 'LabelledItem',
  '928': 'Catch',
  '929': 'Finally',
  '930': 'CatchParameter',
  '931': 'RestParameter',
  '932': 'ConciseBody',
  '933': 'FieldDefinition',
  '934': 'Program',
}

// 递归查找所有 .js 文件
function findAllJsFiles(dir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findAllJsFiles(fullPath))
    } else if (item.endsWith('.js') && /^\d{3}-/.test(item)) {
      files.push(fullPath)
    }
  }

  return files
}

// 提取文件名中的编号
function extractNumber(filename: string): string | null {
  const match = filename.match(/^(\d{3})-/)
  return match ? match[1] : null
}

// 执行重命名
function renameFiles() {
  const baseDir = path.join(__dirname)
  const files = findAllJsFiles(baseDir)

  console.log(`找到 ${files.length} 个测试文件\n`)

  let renamed = 0
  let skipped = 0
  let errors = 0

  for (const file of files) {
    const dir = path.dirname(file)
    const oldName = path.basename(file)
    const number = extractNumber(oldName)

    if (!number) {
      console.log(`⚠️  跳过：${oldName} (无法提取编号)`)
      skipped++
      continue
    }

    const ruleName = ruleMapping[number]
    if (!ruleName) {
      console.log(`⚠️  跳过：${oldName} (编号 ${number} 无对应规则)`)
      skipped++
      continue
    }

    const newName = `${number}-${ruleName}.js`

    if (oldName === newName) {
      skipped++
      continue
    }

    const oldPath = path.join(dir, oldName)
    const newPath = path.join(dir, newName)

    try {
      fs.renameSync(oldPath, newPath)
      console.log(`✅ ${oldName} → ${newName}`)
      renamed++
    } catch (err) {
      console.error(`❌ 重命名失败：${oldName}`)
      console.error(`   错误：${err}`)
      errors++
    }
  }

  console.log(`\n========== 重命名完成 ==========`)
  console.log(`✅ 成功重命名：${renamed} 个`)
  console.log(`⏭️  跳过：${skipped} 个`)
  console.log(`❌ 失败：${errors} 个`)
  console.log(`📊 总计：${files.length} 个文件`)
}

// 执行
renameFiles()

