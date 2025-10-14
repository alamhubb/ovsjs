import SubhutiParser, {
  Subhuti,
  SubhutiRule,
  type SubhutiTokenConsumerConstructor
} from "subhuti/src/parser/SubhutiParser.ts";
import Es5TokenConsumer from "./Es5TokenConsume.ts";
import SubhutiMatchToken from 'subhuti/src/struct/SubhutiMatchToken.ts'
import Es6TokenConsumer from "../es2015/Es6Tokens.ts";


@Subhuti
export default class Es5Parser<T extends Es5TokenConsumer> extends SubhutiParser<T> {
  constructor(tokens?: SubhutiMatchToken[], TokenConsumerClass: SubhutiTokenConsumerConstructor<T> = Es5TokenConsumer as any) {
    super(tokens, TokenConsumerClass);
  }

  // 11.1 主表达式
  @SubhutiRule
  PrimaryExpression() {
    this.Or([
      {alt: () => this.tokenConsumer.ThisTok()},
      {alt: () => this.tokenConsumer.Identifier()},
      {alt: () => this.AbsLiteral()},
      {alt: () => this.Array()},
      {alt: () => this.Object()},
      {alt: () => this.ParenthesisExpression()},
    ]);
  }

  // 7.8 字面量
  @SubhutiRule
  AbsLiteral() {
    this.Or([
      {alt: () => this.tokenConsumer.NullLiteral()},
      {alt: () => this.tokenConsumer.BooleanLiteral()},
      {alt: () => this.tokenConsumer.NumericLiteral()},
      {alt: () => this.tokenConsumer.StringLiteral()},
      {alt: () => this.tokenConsumer.RegularExpressionLiteral()},
    ]);
  }

  // 11.1.6 括号表达式
  @SubhutiRule
  ParenthesisExpression() {
    this.tokenConsumer.LParen();
    this.Expression();
    this.tokenConsumer.RParen();
  }

  // 11.1.4 数组初始化器
  @SubhutiRule
  Array() {
    this.tokenConsumer.LBracket();
    this.Many(() => {
      this.Or([
        {alt: () => this.ElementList()},
        {alt: () => this.Elision()},
      ]);
    });
    this.tokenConsumer.RBracket();
  }

  // 11.1.4 数组初始化器 - 元素列表
  @SubhutiRule
  ElementList() {
    this.AssignmentExpression();
    this.Many(() => {
      this.Elision();
      this.AssignmentExpression();
    });
  }

  // 11.1.4 数组初始化器 - 省略元素
  @SubhutiRule
  Elision() {
    this.AT_LEAST_ONE(() => {
      this.tokenConsumer.Comma();
    });
  }

  // 11.1.5 对象初始化器
  @SubhutiRule
  Object() {
    this.tokenConsumer.LBrace();
    this.Option(() => {
      this.PropertyNameAndValueList()
    });
    this.tokenConsumer.RBrace();
  }

  @SubhutiRule
  PropertyNameAndValueList() {
    this.PropertyAssignment();
    this.Many(() => {
      this.tokenConsumer.Comma();
      this.PropertyAssignment();
    });
    this.Option(() => {
      this.tokenConsumer.Comma();
    });
  }

  // 11.1.5 属性赋值
  @SubhutiRule
  PropertyAssignment() {
    this.Or([
      {alt: () => this.RegularPropertyAssignment()},
      {alt: () => this.GetPropertyAssignment()},
      {alt: () => this.SetPropertyAssignment()},
    ]);
  }

  // 11.1.5 常规属性赋值
  @SubhutiRule
  RegularPropertyAssignment() {
    this.PropertyName();
    this.tokenConsumer.Colon();
    this.AssignmentExpression();
  }

  // 11.1.5 getter 属性赋值
  @SubhutiRule
  GetPropertyAssignment() {
    this.tokenConsumer.GetTok();
    this.PropertyName();
    this.tokenConsumer.LParen();
    this.tokenConsumer.RParen();
    this.tokenConsumer.LBrace();
    this.SourceElements();
    this.tokenConsumer.RBrace();
  }

  // 11.1.5 setter 属性赋值
  @SubhutiRule
  SetPropertyAssignment() {
    this.tokenConsumer.SetTok();
    this.PropertyName();
    this.tokenConsumer.LParen();
    this.tokenConsumer.Identifier();
    this.tokenConsumer.RParen();
    this.tokenConsumer.LBrace();
    this.SourceElements();
    this.tokenConsumer.RBrace();
  }

  // 11.1.5 属性名称
  @SubhutiRule
  PropertyName() {
    this.Or([
      {alt: () => this.tokenConsumer.Identifier()},
      {alt: () => this.tokenConsumer.StringLiteral()},
      {alt: () => this.tokenConsumer.NumericLiteral()},
    ]);
  }

  // 11.2 左值表达式
  @SubhutiRule
  MemberCallNewExpression() {
    this.Many(() => {
      this.tokenConsumer.NewTok();
    });
    this.Or([
      {alt: () => this.PrimaryExpression()},
      {alt: () => this.FunctionExpression()},
    ]);
    this.Many(() => {
      this.Or([
        {alt: () => this.BoxMemberExpression()},
        {alt: () => this.DotMemberExpression()},
        {alt: () => this.Arguments()},
      ]);
    });
  }

  // 11.2.1 属性访问表达式
  @SubhutiRule
  BoxMemberExpression() {
    this.tokenConsumer.LBracket();
    this.Expression();
    this.tokenConsumer.RBracket();
  }

  // 11.2.1 属性访问表达式
  @SubhutiRule
  DotMemberExpression() {
    this.tokenConsumer.Dot();
    this.tokenConsumer.Identifier();
  }

  // 11.2.3 函数调用
  @SubhutiRule
  Arguments() {
    this.tokenConsumer.LParen();
    this.Option(() => {
      this.AssignmentExpression();
      this.Many(() => {
        this.tokenConsumer.Comma();
        this.AssignmentExpression();
      });
    });
    this.tokenConsumer.RParen();
  }

  // 11.3 后缀表达式
  @SubhutiRule
  PostfixExpression() {
    this.MemberCallNewExpression();
    this.Option(() => {
      this.Or([
        {alt: () => this.tokenConsumer.PlusPlus()},
        {alt: () => this.tokenConsumer.MinusMinus()},
      ]);
    });
  }

  // 11.4 一元运算符
  @SubhutiRule
  UnaryExpression() {
    this.Or([
      {alt: () => this.PostfixExpression()},
      {
        alt: () => {
          this.Or([
            {alt: () => this.tokenConsumer.DeleteTok()},
            {alt: () => this.tokenConsumer.VoidTok()},
            {alt: () => this.tokenConsumer.TypeofTok()},
            {alt: () => this.tokenConsumer.PlusPlus()},
            {alt: () => this.tokenConsumer.MinusMinus()},
            {alt: () => this.tokenConsumer.Plus()},
            {alt: () => this.tokenConsumer.Minus()},
            {alt: () => this.tokenConsumer.Tilde()},
            {alt: () => this.tokenConsumer.Exclamation()},
          ]);
          this.UnaryExpression();
        },
      },
    ]);
  }

  // 11.5 乘法运算符, 11.6 加法运算符, 11.7 位移运算符, 11.8 关系运算符, 11.9 相等运算符, 11.10 二进制位运算符, 11.11 二进制逻辑运算符
  @SubhutiRule
  BinaryExpression() {
    this.UnaryExpression();
    this.Many(() => {
      this.Or([
        {alt: () => this.AbsAssignmentOperator()},
        {alt: () => this.tokenConsumer.VerticalBarVerticalBar()},
        {alt: () => this.tokenConsumer.AmpersandAmpersand()},
        {alt: () => this.tokenConsumer.VerticalBar()},
        {alt: () => this.tokenConsumer.Circumflex()},
        {alt: () => this.tokenConsumer.Ampersand()},
        {alt: () => this.AbsEqualityOperator()},
        {alt: () => this.AbsRelationalOperator()},
        {alt: () => this.tokenConsumer.InstanceOfTok()},
        {alt: () => this.tokenConsumer.InTok()},
        {alt: () => this.AbsShiftOperator()},
        {alt: () => this.AbsMultiplicativeOperator()},
        {alt: () => this.AbsAdditiveOperator()},
      ]);
      this.UnaryExpression();
    });
  }

  // 11.13 赋值运算符
  @SubhutiRule
  AbsAssignmentOperator() {
    this.Or([
      {alt: () => this.tokenConsumer.Eq()},              // =
      {alt: () => this.tokenConsumer.PlusEq()},          // +=
      {alt: () => this.tokenConsumer.MinusEq()},         // -=
      {alt: () => this.tokenConsumer.AsteriskEq()},      // *=
      {alt: () => this.tokenConsumer.SlashEq()},         // /=
      {alt: () => this.tokenConsumer.PercentEq()},       // %=
      {alt: () => this.tokenConsumer.LessLessEq()},      // <<=
      {alt: () => this.tokenConsumer.MoreMoreEq()},      // >>=
      {alt: () => this.tokenConsumer.MoreMoreMoreEq()},  // >>>=
      {alt: () => this.tokenConsumer.AmpersandEq()},     // &=
      {alt: () => this.tokenConsumer.CircumflexEq()},    // ^=
      {alt: () => this.tokenConsumer.VerticalBarEq()},   // |=
    ]);
  }

  // 11.9 相等运算符
  @SubhutiRule
  AbsEqualityOperator() {
    this.Or([
      {alt: () => this.tokenConsumer.EqEq()},
      {alt: () => this.tokenConsumer.NotEq()},
      {alt: () => this.tokenConsumer.EqEq()},
      {alt: () => this.tokenConsumer.NotEqEq()},
    ]);
  }

  // 11.8 关系运算符
  @SubhutiRule
  AbsRelationalOperator() {
    this.Or([
      {alt: () => this.tokenConsumer.Less()},
      {alt: () => this.tokenConsumer.More()},
      {alt: () => this.tokenConsumer.LessEq()},
      {alt: () => this.tokenConsumer.MoreEq()},
    ]);
  }

  // 11.7 位移运算符
  @SubhutiRule
  AbsShiftOperator() {
    this.Or([
      {alt: () => this.tokenConsumer.LessLess()},
      {alt: () => this.tokenConsumer.MoreMore()},
      {alt: () => this.tokenConsumer.MoreMoreMore()},
    ]);
  }

  // 11.5 乘法运算符
  @SubhutiRule
  AbsMultiplicativeOperator() {
    this.Or([
      {alt: () => this.tokenConsumer.Asterisk()},
      {alt: () => this.tokenConsumer.Slash()},
      {alt: () => this.tokenConsumer.Percent()},
    ]);
  }

  // 11.6 加法运算符
  @SubhutiRule
  AbsAdditiveOperator() {
    this.Or([
      {alt: () => this.tokenConsumer.Plus()},
      {alt: () => this.tokenConsumer.Minus()},
    ]);
  }

  @SubhutiRule
  BinaryExpressionNoIn() {
    this.UnaryExpression();
    this.Many(() => {
      this.Or([
        {alt: () => this.AbsAssignmentOperator()},
        {alt: () => this.tokenConsumer.VerticalBarVerticalBar()},
        {alt: () => this.tokenConsumer.AmpersandAmpersand()},
        {alt: () => this.tokenConsumer.VerticalBar()},
        {alt: () => this.tokenConsumer.Circumflex()},
        {alt: () => this.tokenConsumer.Ampersand()},
        {alt: () => this.AbsEqualityOperator()},
        {alt: () => this.AbsRelationalOperator()},
        {alt: () => this.tokenConsumer.InstanceOfTok()},
        {alt: () => this.AbsShiftOperator()},
        {alt: () => this.AbsMultiplicativeOperator()},
        {alt: () => this.AbsAdditiveOperator()},
      ]);
      this.UnaryExpression();
    });
  }

  // 11.12 条件运算符
  @SubhutiRule
  AssignmentExpression() {
    this.BinaryExpression();
    this.Option(() => {
      this.tokenConsumer.Question();
      this.AssignmentExpression();
      this.tokenConsumer.Colon();
      this.AssignmentExpression();
    });
  }

  @SubhutiRule
  AssignmentExpressionNoIn() {
    this.BinaryExpressionNoIn();
    this.Option(() => {
      this.tokenConsumer.Question();
      this.AssignmentExpression();
      this.tokenConsumer.Colon();
      this.AssignmentExpressionNoIn();
    });
  }

  // 11.14 逗号运算符
  @SubhutiRule
  Expression() {
    this.AssignmentExpression();
    this.Many(() => {
      this.tokenConsumer.Comma();
      this.AssignmentExpression();
    });
  }

  @SubhutiRule
  ExpressionNoIn() {
    this.AssignmentExpressionNoIn();
    this.Many(() => {
      this.tokenConsumer.Comma();
      this.AssignmentExpressionNoIn();
    });
  }

  // 12 语句
  @SubhutiRule
  Statement() {
    this.Or([
      {alt: () => this.Block()},
      {alt: () => this.VariableDeclaration()},
      {alt: () => this.EmptyStatement()},
      {alt: () => this.LabelledStatement()},
      {alt: () => this.ExpressionStatement()},
      {alt: () => this.IfStatement()},
      {alt: () => this.IterationStatement()},
      {alt: () => this.ContinueStatement()},
      {alt: () => this.BreakStatement()},
      {alt: () => this.ReturnStatement()},
      {alt: () => this.WithStatement()},
      {alt: () => this.SwitchStatement()},
      {alt: () => this.ThrowStatement()},
      {alt: () => this.TryStatement()},
      {alt: () => this.DebuggerStatement()},
    ]);
  }

  // 12.1 语句块
  @SubhutiRule
  Block() {
    this.tokenConsumer.LBrace();
    this.Option(() => {
      this.StatementList();
    });
    this.tokenConsumer.RBrace();
  }

  // 12.1 语句列表
  @SubhutiRule
  StatementList() {
    this.AT_LEAST_ONE(() => {
      this.Statement();
    });
  }

  // 12.2 变量语句
  @SubhutiRule
  VariableDeclaration() {
    this.tokenConsumer.VarTok();
    this.VariableDeclarationList();
    this.tokenConsumer.Semicolon();
  }

  // 12.2 变量声明列表
  @SubhutiRule
  VariableDeclarationList() {
    this.VariableDeclarator();
    this.Many(() => {
      this.tokenConsumer.Comma();
      this.VariableDeclarator();
    });
  }

  VariableDeclarationListNoIn() {
    let numOfVars = 1;
    this.VariableDeclarationNoIn();
    this.Many(() => {
      this.tokenConsumer.Comma();
      this.VariableDeclarationNoIn();
      numOfVars++;
    });
    return numOfVars;
  }

  // 12.2 变量声明
  @SubhutiRule
  VariableDeclarator() {
    this.tokenConsumer.Identifier();
    this.Option(() => {
      this.Initialiser();
    });
  }

  @SubhutiRule
  VariableDeclarationNoIn() {
    this.tokenConsumer.Identifier();
    this.Option(() => {
      this.InitialiserNoIn();
    });
  }

  // 12.2 初始化器
  @SubhutiRule
  Initialiser() {
    this.tokenConsumer.Eq();
    this.AssignmentExpression();
  }

  @SubhutiRule
  InitialiserNoIn() {
    this.tokenConsumer.Eq();
    this.AssignmentExpressionNoIn();
  }

  // 12.3 空语句
  @SubhutiRule
  EmptyStatement() {
    this.tokenConsumer.Semicolon();
  }

  // 12.4 表达式语句
  @SubhutiRule
  ExpressionStatement() {
    this.Expression();
    this.tokenConsumer.Semicolon();
  }

  // 12.5 if 语句
  @SubhutiRule
  IfStatement() {
    this.tokenConsumer.IfTok();
    this.tokenConsumer.LParen();
    this.Expression();
    this.tokenConsumer.RParen();
    this.Statement();
    this.Option(() => {
      this.tokenConsumer.ElseTok();
      this.Statement();
    });
  }

  // 12.6 迭代语句
  @SubhutiRule
  IterationStatement() {
    this.Or([
      {alt: () => this.DoIteration()},
      {alt: () => this.WhileIteration()},
      {alt: () => this.ForIteration()},
    ]);
  }

  // 12.6.1 do-while 语句
  @SubhutiRule
  DoIteration() {
    this.tokenConsumer.DoTok();
    this.Statement();
    this.tokenConsumer.WhileTok();
    this.tokenConsumer.LParen();
    this.Expression();
    this.tokenConsumer.RParen();
    this.tokenConsumer.Semicolon();
  }

  // 12.6.2 while 语句
  @SubhutiRule
  WhileIteration() {
    this.tokenConsumer.WhileTok();
    this.tokenConsumer.LParen();
    this.Expression();
    this.tokenConsumer.RParen();
    this.Statement();
  }

  // 12.6.3 for 语句
  @SubhutiRule
  ForIteration() {
    let inPossible = false;
    this.tokenConsumer.ForTok();
    this.tokenConsumer.LParen();
    this.Or([
      {
        alt: () => {
          this.tokenConsumer.VarTok();
          const numOfVars = this.VariableDeclarationListNoIn();
          inPossible = numOfVars === 1;
          this.ForHeaderParts(inPossible);
        },
      },
      {
        alt: () => {
          this.ForHeaderParts(inPossible);
        },
      },
    ]);
    this.tokenConsumer.RParen();
    this.Statement();
  }

  // 12.6.3 for 语句头部
  @SubhutiRule
  ForHeaderParts(inPossible) {
    this.Or([
      {
        alt: () => {
          this.tokenConsumer.Semicolon();
          this.Option(() => {
            this.Expression();
          });
          this.tokenConsumer.Semicolon();
          this.Option(() => {
            this.Expression();
          });
        },
      },
      {
        alt: () => {
          this.tokenConsumer.InTok();
          this.Expression();
        },
      },
    ]);
  }

  // 12.7 continue 语句
  @SubhutiRule
  ContinueStatement() {
    this.tokenConsumer.ContinueTok();
    this.Option(() => {
      this.tokenConsumer.Identifier();
    });
    this.tokenConsumer.Semicolon();
  }

  // 12.8 break 语句
  @SubhutiRule
  BreakStatement() {
    this.tokenConsumer.BreakTok();
    this.Option(() => {
      this.tokenConsumer.Identifier();
    });
    this.tokenConsumer.Semicolon();
  }

  // 12.9 return 语句
  @SubhutiRule
  ReturnStatement() {
    this.tokenConsumer.ReturnTok();
    this.Option(() => {
      this.Expression();
    });
    this.tokenConsumer.Semicolon();
  }

  // 12.10 with 语句
  @SubhutiRule
  WithStatement() {
    this.tokenConsumer.WithTok();
    this.tokenConsumer.LParen();
    this.Expression();
    this.tokenConsumer.RParen();
    this.Statement();
  }

  // 12.11 switch 语句
  @SubhutiRule
  SwitchStatement() {
    this.tokenConsumer.SwitchTok();
    this.tokenConsumer.LParen();
    this.Expression();
    this.tokenConsumer.RParen();
    this.CaseBlock();
  }

  // 12.11 case 块
  @SubhutiRule
  CaseBlock() {
    this.tokenConsumer.LBrace();
    this.Option(() => {
      this.CaseClauses();
    });
    this.Option(() => {
      this.DefaultClause();
    });
    this.Option(() => {
      this.CaseClauses();
    });
    this.tokenConsumer.RBrace();
  }

  // 12.11 case 子句列表
  @SubhutiRule
  CaseClauses() {
    this.AT_LEAST_ONE(() => {
      this.CaseClause();
    });
  }

  // 12.11 case 子句
  @SubhutiRule
  CaseClause() {
    this.tokenConsumer.CaseTok();
    this.Expression();
    this.tokenConsumer.Colon();
    this.Option(() => {
      this.StatementList();
    });
  }

  // 12.11 default 子句
  @SubhutiRule
  DefaultClause() {
    this.tokenConsumer.DefaultTok();
    this.tokenConsumer.Colon();
    this.Option(() => {
      this.StatementList();
    });
  }

  // 12.12 标记语句
  @SubhutiRule
  LabelledStatement() {
    this.tokenConsumer.Identifier();
    this.tokenConsumer.Colon();
    this.Option(() => {
      this.Statement();
    });
  }

  // 12.13 throw 语句
  @SubhutiRule
  ThrowStatement() {
    this.tokenConsumer.ThrowTok();
    this.Expression();
    this.tokenConsumer.Semicolon();
  }

  // 12.14 try 语句
  @SubhutiRule
  TryStatement() {
    this.tokenConsumer.TryTok();
    this.Block();
    this.Or([
      {
        alt: () => {
          this.Catch();
          this.Option(() => {
            this.Finally();
          });
        },
      },
      {alt: () => this.Finally()},
    ]);
  }

  // 12.14 catch 子句
  @SubhutiRule
  Catch() {
    this.tokenConsumer.CatchTok();
    this.tokenConsumer.LParen();
    this.tokenConsumer.Identifier();
    this.tokenConsumer.RParen();
    this.Block();
  }

  // 12.14 finally 子句
  @SubhutiRule
  Finally() {
    this.tokenConsumer.FinallyTok();
    this.Block();
  }

  // 12.15 debugger 语句
  @SubhutiRule
  DebuggerStatement() {
    this.tokenConsumer.DebuggerTok();
    this.tokenConsumer.Semicolon();
  }

  // 13 函数定义
  @SubhutiRule
  FunctionDeclaration() {
    this.tokenConsumer.FunctionTok();
    this.tokenConsumer.Identifier();
    this.tokenConsumer.LParen();
    this.Option(() => {
      this.FormalParameterList();
    });
    this.tokenConsumer.RParen();
    this.tokenConsumer.LBrace();
    this.SourceElements();
    this.tokenConsumer.RBrace();
  }

  // 13 函数表达式
  @SubhutiRule
  FunctionExpression() {
    this.tokenConsumer.FunctionTok();
    this.Option(() => {
      this.tokenConsumer.Identifier();
    });
    this.tokenConsumer.LParen();
    this.Option(() => {
      this.FormalParameterList();
    });
    this.tokenConsumer.RParen();
    this.tokenConsumer.LBrace();
    this.SourceElements();
    this.tokenConsumer.RBrace();
  }

  // 13 形式参数列表
  @SubhutiRule
  FormalParameterList() {
    this.tokenConsumer.Identifier();
    this.Many(() => {
      this.tokenConsumer.Comma();
      this.tokenConsumer.Identifier();
    });
  }

  // 14 程序
  @SubhutiRule
  Program() {
    this.AT_LEAST_ONE(() => {
      this.SourceElements();
    });
  }

  // 14 源元素
  @SubhutiRule
  SourceElements() {
    this.SourceElement()
  }

  @SubhutiRule
  SourceElement() {
    this.Or([
      {
        alt: () => this.FunctionDeclaration(),
      },
      {alt: () => this.Statement()},
    ]);
  }
}
