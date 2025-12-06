import { SlimeArrayElement, SlimeArrayExpression, SlimeArrayPattern, SlimeArrowFunctionExpression, SlimeAssignmentProperty, SlimeBlockStatement, SlimeCallArgument, SlimeClassBody, SlimeClassDeclaration, SlimeClassExpression, SlimeDeclaration, SlimeExportAllDeclaration, SlimeExportDefaultDeclaration, SlimeExportNamedDeclaration, SlimeExportSpecifier, SlimeExportSpecifierItem, SlimeExpression, SlimeExpressionStatement, SlimeFunctionDeclaration, SlimeFunctionExpression, SlimeFunctionParam, SlimeIdentifier, SlimeImportDeclaration, SlimeImportDefaultSpecifier, SlimeImportNamespaceSpecifier, SlimeImportSpecifier, SlimeImportSpecifierItem, SlimeLiteral, SlimeMethodDefinition, SlimeModuleDeclaration, SlimeNumericLiteral, SlimeObjectExpression, SlimeObjectPattern, SlimePattern, SlimeProgram, SlimeProperty, SlimePropertyDefinition, SlimeRestElement, SlimeReturnStatement, SlimeSpreadElement, SlimeStatement, SlimeStringLiteral, SlimeSuper, SlimeVariableDeclaration, SlimeVariableDeclarator } from "slime-ast/src/SlimeESTree.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SubhutiParser from "subhuti/src/SubhutiParser.ts";
import SubhutiTokenConsumer from "subhuti/src/SubhutiTokenConsumer.ts";
import { SubhutiCreateToken } from "subhuti/src/struct/SubhutiCreateToken.ts";

//#region src/language/SlimeCstToAstUtil.d.ts
declare function checkCstName(cst: SubhutiCst, cstName: string): string;
declare function throwNewError(errorMsg?: string): void;
/**
 * CST �?AST 转换�?
 *
 * ## 两层架构设计
 *
 * ### 第一层：AST 工厂�?(SlimeNodeCreate.ts / SlimeAstUtil)
 * - �?ESTree AST 节点类型一一对应的纯粹创建方�?
 * - 不依�?CST 结构，只接收参数创建节点
 * - 示例：createIdentifier(name, loc) �?SlimeIdentifier
 *
 * ### 第二层：CST 转换�?(本类)
 * - �?CST 规则一一对应的转换方�?(createXxxAst)
 * - 解析 CST 结构，提取信息，调用 AST 工厂�?
 * - 中心转发方法：createAstFromCst(cst) - 自动根据类型分发
 *
 * ## 方法命名规范
 *
 * | 方法类型 | 命名模式 | 说明 |
 * |----------|----------|------|
 * | CST 规则转换 | createXxxAst | �?@SubhutiRule 规则一一对应 |
 * | AST 类型映射 | createXxxAst | CST 规则�?�?AST 类型名时使用 |
 * | 内部辅助方法 | private createXxxAst | ES2025 专用处理�?|
 * | 工具方法 | convertXxx / isXxx | 表达式转模式、检查方法等 |
 *
 * ## 方法命名规范
 *
 * 所�?CST 转换方法命名�?createXxxAst，其�?Xxx �?CST 规则名一致�?
 * 内部调用 SlimeNodeCreate / SlimeAstUtil 中与 AST 类型名一致的工厂方法�?
 *
 * 例如�?
 * - createArrayLiteralAst (CST 规则�? �?内部调用 createArrayExpression (AST 类型�?
 * - createObjectLiteralAst (CST 规则�? �?内部调用 createObjectExpression (AST 类型�?
 * - createCatchAst (CST 规则�? �?内部调用 createCatchClause (AST 类型�?
 *
 * ## 核心分发方法
 * - createAstFromCst: 中心转发，根�?CST 类型显式分发到对应方�?
 * - createStatementDeclarationAst: 语句/声明分发
 *
 * ## 辅助处理方法
 * - toProgram: Program 入口处理
 */
declare class SlimeCstToAst {
  private readonly expressionAstCache;
  /**
   * 中心转发方法：根�?CST 节点类型显式分发到对应的转换方法
   *
   * 这是 CST �?AST 两层架构的核心入口：
   * - 第一层：AST 工厂�?(SlimeNodeCreate.ts) - 纯粹�?AST 节点创建
   * - 第二层：CST 转换�?(本类) - 解析 CST 结构，调�?AST 工厂�?
   *
   * @param cst CST 节点
   * @returns 对应�?AST 节点
   */
  createAstFromCst(cst: SubhutiCst): any;
  /**
   * 创建 IdentifierReference �?AST
   *
   * 语法：IdentifierReference -> Identifier | yield | await
   *
   * IdentifierReference 是对 Identifier 的引用包装，
   * �?ES 规范中用于区分标识符的不同使用场景�?
   */
  createIdentifierReferenceAst(cst: SubhutiCst): SlimeIdentifier;
  /**
   * 创建 LabelIdentifier �?AST
   *
   * 语法：LabelIdentifier -> Identifier | [~Yield] yield | [~Await] await
   *
   * LabelIdentifier 用于 break/continue 语句的标签和 LabelledStatement 的标签�?
   * 结构�?IdentifierReference 相同�?
   */
  createLabelIdentifierAst(cst: SubhutiCst): SlimeIdentifier;
  createIdentifierAst(cst: SubhutiCst): SlimeIdentifier;
  /**
   * [入口方法] 将顶�?CST 转换�?Program AST
   *
   * 存在必要性：这是外部调用的主入口，支�?Module、Script、Program 多种顶层 CST�?
   */
  toProgram(cst: SubhutiCst): SlimeProgram;
  createModuleItemListAst(cst: SubhutiCst): Array<SlimeStatement | SlimeModuleDeclaration>;
  /**
   * Program CST �?AST
   *
   * 存在必要性：Program 是顶层入口规则，需要处�?Script �?Module 两种情况�?
   */
  createProgramAst(cst: SubhutiCst): SlimeProgram;
  /**
   * Script CST �?AST
   */
  createScriptAst(cst: SubhutiCst): SlimeProgram;
  /**
   * ScriptBody CST �?AST
   */
  createScriptBodyAst(cst: SubhutiCst): SlimeProgram;
  /**
   * Module CST �?AST
   */
  createModuleAst(cst: SubhutiCst): SlimeProgram;
  /**
   * ModuleBody CST �?AST
   */
  createModuleBodyAst(cst: SubhutiCst): SlimeProgram;
  /**
   * NameSpaceImport CST �?AST
   * NameSpaceImport -> * as ImportedBinding
   */
  createNameSpaceImportAst(cst: SubhutiCst): SlimeImportNamespaceSpecifier;
  /**
   * NamedImports CST 转 AST
   * NamedImports -> { } | { ImportsList } | { ImportsList , }
   */
  createNamedImportsAst(cst: SubhutiCst): Array<SlimeImportSpecifier>;
  /**
   * ImportsList CST �?AST
   * ImportsList -> ImportSpecifier (, ImportSpecifier)*
   */
  createImportsListAst(cst: SubhutiCst): Array<SlimeImportSpecifier>;
  /**
   * ImportSpecifier CST �?AST
   * ImportSpecifier -> ImportedBinding | ModuleExportName as ImportedBinding
   */
  createImportSpecifierAst(cst: SubhutiCst): SlimeImportSpecifier;
  /**
   * AttributeKey CST �?AST
   * AttributeKey -> IdentifierName | StringLiteral
   */
  createAttributeKeyAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral;
  /**
   * ExportFromClause CST �?AST
   * ExportFromClause -> * | * as ModuleExportName | NamedExports
   */
  createExportFromClauseAst(cst: SubhutiCst): any;
  /**
   * WithEntries CST �?AST
   * WithEntries -> AttributeKey : StringLiteral (, AttributeKey : StringLiteral)*
   */
  createWithEntriesAst(cst: SubhutiCst): any[];
  createModuleItemAst(item: SubhutiCst): SlimeStatement | SlimeModuleDeclaration | SlimeStatement[] | undefined;
  createImportDeclarationAst(cst: SubhutiCst): SlimeImportDeclaration;
  /** 解析 WithClause: with { type: "json" } */
  createWithClauseAst(cst: SubhutiCst): {
    attributes: any[];
    withToken: any;
  };
  createFromClauseAst(cst: SubhutiCst): {
    source: SlimeStringLiteral;
    fromToken?: any;
  };
  createModuleSpecifierAst(cst: SubhutiCst): SlimeStringLiteral;
  createImportClauseAst(cst: SubhutiCst): {
    specifiers: Array<SlimeImportSpecifierItem>;
    lBraceToken?: any;
    rBraceToken?: any;
  };
  createImportedDefaultBindingAst(cst: SubhutiCst): SlimeImportDefaultSpecifier;
  createImportedBindingAst(cst: SubhutiCst): SlimeIdentifier;
  /** 返回包装类型的版本，包含 brace tokens */
  createNamedImportsListAstWrapped(cst: SubhutiCst): {
    specifiers: Array<SlimeImportSpecifierItem>;
    lBraceToken?: any;
    rBraceToken?: any;
  };
  createIdentifierNameAst(cst: SubhutiCst): SlimeIdentifier;
  createBindingIdentifierAst(cst: SubhutiCst): SlimeIdentifier;
  createStatementListAst(cst: SubhutiCst): Array<SlimeStatement>;
  createStatementListItemAst(cst: SubhutiCst): Array<SlimeStatement>;
  createStatementAst(cst: SubhutiCst): Array<SlimeStatement>;
  /**
   * [核心分发方法] 根据 CST 节点类型创建对应�?Statement/Declaration AST
   *
   * 存在必要性：ECMAScript 语法�?Statement �?Declaration 有多种具体类型，
   * 需要一个统一的分发方法来处理各种语句和声明�?
   *
   * 处理的节点类型包括：
   * - Statement 包装节点 �?递归处理子节�?
   * - BreakableStatement �?IterationStatement | SwitchStatement
   * - VariableStatement �?VariableDeclaration
   * - ExpressionStatement �?ExpressionStatement
   * - IfStatement, ForStatement, WhileStatement 等具体语�?
   * - FunctionDeclaration, ClassDeclaration 等声�?
   */
  createStatementDeclarationAst(cst: SubhutiCst): any;
  createExportDeclarationAst(cst: SubhutiCst): SlimeExportDefaultDeclaration | SlimeExportNamedDeclaration | SlimeExportAllDeclaration;
  /**
   * 创建 NamedExports AST (export { a, b, c })
   */
  createNamedExportsAst(cst: SubhutiCst): SlimeExportSpecifierItem[];
  /**
   * 创建 ExportsList AST
   */
  createExportsListAst(cst: SubhutiCst): SlimeExportSpecifierItem[];
  /**
   * 创建 ExportSpecifier AST
   */
  createExportSpecifierAst(cst: SubhutiCst): SlimeExportSpecifier;
  /**
   * 创建 ModuleExportName AST
   */
  createModuleExportNameAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral;
  createDeclarationAst(cst: SubhutiCst): SlimeDeclaration;
  createLexicalDeclarationAst(cst: SubhutiCst): SlimeVariableDeclaration;
  createLexicalBindingAst(cst: SubhutiCst): SlimeVariableDeclarator;
  /**
   * 创建 var 变量声明语句 AST
   * ES2025 VariableStatement: var VariableDeclarationList ;
   */
  createVariableStatementAst(cst: SubhutiCst): SlimeVariableDeclaration;
  /**
   * �?VariableDeclaration CST 创建 VariableDeclarator AST
   * VariableDeclaration: BindingIdentifier Initializer? | BindingPattern Initializer
   */
  createVariableDeclaratorFromVarDeclaration(cst: SubhutiCst): SlimeVariableDeclarator;
  createHoistableDeclarationAst(cst: SubhutiCst): SlimeDeclaration;
  createGeneratorDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration;
  createAsyncFunctionDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration;
  createAsyncGeneratorDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration;
  createVariableDeclarationAst(cst: SubhutiCst): SlimeVariableDeclaration;
  createVariableDeclarationListAst(cst: SubhutiCst): SlimeVariableDeclarator[];
  createClassDeclarationAst(cst: SubhutiCst): SlimeClassDeclaration;
  createClassTailAst(cst: SubhutiCst): {
    superClass: SlimeExpression | null;
    body: SlimeClassBody;
    extendsToken?: any;
    lBraceToken?: any;
    rBraceToken?: any;
  };
  createClassHeritageAst(cst: SubhutiCst): SlimeExpression;
  createClassHeritageAstWithToken(cst: SubhutiCst): {
    superClass: SlimeExpression;
    extendsToken?: any;
  };
  createInitializerAst(cst: SubhutiCst): SlimeExpression;
  createFieldDefinitionAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimePropertyDefinition;
  /**
   * 检�?ClassElementName/PropertyName 是否是计算属性名
   */
  isComputedPropertyName(cst: SubhutiCst): boolean;
  /**
   * [AST 类型映射] PrivateIdentifier 终端�?�?Identifier AST
   *
   * 存在必要性：PrivateIdentifier �?CST 中是一个终端符（token），
   * 但在 ESTree AST 中需要表示为 Identifier 节点，name �?# 开头�?
   *
   * PrivateIdentifier :: # IdentifierName
   * AST 表示：{ type: "Identifier", name: "#count" }
   */
  createPrivateIdentifierAst(cst: SubhutiCst): SlimeIdentifier;
  /**
   * 检�?CST 节点是否表示 static 修饰�?
   * 兼容 Static �?IdentifierNameTok (value='static') 两种情况
   */
  isStaticModifier(cst: SubhutiCst | null): boolean;
  createClassBodyAst(cst: SubhutiCst): SlimeClassBody;
  /**
   * 创建 ClassStaticBlock AST (ES2022)
   * ClassStaticBlock: static { ClassStaticBlockBody }
   */
  createClassStaticBlockAst(cst: SubhutiCst): any;
  /**
   * GeneratorMethod CST �?AST
   * GeneratorMethod -> * ClassElementName ( UniqueFormalParameters ) { GeneratorBody }
   */
  createGeneratorMethodAst(cst: SubhutiCst): SlimeMethodDefinition;
  /**
   * GeneratorBody CST �?AST（透传�?FunctionBody�?
   */
  createGeneratorBodyAst(cst: SubhutiCst): Array<SlimeStatement>;
  /**
   * AsyncMethod CST �?AST
   * AsyncMethod -> async ClassElementName ( UniqueFormalParameters ) { AsyncFunctionBody }
   */
  createAsyncMethodAst(cst: SubhutiCst): SlimeMethodDefinition;
  /**
   * AsyncFunctionBody CST �?AST（透传�?FunctionBody�?
   */
  createAsyncFunctionBodyAst(cst: SubhutiCst): Array<SlimeStatement>;
  /**
   * AsyncGeneratorMethod CST �?AST
   */
  createAsyncGeneratorMethodAst(cst: SubhutiCst): SlimeMethodDefinition;
  /**
   * AsyncGeneratorBody CST �?AST（透传�?FunctionBody�?
   */
  createAsyncGeneratorBodyAst(cst: SubhutiCst): Array<SlimeStatement>;
  /**
   * 内部辅助方法：创建 MethodDefinition AST
   */
  private createMethodDefinitionAstInternal;
  /**
   * ClassElement CST �?AST
   * ClassElement -> MethodDefinition | static MethodDefinition | FieldDefinition | ...
   */
  createClassElementAst(cst: SubhutiCst): any;
  /**
   * ClassElementName CST �?AST
   * ClassElementName :: PropertyName | PrivateIdentifier
   */
  createClassElementNameAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral | SlimeExpression;
  /**
   * ClassElementList CST �?AST
   */
  createClassElementListAst(cst: SubhutiCst): any[];
  /**
   * ClassStaticBlockBody CST �?AST
   */
  createClassStaticBlockBodyAst(cst: SubhutiCst): Array<SlimeStatement>;
  /**
   * ClassStaticBlockStatementList CST �?AST
   */
  createClassStaticBlockStatementListAst(cst: SubhutiCst): Array<SlimeStatement>;
  /**
   * AsyncArrowBindingIdentifier CST �?AST
   */
  createAsyncArrowBindingIdentifierAst(cst: SubhutiCst): SlimeIdentifier;
  /**
   * AsyncConciseBody CST �?AST
   */
  createAsyncConciseBodyAst(cst: SubhutiCst): SlimeBlockStatement | SlimeExpression;
  /**
   * AsyncArrowHead CST �?AST（透传�?
   */
  createAsyncArrowHeadAst(cst: SubhutiCst): any;
  createFormalParameterListAst(cst: SubhutiCst): SlimePattern[];
  createBindingElementAst(cst: SubhutiCst): any;
  createSingleNameBindingAst(cst: SubhutiCst): any;
  createFunctionRestParameterAst(cst: SubhutiCst): SlimeRestElement;
  createBindingRestElementAst(cst: SubhutiCst): SlimeRestElement;
  createFunctionBodyAst(cst: SubhutiCst): Array<SlimeStatement>;
  createFunctionStatementListAst(cst: SubhutiCst): Array<SlimeStatement>;
  /**
   * 创建 FormalParameterList AST (包装版本)
   */
  createFormalParameterListAstWrapped(cst: SubhutiCst): SlimeFunctionParam[];
  createMethodDefinitionAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition;
  /**
   * [内部方法] 从直接的标识符创建方法定�?
   * 处理 ES2025 Parser �?IdentifierNameTok ( UniqueFormalParameters ) { FunctionBody } 结构
   * @internal
   */
  private createMethodDefinitionMethodDefinitionFromIdentifier;
  /**
   * [内部方法] 普通方法定�?
   * 处理 ES2025 Parser �?ClassElementName ( UniqueFormalParameters ) { FunctionBody } 结构
   * @internal
   */
  private createMethodDefinitionClassElementNameAst;
  /**
   * [内部方法] getter 方法
   * 处理 ES2025 Parser �?get ClassElementName ( ) { FunctionBody } 结构
   * @internal
   */
  private createMethodDefinitionGetterMethodAst;
  /**
   * [内部方法] setter 方法
   * 处理 ES2025 Parser �?set ClassElementName ( PropertySetParameterList ) { FunctionBody } 结构
   * @internal
   */
  private createMethodDefinitionSetterMethodAst;
  /**
   * [内部方法] getter 方法 (�?IdentifierNameTok="get" 开�?
   * 处理 ES2025 Parser �?IdentifierNameTok="get" ClassElementName ( ) { FunctionBody } 结构
   * @internal
   */
  private createMethodDefinitionGetterMethodFromIdentifier;
  /**
   * [内部方法] setter 方法 (�?IdentifierNameTok="set" 开�?
   * 处理 ES2025 Parser �?IdentifierNameTok="set" ClassElementName ( ... ) { FunctionBody } 结构
   * @internal
   */
  private createMethodDefinitionSetterMethodFromIdentifier;
  /**
   * [内部方法] generator 方法
   * 处理 ES2025 Parser �?* ClassElementName ( UniqueFormalParameters ) { GeneratorBody } 结构
   * @internal
   */
  private createMethodDefinitionGeneratorMethodAst;
  /**
   * [内部方法] generator 方法 (�?MethodDefinition children 直接处理)
   * @internal
   */
  private createMethodDefinitionGeneratorMethodFromChildren;
  /**
   * [内部方法] async 方法
   * 处理 ES2025 Parser �?async ClassElementName ( UniqueFormalParameters ) { AsyncFunctionBody } 结构
   * @internal
   */
  private createMethodDefinitionAsyncMethodAst;
  /**
   * [内部方法] async 方法 (�?MethodDefinition children 直接处理)
   * @internal
   */
  private createMethodDefinitionAsyncMethodFromChildren;
  /**
   * [内部方法] async generator 方法
   * 处理 ES2025 Parser �?async * ClassElementName ( ... ) { AsyncGeneratorBody } 结构
   * @internal
   */
  private createMethodDefinitionAsyncGeneratorMethodAst;
  /**
   * 处理 UniqueFormalParameters CST 节点
   */
  createUniqueFormalParametersAst(cst: SubhutiCst): SlimePattern[];
  /** 返回包装类型的版�?*/
  createUniqueFormalParametersAstWrapped(cst: SubhutiCst): SlimeFunctionParam[];
  /**
   * 处理 PropertySetParameterList
   */
  createPropertySetParameterListAst(cst: SubhutiCst): SlimePattern[];
  /** 返回包装类型的版�?*/
  createPropertySetParameterListAstWrapped(cst: SubhutiCst): SlimeFunctionParam[];
  createFormalParameterAst(cst: SubhutiCst): SlimePattern;
  createBindingPatternAst(cst: SubhutiCst): SlimePattern;
  createArrayBindingPatternAst(cst: SubhutiCst): SlimeArrayPattern;
  createObjectBindingPatternAst(cst: SubhutiCst): SlimeObjectPattern;
  /**
   * AssignmentPattern CST �?AST
   * AssignmentPattern -> ObjectAssignmentPattern | ArrayAssignmentPattern
   */
  createAssignmentPatternAst(cst: SubhutiCst): any;
  /**
   * ObjectAssignmentPattern CST �?AST
   */
  createObjectAssignmentPatternAst(cst: SubhutiCst): SlimeObjectPattern;
  /**
   * ArrayAssignmentPattern CST �?AST
   */
  createArrayAssignmentPatternAst(cst: SubhutiCst): SlimeArrayPattern;
  /**
   * BindingProperty CST �?AST
   * BindingProperty -> SingleNameBinding | PropertyName : BindingElement
   */
  createBindingPropertyAst(cst: SubhutiCst): any;
  /**
   * BindingPropertyList CST 转 AST
   */
  createBindingPropertyListAst(cst: SubhutiCst): any[];
  /**
   * BindingElementList CST �?AST
   */
  createBindingElementListAst(cst: SubhutiCst): any[];
  /**
   * BindingElisionElement CST �?AST
   */
  createBindingElisionElementAst(cst: SubhutiCst): any;
  /**
   * AssignmentPropertyList CST �?AST
   */
  createAssignmentPropertyListAst(cst: SubhutiCst): any[];
  /**
   * AssignmentProperty CST �?AST
   */
  createAssignmentPropertyAst(cst: SubhutiCst): any;
  /**
   * AssignmentElementList CST �?AST
   */
  createAssignmentElementListAst(cst: SubhutiCst): any[];
  /**
   * AssignmentElement CST �?AST
   */
  createAssignmentElementAst(cst: SubhutiCst): any;
  /**
   * AssignmentElisionElement CST �?AST
   */
  createAssignmentElisionElementAst(cst: SubhutiCst): any;
  /**
   * AssignmentRestElement CST �?AST
   */
  createAssignmentRestElementAst(cst: SubhutiCst): any;
  /**
   * AssignmentRestProperty CST �?AST
   */
  createAssignmentRestPropertyAst(cst: SubhutiCst): any;
  /**
   * BindingRestProperty CST �?AST
   */
  createBindingRestPropertyAst(cst: SubhutiCst): SlimeRestElement;
  createFunctionExpressionAst(cst: SubhutiCst): SlimeFunctionExpression;
  /**
   * 处理 FormalParameters CST 节点
   */
  createFormalParametersAst(cst: SubhutiCst): SlimePattern[];
  /**
   * 创建 BlockStatement AST
   * 处理两种情况�?
   * 1. 直接�?StatementList（旧的实现）
   * 2. �?BlockStatement，需要提取内部的 Block -> StatementList
   */
  createBlockStatementAst(cst: SubhutiCst): SlimeBlockStatement;
  createReturnStatementAst(cst: SubhutiCst): SlimeReturnStatement;
  createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement;
  /**
   * 创建 if 语句 AST
   * if (test) consequent [else alternate]
   * ES2025: if ( Expression ) IfStatementBody [else IfStatementBody]
   */
  createIfStatementAst(cst: SubhutiCst): any;
  /**
   * 创建 IfStatementBody AST
   * IfStatementBody: Statement | FunctionDeclaration
   */
  createIfStatementBodyAst(cst: SubhutiCst): any;
  /**
   * 创建 for 语句 AST
   * ES2025 ForStatement:
   *   for ( var VariableDeclarationList ; Expression_opt ; Expression_opt ) Statement
   *   for ( LexicalDeclaration Expression_opt ; Expression_opt ) Statement
   *   for ( Expression_opt ; Expression_opt ; Expression_opt ) Statement
   *
   * 注意：LexicalDeclaration 内部已经包含分号（SemicolonASI�?
   */
  createForStatementAst(cst: SubhutiCst): any;
  /**
   * �?VariableDeclarationList 创建 VariableDeclaration AST
   */
  createVariableDeclarationFromList(cst: SubhutiCst, kind: string): SlimeVariableDeclaration;
  /**
   * 创建 for...in / for...of 语句 AST
   */
  createForInOfStatementAst(cst: SubhutiCst): any;
  /**
   * 创建 while 语句 AST
   */
  createWhileStatementAst(cst: SubhutiCst): any;
  /**
   * 创建 do...while 语句 AST
   */
  createDoWhileStatementAst(cst: SubhutiCst): any;
  /**
   * 创建 switch 语句 AST
   * SwitchStatement: switch ( Expression ) CaseBlock
   */
  createSwitchStatementAst(cst: SubhutiCst): any;
  /**
   * BreakableStatement CST �?AST（透传�?
   * BreakableStatement -> IterationStatement | SwitchStatement
   */
  createBreakableStatementAst(cst: SubhutiCst): any;
  /**
   * IterationStatement CST �?AST（透传�?
   * IterationStatement -> DoWhileStatement | WhileStatement | ForStatement | ForInOfStatement
   */
  createIterationStatementAst(cst: SubhutiCst): any;
  /**
   * CaseBlock CST �?AST
   * CaseBlock -> { CaseClauses? DefaultClause? CaseClauses? }
   */
  createCaseBlockAst(cst: SubhutiCst): any[];
  /**
   * CaseClauses CST �?AST
   * CaseClauses -> CaseClause+
   */
  createCaseClausesAst(cst: SubhutiCst): any[];
  /**
   * CaseClause CST �?AST
   * CaseClause -> case Expression : StatementList?
   */
  createCaseClauseAst(cst: SubhutiCst): any;
  /**
   * DefaultClause CST �?AST
   * DefaultClause -> default : StatementList?
   */
  createDefaultClauseAst(cst: SubhutiCst): any;
  /**
   * LabelledItem CST �?AST（透传�?
   * LabelledItem -> Statement | FunctionDeclaration
   */
  createLabelledItemAst(cst: SubhutiCst): any;
  /**
   * Catch CST �?CatchClause AST
   * Catch -> catch ( CatchParameter ) Block | catch Block
   */
  createCatchAst(cst: SubhutiCst): any;
  /**
   * SemicolonASI CST �?AST
   * 处理自动分号插入
   */
  createSemicolonASIAst(cst: SubhutiCst): any;
  /**
   * ForDeclaration CST �?AST
   * ForDeclaration -> LetOrConst ForBinding
   */
  createForDeclarationAst(cst: SubhutiCst): any;
  /**
   * ForBinding CST �?AST
   * ForBinding -> BindingIdentifier | BindingPattern
   */
  createForBindingAst(cst: SubhutiCst): any;
  /**
   * LetOrConst CST �?AST
   * LetOrConst -> let | const
   */
  createLetOrConstAst(cst: SubhutiCst): string;
  /**
   * �?CaseBlock 提取所�?case/default 子句
   * CaseBlock: { CaseClauses? DefaultClause? CaseClauses? }
   */
  private extractCasesFromCaseBlock;
  /**
   * [AST 类型映射] CaseClause/DefaultClause CST �?SwitchCase AST
   *
   * 存在必要性：CST �?case �?default 是分开的规则（CaseClause/DefaultClause），
   * �?ESTree AST 统一使用 SwitchCase 类型，通过 test 是否�?null 区分�?
   *
   * CaseClause: case Expression : StatementList?
   * DefaultClause: default : StatementList?
   * @internal
   */
  private createSwitchCaseAst;
  /**
   * 创建 try 语句 AST
   */
  createTryStatementAst(cst: SubhutiCst): any;
  /**
   * 从Block CST创建BlockStatement AST
   * Block: LBrace StatementList? RBrace
   */
  createBlockAst(cst: SubhutiCst): SlimeBlockStatement;
  /**
   * 创建 CatchParameter AST
   */
  createCatchParameterAst(cst: SubhutiCst): any;
  /**
   * 创建 Finally 子句 AST
   */
  createFinallyAst(cst: SubhutiCst): any;
  /**
   * 创建 throw 语句 AST
   */
  createThrowStatementAst(cst: SubhutiCst): any;
  /**
   * 创建 break 语句 AST
   */
  createBreakStatementAst(cst: SubhutiCst): any;
  /**
   * 创建 continue 语句 AST
   */
  createContinueStatementAst(cst: SubhutiCst): any;
  /**
   * 创建标签语句 AST
   * ES2025: LabelledStatement -> LabelIdentifier : LabelledItem
   * LabelledItem -> Statement | FunctionDeclaration
   */
  createLabelledStatementAst(cst: SubhutiCst): any;
  /**
   * 创建 with 语句 AST
   * WithStatement: with ( Expression ) Statement
   */
  createWithStatementAst(cst: SubhutiCst): any;
  /**
   * 创建 debugger 语句 AST
   */
  createDebuggerStatementAst(cst: SubhutiCst): any;
  /**
   * 创建空语�?AST
   */
  createEmptyStatementAst(cst: SubhutiCst): any;
  /**
   * 创建函数声明 AST
   * ES2025 FunctionDeclaration structure:
   * - function BindingIdentifier ( FormalParameters ) { FunctionBody }
   * Children: [FunctionTok, BindingIdentifier, LParen, FormalParameters, RParen, LBrace, FunctionBody, RBrace]
   */
  createFunctionDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration;
  /**
   * Create FormalParameters AST
   * ES2025 FormalParameters:
   *   [empty]
   *   FunctionRestParameter
   *   FormalParameterList
   *   FormalParameterList ,
   *   FormalParameterList , FunctionRestParameter
   */
  createFormalParametersAstWrapped(cst: SubhutiCst): SlimeFunctionParam[];
  /**
   * �?ES2025 FormalParameterList 创建参数 AST（包装类型）
   * FormalParameterList: FormalParameter (, FormalParameter)*
   */
  createFormalParameterListFromEs2025Wrapped(cst: SubhutiCst): SlimeFunctionParam[];
  createFunctionRestParameterAstAlt(cst: SubhutiCst): SlimeRestElement;
  createCallExpressionAst(cst: SubhutiCst): SlimeExpression;
  createSuperCallAst(cst: SubhutiCst): SlimeExpression;
  /**
   * 创建 ImportCall AST
   * ImportCall: import ( AssignmentExpression ,_opt )
   *           | import ( AssignmentExpression , AssignmentExpression ,_opt )
   */
  createImportCallAst(cst: SubhutiCst): SlimeExpression;
  createSuperPropertyAst(cst: SubhutiCst): SlimeExpression;
  createMetaPropertyAst(cst: SubhutiCst): SlimeExpression;
  createArgumentsAst(cst: SubhutiCst): Array<SlimeCallArgument>;
  createArgumentListAst(cst: SubhutiCst): Array<SlimeCallArgument>;
  createMemberExpressionFirstOr(cst: SubhutiCst): SlimeExpression | SlimeSuper;
  createNewExpressionAst(cst: SubhutiCst): any;
  createMemberExpressionAst(cst: SubhutiCst): SlimeExpression;
  createVariableDeclaratorAst(cst: SubhutiCst): SlimeVariableDeclarator;
  /**
   * CoverParenthesizedExpressionAndArrowParameterList CST �?AST
   * 这是一�?cover grammar，根据上下文可能是括号表达式或箭头函数参�?
   */
  createCoverParenthesizedExpressionAndArrowParameterListAst(cst: SubhutiCst): SlimeExpression;
  /**
   * ParenthesizedExpression CST �?AST
   * ParenthesizedExpression -> ( Expression )
   */
  createParenthesizedExpressionAst(cst: SubhutiCst): SlimeExpression;
  /**
   * ComputedPropertyName CST �?AST
   * ComputedPropertyName -> [ AssignmentExpression ]
   */
  createComputedPropertyNameAst(cst: SubhutiCst): SlimeExpression;
  /**
   * CoverInitializedName CST �?AST
   * CoverInitializedName -> IdentifierReference Initializer
   */
  createCoverInitializedNameAst(cst: SubhutiCst): any;
  /**
   * CoverCallExpressionAndAsyncArrowHead CST �?AST
   * 这是一�?cover grammar，通常作为 CallExpression 处理
   */
  createCoverCallExpressionAndAsyncArrowHeadAst(cst: SubhutiCst): SlimeExpression;
  /**
   * CallMemberExpression CST �?AST
   * CallMemberExpression -> MemberExpression Arguments
   */
  createCallMemberExpressionAst(cst: SubhutiCst): SlimeExpression;
  /**
   * ShortCircuitExpression CST �?AST（透传�?
   * ShortCircuitExpression -> LogicalORExpression | CoalesceExpression
   */
  createShortCircuitExpressionAst(cst: SubhutiCst): SlimeExpression;
  /**
   * CoalesceExpressionHead CST 转 AST
   * CoalesceExpressionHead -> CoalesceExpression | BitwiseORExpression
   */
  createCoalesceExpressionHeadAst(cst: SubhutiCst): SlimeExpression;
  /**
   * MultiplicativeOperator CST �?AST
   * MultiplicativeOperator -> * | / | %
   */
  createMultiplicativeOperatorAst(cst: SubhutiCst): string;
  /**
   * AssignmentOperator CST �?AST
   * AssignmentOperator -> *= | /= | %= | += | -= | <<= | >>= | >>>= | &= | ^= | |= | **= | &&= | ||= | ??=
   */
  createAssignmentOperatorAst(cst: SubhutiCst): string;
  /**
   * ExpressionBody CST �?AST
   * ExpressionBody -> AssignmentExpression
   */
  createExpressionBodyAst(cst: SubhutiCst): SlimeExpression;
  createExpressionAst(cst: SubhutiCst): SlimeExpression;
  private createExpressionAstUncached;
  /**
   * 创建 OptionalExpression AST（ES2020�?
   * 处理可选链语法 ?.
   *
   * OptionalExpression:
   *   MemberExpression OptionalChain
   *   CallExpression OptionalChain
   *   OptionalExpression OptionalChain
   */
  createOptionalExpressionAst(cst: SubhutiCst): SlimeExpression;
  /**
   * 创建 OptionalChain AST
   * 处理 ?. 后的各种访问形式
   *
   * 注意：只有紧跟在 ?. 后面的操作是 optional: true
   * 链式的后续操作（�?foo?.().bar() 中的 .bar()）是 optional: false
   */
  createOptionalChainAst(object: SlimeExpression, chainCst: SubhutiCst): SlimeExpression;
  /**
   * 创建 CoalesceExpression AST（ES2020�?
   * 处理 ?? 空值合并运算符
   */
  createCoalesceExpressionAst(cst: SubhutiCst): SlimeExpression;
  /**
   * 创建 ExponentiationExpression AST（ES2016�?
   * 处理 ** 幂运算符
   */
  createExponentiationExpressionAst(cst: SubhutiCst): SlimeExpression;
  createLogicalORExpressionAst(cst: SubhutiCst): SlimeExpression;
  createLogicalANDExpressionAst(cst: SubhutiCst): SlimeExpression;
  createBitwiseORExpressionAst(cst: SubhutiCst): SlimeExpression;
  createBitwiseXORExpressionAst(cst: SubhutiCst): SlimeExpression;
  createBitwiseANDExpressionAst(cst: SubhutiCst): SlimeExpression;
  createEqualityExpressionAst(cst: SubhutiCst): SlimeExpression;
  createRelationalExpressionAst(cst: SubhutiCst): SlimeExpression;
  createShiftExpressionAst(cst: SubhutiCst): SlimeExpression;
  createAdditiveExpressionAst(cst: SubhutiCst): SlimeExpression;
  createMultiplicativeExpressionAst(cst: SubhutiCst): SlimeExpression;
  createUnaryExpressionAst(cst: SubhutiCst): SlimeExpression;
  createUpdateExpressionAst(cst: SubhutiCst): SlimeExpression;
  createLeftHandSideExpressionAst(cst: SubhutiCst): SlimeExpression;
  createPrimaryExpressionAst(cst: SubhutiCst): SlimeExpression;
  createGeneratorExpressionAst(cst: SubhutiCst): SlimeFunctionExpression;
  createAsyncFunctionExpressionAst(cst: SubhutiCst): SlimeFunctionExpression;
  createAsyncGeneratorExpressionAst(cst: SubhutiCst): SlimeFunctionExpression;
  createTemplateLiteralAst(cst: SubhutiCst): SlimeExpression;
  processTemplateSpans(cst: SubhutiCst, quasis: any[], expressions: SlimeExpression[]): void;
  processTemplateMiddleList(cst: SubhutiCst, quasis: any[], expressions: SlimeExpression[]): void;
  createClassExpressionAst(cst: SubhutiCst): SlimeClassExpression;
  createPropertyDefinitionAst(cst: SubhutiCst): SlimeProperty;
  createPropertyNameAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral | SlimeExpression;
  createLiteralPropertyNameAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral;
  /**
   * [AST 类型映射] NumericLiteral 终端�?�?Literal AST
   *
   * 存在必要性：NumericLiteral �?CST 中是终端符，�?ESTree AST 中是 Literal 类型�?
   */
  createNumericLiteralAst(cst: SubhutiCst): SlimeNumericLiteral;
  /**
   * [AST 类型映射] StringLiteral 终端�?�?Literal AST
   *
   * 存在必要性：StringLiteral �?CST 中是终端符，�?ESTree AST 中是 Literal 类型�?
   */
  createStringLiteralAst(cst: SubhutiCst): SlimeStringLiteral;
  /**
   * [AST 类型映射] RegularExpressionLiteral 终端�?�?Literal AST
   *
   * 存在必要性：RegularExpressionLiteral �?CST 中是终端符，
   * �?ESTree AST 中是 Literal 类型，需要解析正则表达式�?pattern �?flags�?
   *
   * RegularExpressionLiteral: /pattern/flags
   */
  createRegExpLiteralAst(cst: SubhutiCst): any;
  createLiteralFromToken(token: any): SlimeExpression;
  createElementListAst(cst: SubhutiCst): Array<SlimeArrayElement>;
  createSpreadElementAst(cst: SubhutiCst): SlimeSpreadElement;
  /**
   * 布尔字面�?CST �?AST
   * BooleanLiteral -> true | false
   */
  createBooleanLiteralAst(cst: SubhutiCst): SlimeLiteral;
  /**
   * ArrayLiteral CST �?ArrayExpression AST
   * ArrayLiteral -> [ Elision? ] | [ ElementList ] | [ ElementList , Elision? ]
   */
  createArrayLiteralAst(cst: SubhutiCst): SlimeArrayExpression;
  /**
   * 对象字面�?CST �?AST（透传�?ObjectExpression�?
   * ObjectLiteral -> { } | { PropertyDefinitionList } | { PropertyDefinitionList , }
   */
  createObjectLiteralAst(cst: SubhutiCst): SlimeObjectExpression;
  /**
   * Elision（逗号空位）CST �?AST
   * Elision -> , | Elision ,
   * 返回 null 元素的数�?
   */
  createElisionAst(cst: SubhutiCst): number;
  createLiteralAst(cst: SubhutiCst): SlimeLiteral;
  createAssignmentExpressionAst(cst: SubhutiCst): SlimeExpression;
  /**
   * 创建箭头函数 AST
   */
  createArrowFunctionAst(cst: SubhutiCst): SlimeArrowFunctionExpression;
  /**
   * 创建 Async 箭头函数 AST
   * AsyncArrowFunction: async AsyncArrowBindingIdentifier => AsyncConciseBody
   *                   | CoverCallExpressionAndAsyncArrowHead => AsyncConciseBody
   */
  createAsyncArrowFunctionAst(cst: SubhutiCst): SlimeArrowFunctionExpression;
  /**
   * �?CoverCallExpressionAndAsyncArrowHead 提取 async 箭头函数参数
   */
  createAsyncArrowParamsFromCover(cst: SubhutiCst): SlimePattern[];
  /**
   * 将表达式 CST 转换�?Pattern（用�?cover grammar�?
   * 这用于处�?async (expr) => body 中的 expr �?pattern 的转�?
   */
  /**
   * �?CST 表达式转换为 Pattern（用�?cover grammar�?
   * 这用于处�?async (expr) => body 中的 expr �?pattern 的转�?
   * 注意：这个方法处�?CST 节点，convertExpressionToPattern 处理 AST 节点
   */
  convertCstToPattern(cst: SubhutiCst): SlimePattern | null;
  /**
   * Cover 语法下，将单个参数相关的 CST 节点转换�?Pattern
   * 仅在“参数位置”调用，用于 Arrow / AsyncArrow 等场�?
   */
  convertCoverParameterCstToPattern(cst: SubhutiCst, hasEllipsis: boolean): SlimePattern | null;
  /**
   * �?ObjectLiteral CST 转换�?ObjectPattern
   */
  convertObjectLiteralToPattern(cst: SubhutiCst): SlimeObjectPattern;
  /**
   * �?PropertyDefinition CST 转换�?Pattern 属�?
   */
  convertPropertyDefinitionToPatternProperty(cst: SubhutiCst): SlimeAssignmentProperty | null;
  /**
   * �?ObjectExpression AST 转换�?ObjectPattern
   */
  convertObjectExpressionToPattern(expr: any): SlimeObjectPattern;
  /**
   * �?ArrayExpression AST 转换�?ArrayPattern
   */
  convertArrayExpressionToPattern(expr: any): SlimeArrayPattern;
  /**
   * �?AssignmentExpression AST 转换�?AssignmentPattern
   */
  convertAssignmentExpressionToPattern(expr: any): any;
  /**
   * 将表达式 AST 转换�?Pattern
   */
  convertExpressionToPatternFromAST(expr: any): SlimePattern | null;
  /**
   * �?ArrayLiteral CST 转换�?ArrayPattern
   */
  convertArrayLiteralToPattern(cst: SubhutiCst): SlimeArrayPattern;
  /**
   * �?ArrowFormalParameters 提取参数
   */
  createArrowFormalParametersAst(cst: SubhutiCst): SlimePattern[];
  /**
   * �?ArrowFormalParameters 提取参数 (包装类型版本)
   */
  createArrowFormalParametersAstWrapped(cst: SubhutiCst): SlimeFunctionParam[];
  /**
   * 从CoverParenthesizedExpressionAndArrowParameterList提取箭头函数参数
   */
  createArrowParametersFromCoverGrammar(cst: SubhutiCst): SlimePattern[];
  /**
   * 从Expression中提取箭头函数参�?
   * 处理逗号表达�?(a, b) 或单个参�?(x)
   */
  extractParametersFromExpression(expressionCst: SubhutiCst): SlimePattern[];
  /**
   * 在Expression中查找第一个Identifier（辅助方法）
   */
  findFirstIdentifierInExpression(cst: SubhutiCst): SubhutiCst | null;
  /**
   * 将表达式转换为模式（用于箭头函数参数解构�?
   * ObjectExpression -> ObjectPattern
   * ArrayExpression -> ArrayPattern
   * Identifier -> Identifier
   * SpreadElement -> RestElement
   */
  convertExpressionToPattern(expr: any): SlimePattern;
  /**
   * 创建箭头函数参数 AST
   */
  createArrowParametersAst(cst: SubhutiCst): SlimePattern[];
  /**
   * 创建箭头函数�?AST
   */
  createConciseBodyAst(cst: SubhutiCst): SlimeBlockStatement | SlimeExpression;
  createConditionalExpressionAst(cst: SubhutiCst): SlimeExpression;
  createYieldExpressionAst(cst: SubhutiCst): any;
  createAwaitExpressionAst(cst: SubhutiCst): any;
  /**
   * 处理 ShortCircuitExpressionTail (|| �??? 运算符的尾部)
   * CST 结构：ShortCircuitExpressionTail -> LogicalORExpressionTail | CoalesceExpressionTail
   * LogicalORExpressionTail -> LogicalOr LogicalANDExpression LogicalORExpressionTail?
   */
  createShortCircuitExpressionTailAst(left: SlimeExpression, tailCst: SubhutiCst): SlimeExpression;
}
//#endregion
//#region src/language/es2025/SlimeParser.d.ts
/**
 * ES2025 保留字集合
 * 来源：ECMAScript® 2025 规范 12.7.2 Keywords and Reserved Words
 *
 * 分类说明：
 * 1. 硬关键字（永久保留，在此集合中）：
 *    break, case, catch, class, const, continue, debugger, default,
 *    delete, do, else, enum, export, extends, false, finally, for, function,
 *    if, import, in, instanceof, new, null, return, super, switch, this,
 *    throw, true, try, typeof, var, void, while, with, await, yield
 *    实现方式：createKeywordToken + 独立 Token
 *
 * 2. 软关键字（不在此集合中，可作标识符）：
 *    async, let, static, as, get, set, of, from, target, meta
 *    - async: 可作变量名，如 `let async = 1`
 *    - let, static: 非严格模式下可作标识符
 *    - 其他: 仅在特定语法位置是关键字
 *    实现方式：识别为 IdentifierName + consumeIdentifierValue()
 *
 * 用途：在 Parser 中验证标识符是否为保留字
 * 实现：自动从所有 isKeyword=true 的 token 中提取（仅包含硬关键字）
 */
declare const ReservedWords: Set<string>;
interface ExpressionParams {
  In?: boolean;
  Yield?: boolean;
  Await?: boolean;
}
interface StatementParams {
  Yield?: boolean;
  Await?: boolean;
  Return?: boolean;
}
interface DeclarationParams {
  Yield?: boolean;
  Await?: boolean;
  Default?: boolean;
}
//#endregion
//#region src/language/es2025/SlimeTokens.d.ts
declare const SlimeTokensObj: {
  HashbangComment: SubhutiCreateToken;
  MultiLineComment: SubhutiCreateToken;
  SingleLineComment: SubhutiCreateToken;
  SingleLineHTMLOpenComment: SubhutiCreateToken;
  SingleLineHTMLCloseComment: SubhutiCreateToken;
  WhiteSpace: SubhutiCreateToken;
  LineTerminatorCRLF: SubhutiCreateToken;
  LineTerminator: SubhutiCreateToken;
  AwaitTok: SubhutiCreateToken;
  BreakTok: SubhutiCreateToken;
  CaseTok: SubhutiCreateToken;
  CatchTok: SubhutiCreateToken;
  ClassTok: SubhutiCreateToken;
  ConstTok: SubhutiCreateToken;
  ContinueTok: SubhutiCreateToken;
  DebuggerTok: SubhutiCreateToken;
  DefaultTok: SubhutiCreateToken;
  DeleteTok: SubhutiCreateToken;
  DoTok: SubhutiCreateToken;
  ElseTok: SubhutiCreateToken;
  EnumTok: SubhutiCreateToken;
  ExportTok: SubhutiCreateToken;
  ExtendsTok: SubhutiCreateToken;
  FalseTok: SubhutiCreateToken;
  FinallyTok: SubhutiCreateToken;
  ForTok: SubhutiCreateToken;
  FunctionTok: SubhutiCreateToken;
  IfTok: SubhutiCreateToken;
  ImportTok: SubhutiCreateToken;
  InTok: SubhutiCreateToken;
  InstanceofTok: SubhutiCreateToken;
  NewTok: SubhutiCreateToken;
  NullTok: SubhutiCreateToken;
  ReturnTok: SubhutiCreateToken;
  SuperTok: SubhutiCreateToken;
  SwitchTok: SubhutiCreateToken;
  ThisTok: SubhutiCreateToken;
  ThrowTok: SubhutiCreateToken;
  TrueTok: SubhutiCreateToken;
  TryTok: SubhutiCreateToken;
  TypeofTok: SubhutiCreateToken;
  VarTok: SubhutiCreateToken;
  VoidTok: SubhutiCreateToken;
  WhileTok: SubhutiCreateToken;
  WithTok: SubhutiCreateToken;
  YieldTok: SubhutiCreateToken;
  NumericLiteralBigIntHex: SubhutiCreateToken;
  NumericLiteralBigIntBinary: SubhutiCreateToken;
  NumericLiteralBigIntOctal: SubhutiCreateToken;
  NumericLiteralBigIntDecimal: SubhutiCreateToken;
  NumericLiteralHex: SubhutiCreateToken;
  NumericLiteralBinary: SubhutiCreateToken;
  NumericLiteralOctal: SubhutiCreateToken;
  NumericLiteralDecimal: SubhutiCreateToken;
  /**
   * StringLiteral :
   *     " DoubleStringCharacters_opt "
   *     ' SingleStringCharacters_opt '
   *
   * 注意：Lexer 会将双引号和单引号字符串都输出为 StringLiteral token
   */
  DoubleStringCharacters: SubhutiCreateToken;
  SingleStringCharacters: SubhutiCreateToken;
  TemplateHead: SubhutiCreateToken;
  TemplateMiddle: SubhutiCreateToken;
  TemplateTail: SubhutiCreateToken;
  NoSubstitutionTemplate: SubhutiCreateToken;
  UnsignedRightShiftAssign: SubhutiCreateToken;
  Ellipsis: SubhutiCreateToken;
  UnsignedRightShift: SubhutiCreateToken;
  StrictEqual: SubhutiCreateToken;
  StrictNotEqual: SubhutiCreateToken;
  LeftShiftAssign: SubhutiCreateToken;
  RightShiftAssign: SubhutiCreateToken;
  ExponentiationAssign: SubhutiCreateToken;
  LogicalAndAssign: SubhutiCreateToken;
  LogicalOrAssign: SubhutiCreateToken;
  NullishCoalescingAssign: SubhutiCreateToken;
  Arrow: SubhutiCreateToken;
  PlusAssign: SubhutiCreateToken;
  MinusAssign: SubhutiCreateToken;
  MultiplyAssign: SubhutiCreateToken;
  DivideAssign: SubhutiCreateToken;
  ModuloAssign: SubhutiCreateToken;
  LeftShift: SubhutiCreateToken;
  RightShift: SubhutiCreateToken;
  LessEqual: SubhutiCreateToken;
  GreaterEqual: SubhutiCreateToken;
  Equal: SubhutiCreateToken;
  NotEqual: SubhutiCreateToken;
  LogicalAnd: SubhutiCreateToken;
  LogicalOr: SubhutiCreateToken;
  NullishCoalescing: SubhutiCreateToken;
  Increment: SubhutiCreateToken;
  Decrement: SubhutiCreateToken;
  Exponentiation: SubhutiCreateToken;
  BitwiseAndAssign: SubhutiCreateToken;
  BitwiseOrAssign: SubhutiCreateToken;
  BitwiseXorAssign: SubhutiCreateToken;
  OptionalChaining: SubhutiCreateToken;
  LBrace: SubhutiCreateToken;
  RBrace: SubhutiCreateToken;
  LParen: SubhutiCreateToken;
  RParen: SubhutiCreateToken;
  LBracket: SubhutiCreateToken;
  RBracket: SubhutiCreateToken;
  Dot: SubhutiCreateToken;
  Semicolon: SubhutiCreateToken;
  Comma: SubhutiCreateToken;
  Less: SubhutiCreateToken;
  Greater: SubhutiCreateToken;
  Plus: SubhutiCreateToken;
  Minus: SubhutiCreateToken;
  Asterisk: SubhutiCreateToken;
  Slash: SubhutiCreateToken;
  Modulo: SubhutiCreateToken;
  BitwiseAnd: SubhutiCreateToken;
  BitwiseOr: SubhutiCreateToken;
  BitwiseXor: SubhutiCreateToken;
  BitwiseNot: SubhutiCreateToken;
  LogicalNot: SubhutiCreateToken;
  Question: SubhutiCreateToken;
  Colon: SubhutiCreateToken;
  Assign: SubhutiCreateToken;
  PrivateIdentifier: SubhutiCreateToken;
  IdentifierName: SubhutiCreateToken;
};
declare const slimeTokens: SubhutiCreateToken[];
//#endregion
export { DeclarationParams, ExpressionParams, ReservedWords, SlimeCstToAst, SlimeTokensObj, StatementParams, checkCstName, slimeTokens, throwNewError };