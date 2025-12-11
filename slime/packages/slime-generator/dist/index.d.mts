import { SlimeBaseNode } from "slime-ast/src/SlimeESTree.ts";
import SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts";
import { SubhutiSourceLocation } from "subhuti/src/struct/SubhutiCst.ts";

//#region src/SlimeCodeMapping.d.ts
declare class SlimeCodeLocation {
  type: string;
  line: number;
  value: string;
  column: number;
  length: number;
  index: number;
}
declare class SlimeCodeMapping {
  source: SlimeCodeLocation;
  generate: SlimeCodeLocation;
}
interface SlimeGeneratorResult {
  code: string;
  mapping: SlimeCodeMapping[];
}
//#endregion
//#region src/SlimeGenerator.d.ts
declare class SlimeGenerator {
  static mappings: SlimeCodeMapping[];
  static lastSourcePosition: SlimeCodeLocation;
  static generatePosition: SlimeCodeLocation;
  static sourceCodeIndex: number;
  private static generateCode;
  private static generateLine;
  private static generateColumn;
  private static generateIndex;
  private static tokens;
  private static indent;
  private static findNextTokenLocByTypeAndIndex;
  static generator(node: SlimeBaseNode, tokens: SubhutiMatchToken[]): SlimeGeneratorResult;
  private static generatorProgram;
  private static generatorModuleDeclarations;
  private static generatorImportDeclaration;
  /** 生成 ES2025 Import Attributes: with { type: "json" } 或 with {} */
  private static generatorAttributes;
  private static generatorImportSpecifier;
  private static generatorImportDefaultSpecifier;
  private static generatorImportNamespaceSpecifier;
  private static generatorExportNamedDeclaration;
  private static generatorExportSpecifier;
  private static generatorExportAllDeclaration;
  private static generatorNodes;
  private static generatorExpressionStatement;
  private static generatorYieldExpression;
  private static generatorAwaitExpression;
  private static generatorTemplateLiteral;
  private static generatorCallExpression;
  private static generatorFunctionExpression;
  /**
   * 生成箭头函数表达式
   */
  private static generatorArrowFunctionExpression;
  /**
   * 生成二元运算表达式
   */
  private static generatorBinaryExpression;
  /**
   * 生成函数参数列表
   * @param params SlimeFunctionParam[] 参数列表
   * @param lParenLoc 左括号精确位置
   * @param rParenLoc 右括号精确位置
   */
  private static generatorFunctionParams;
  /**
   * 判断节点是否"复杂"（需要换行）
   * 复杂的定义：
   * - CallExpression（函数调用）
   * - ObjectExpression（超过1个属性）
   * - ArrayExpression（包含复杂元素）
   */
  private static isComplexNode;
  private static generatorArrayExpression;
  private static generatorObjectExpression;
  private static generatorParenthesizedExpression;
  private static generatorSequenceExpression;
  private static generatorPrivateIdentifier;
  private static generatorProperty;
  private static patternTypes;
  private static generatorIdentifier;
  private static generatorFunctionDeclaration;
  private static generatorClassDeclaration;
  private static generatorClassExpression;
  private static generatorClassBody;
  private static generatorMethodDefinition;
  private static generatorPropertyDefinition;
  private static generatorNewExpression;
  /**
   * 生成任意节点
   * @param node AST 节点
   * @param addNewLineAfter 如果节点是 BlockStatement，是否在 } 后换行（默认 false）
   */
  private static generatorNode;
  private static generatorUnaryExpression;
  private static generatorUpdateExpression;
  private static generatorConditionalExpression;
  private static generatorAssignmentExpression;
  private static generatorObjectPattern;
  private static generatorArrayPattern;
  private static generatorRestElement;
  private static generatorSpreadElement;
  private static generatorAssignmentPattern;
  /**
   * 生成块语句（{...}）
   * @param node BlockStatement 节点
   * @param addNewLineAfter 是否在 } 后换行（默认 false）
   */
  private static generatorBlockStatement;
  private static generatorReturnStatement;
  private static addSpacing;
  private static addDot;
  private static addComma;
  private static addLParen;
  private static addRParen;
  private static addLBrace;
  private static addRBrace;
  private static addLBracket;
  private static addRBracket;
  private static generatorMemberExpression;
  /**
   * 生成可选调用表达式：obj?.method() 或 obj?.()
   */
  private static generatorOptionalCallExpression;
  /**
   * 生成可选成员访问表达式：obj?.prop 或 obj?.[expr]
   */
  private static generatorOptionalMemberExpression;
  /**
   * 生成变量声明（内部辅助方法）
   * @param node VariableDeclaration 节点
   * @param addSemicolonAndNewLine 是否添加分号和换行（默认 true）
   */
  private static generatorVariableDeclarationCore;
  private static generatorVariableDeclaration;
  static get lastMapping(): SlimeCodeMapping;
  private static generatorVariableDeclarator;
  private static generatorNumberLiteral;
  private static generatorStringLiteral;
  /**
   * 生成 ESTree 标准的 Literal 节点
   * Literal 可以是：number, string, boolean, null, RegExp, BigInt
   */
  private static generatorLiteral;
  static cstLocationToSlimeLocation(cstLocation: SubhutiSourceLocation): SlimeCodeLocation;
  private static addCodeAndMappingsBySourcePosition;
  private static addCodeAndMappingsFindLoc;
  /**
   * 添加代码并记录 source map 映射
   *
   * 参数要求：
   * - token 必须符合 SubhutiCreateToken 接口，包含：
   *   - type: token 类型（必需）- 用于标识 token 的种类
   *   - name: token 名称（必需）
   *   - value: token 值（必需）- 实际生成的代码内容
   *
   * 使用场景：
   * - 需要在生成代码和原始代码之间建立映射关系
   * - 用于调试时能够定位到原始代码位置
   *
   * 注意：如果不需要 source map，使用 addString() 更高效
   */
  private static addCodeAndMappings;
  /**
   * 添加代码 token（可能记录 source map 映射）
   *
   * 使用场景：
   * 1. 预定义的 token：关键字（if, function, class）、符号（;, {, }）
   * 2. 需要 source map 映射的内容：标识符、字面量等
   * 3. 配合 addCodeAndMappings() 使用
   *
   * 参数要求：
   * - 必须符合 SubhutiCreateToken 接口（包含 type, name, value 属性）
   *
   * 与 addString() 的区别：
   * - addCode()：需要完整的 token 对象，可能记录 source map
   * - addString()：只需字符串，性能更好，不记录 source map
   */
  private static addCode;
  /**
   * 添加字符串代码（不记录 source map 映射）
   *
   * 使用场景：
   * 1. 动态内容：运算符（+, -, *, /）、标识符名称、字面量值
   * 2. 格式化字符：空格、换行等
   * 3. 不需要调试映射的内容
   *
   * 与 addCode() 的区别：
   * - addCode()：需要 SubhutiCreateToken 对象，可能记录 source map
   * - addString()：直接字符串拼接，性能更好，不记录 source map
   *
   * 性能优势：避免对象创建和属性访问，性能提升约 2-3倍
   */
  private static addString;
  private static addSemicolonAndNewLine;
  private static addSemicolon;
  private static addNewLine;
  /**
   * 阶段2：添加当前缩进（2个空格 * indent层级）
   */
  private static addIndent;
  /**
   * @deprecated 使用 addSpacing() 代替，保持代码风格统一
   *
   * 该方法已不再使用，所有空格处理已统一为 addSpacing()
   * 保留此方法仅为了向后兼容（如果有外部调用）
   */
  private static addCodeSpacing;
  private static addMappings;
  /**
   * 生成 if 语句
   * if (test) consequent [else alternate]
   */
  private static generatorIfStatement;
  /**
   * 生成 for 语句
   */
  private static generatorForStatement;
  /**
   * 生成 for...in / for...of 语句
   */
  private static generatorForInOfStatement;
  /**
   * 生成 while 语句
   */
  private static generatorWhileStatement;
  /**
   * 生成 do...while 语句
   */
  private static generatorDoWhileStatement;
  /**
   * 生成 switch 语句
   */
  private static generatorSwitchStatement;
  /**
   * 生成 switch case 分支
   */
  private static generatorSwitchCase;
  /**
   * 生成 try 语句
   */
  private static generatorTryStatement;
  /**
   * 生成 catch 子句
   *
   * 注意：虽然大多数情况下 catch 会在 TryStatement 中直接处理，
   * 但某些情况下可能需要单独生成 CatchClause 节点，因此保留此方法。
   */
  private static generatorCatchClause;
  /**
   * 生成 throw 语句
   */
  private static generatorThrowStatement;
  /**
   * 生成 break 语句
   */
  private static generatorBreakStatement;
  /**
   * 生成 continue 语句
   */
  private static generatorContinueStatement;
  /**
   * 生成标签语句
   */
  private static generatorLabeledStatement;
  /**
   * 生成 with 语句
   */
  private static generatorWithStatement;
  /**
   * 生成 debugger 语句
   */
  private static generatorDebuggerStatement;
  /**
   * 生成空语句
   */
  private static generatorEmptyStatement;
  /**
   * 生成 export default 声明
   * export default expression
   */
  private static generatorExportDefaultDeclaration;
  /**
   * 生成 ChainExpression（可选链表达式）
   * 例如: obj?.prop 或 obj?.method()
   */
  private static generatorChainExpression;
  /**
   * 生成 ImportExpression（动态导入）
   * 例如: import('./module.js')
   */
  private static generatorImportExpression;
  /**
   * 生成 StaticBlock（类的静态初始化块）
   * 例如: static { console.log('init') }
   */
  private static generatorStaticBlock;
}
//#endregion
export { SlimeCodeLocation, SlimeGenerator, SlimeGeneratorResult };