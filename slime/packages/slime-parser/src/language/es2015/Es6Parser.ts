import Es6TokenConsumer from "./Es6Tokens.ts"
import SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts"
import {Subhuti, SubhutiRule, type SubhutiTokenConsumerConstructor} from "subhuti/src/parser/SubhutiParser.ts"
import Es5TokenConsumer from "../es5/Es5TokenConsume.ts";
import Es5Parser from "../es5/Es5Parser.ts";

@Subhuti
export default class Es6Parser<T extends Es6TokenConsumer> extends Es5Parser<T> {
  constructor(tokens?: SubhutiMatchToken[], TokenConsumerClass: SubhutiTokenConsumerConstructor<T> = Es6TokenConsumer as any) {
    super(tokens, TokenConsumerClass);
  }

  @SubhutiRule
  IdentifierReference() {
    this.Or([
      {alt: () => this.tokenConsumer.Identifier()},
    ])
  }

  @SubhutiRule
  BindingIdentifier() {
    this.Or([
      {alt: () => this.tokenConsumer.Identifier()},
    ])
  }

  @SubhutiRule
  LabelIdentifier() {
    this.Or([
      {alt: () => this.tokenConsumer.Identifier()},
    ])
  }

  @SubhutiRule
  PrimaryExpression() {
    this.Or([
      {alt: () => this.tokenConsumer.ThisTok()},
      {
        alt: () => {
          this.IdentifierReference()
        }
      },
      {
        alt: () => {
          this.Literal()
        }
      },
      {
        alt: () => {
          this.ArrayLiteral()
        }
      },
      {alt: () => this.ObjectLiteral()},
      {alt: () => this.FunctionExpression()},
      {alt: () => this.ClassExpression()},
      {alt: () => this.GeneratorExpression()},
      {alt: () => this.tokenConsumer.RegularExpressionLiteral()},
      {alt: () => this.TemplateLiteral()},
      // 【重要】括号表达式支持
      // 处理：(expression) 和箭头函数参数的歧义
      {alt: () => this.CoverParenthesizedExpressionAndArrowParameterList()}
    ])
  }

  @SubhutiRule
  CoverParenthesizedExpressionAndArrowParameterList() {
    this.Or([
      {
        alt: () => {
          this.tokenConsumer.LParen()
          this.Expression()
          this.tokenConsumer.RParen()
        }
      },
      {
        alt: () => {
          this.tokenConsumer.LParen()
          this.tokenConsumer.RParen()
        }
      },
      {
        alt: () => {
          this.tokenConsumer.LParen()
          this.tokenConsumer.Ellipsis()
          this.BindingIdentifier()
          this.tokenConsumer.RParen()
        }
      },
      {
        alt: () => {
          this.tokenConsumer.LParen()
          this.Expression()
          this.tokenConsumer.Comma()
          this.tokenConsumer.Ellipsis()
          this.BindingIdentifier()
          this.tokenConsumer.RParen()
        }
      }
    ])
  }

  @SubhutiRule
  ParenthesizedExpression() {
    this.tokenConsumer.LParen()
    this.Expression()
    this.tokenConsumer.RParen()
  }

  @SubhutiRule
  Literal() {
    this.Or([
      {alt: () => this.tokenConsumer.NullLiteral()},
      {alt: () => this.tokenConsumer.BooleanLiteral()},
      {alt: () => this.tokenConsumer.NumericLiteral()},
      {alt: () => this.tokenConsumer.StringLiteral()}
    ])
  }

  @SubhutiRule
  ArrayLiteral() {
    this.tokenConsumer.LBracket()
    this.Many(() => {
      this.Or([
        {
          alt: () => {
            this.ElementList()
          }
        },
        {
          alt: () => {
            this.Elision()
          }
        }
      ])
    })
    this.tokenConsumer.RBracket()
  }

  @SubhutiRule
  ElementList() {
    this.Or([
      {
        alt: () => {
          this.Option(() => this.Elision())
          this.AssignmentExpression()
        }
      },
      {
        alt: () => {
          this.Option(() => this.Elision())
          this.SpreadElement()
        }
      }
    ])
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.Or([
        {
          alt: () => {
            this.Option(() => this.Elision())
            this.AssignmentExpression()
          }
        },
        {
          alt: () => {
            this.Option(() => this.Elision())
            this.SpreadElement()
          }
        }
      ])
    })
  }

  @SubhutiRule
  Elision() {
    this.tokenConsumer.Comma()
    this.Many(() => this.tokenConsumer.Comma())
  }

  @SubhutiRule
  SpreadElement() {
    this.tokenConsumer.Ellipsis()
    this.AssignmentExpression()
  }

  @SubhutiRule
  ObjectLiteral() {
    this.tokenConsumer.LBrace()
    this.Option(() => this.PropertyDefinitionList())
    this.Option(() => this.tokenConsumer.Comma())
    this.tokenConsumer.RBrace()
  }

  @SubhutiRule
  PropertyDefinitionList() {
    this.PropertyDefinition()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.PropertyDefinition()
    })
  }

  @SubhutiRule
  PropertyDefinition() {
    this.Or([
      //顺序前置，优先匹配
      {
        alt: () => {
          this.PropertyName()
          this.tokenConsumer.Colon()
          this.AssignmentExpression()
        }
      },
      //顺序问题MethodDefinition 需要在 IdentifierReference 之上，否则会触发IdentifierReference ，而 不执行MethodDefinition，应该执行最长匹配
      {alt: () => this.MethodDefinition()},
      {
        alt: () => {
          this.IdentifierReference()
        }
      },
      {
        alt: () => {
          this.CoverInitializedName()
        }
      }
    ])
  }

  @SubhutiRule
  PropertyName() {
    this.Or([
      {alt: () => this.LiteralPropertyName()},
      {alt: () => this.ComputedPropertyName()}
    ])
  }

  @SubhutiRule
  LiteralPropertyName() {
    this.Or([
      {alt: () => this.tokenConsumer.Identifier()},
      {alt: () => this.tokenConsumer.StringLiteral()},
      {alt: () => this.tokenConsumer.NumericLiteral()},
      // ES6 允许保留字作为对象属性名
      // 最常用的保留字（按使用频率排序）
      {alt: () => this.tokenConsumer.ClassTok()},
      {alt: () => this.tokenConsumer.FunctionTok()},
      {alt: () => this.tokenConsumer.ReturnTok()},
      {alt: () => this.tokenConsumer.ConstTok()},
      {alt: () => this.tokenConsumer.LetTok()},
      {alt: () => this.tokenConsumer.VarTok()},
      {alt: () => this.tokenConsumer.IfTok()},
      {alt: () => this.tokenConsumer.ElseTok()},
      {alt: () => this.tokenConsumer.ForTok()},
      {alt: () => this.tokenConsumer.WhileTok()},
      {alt: () => this.tokenConsumer.DoTok()},
      {alt: () => this.tokenConsumer.SwitchTok()},
      {alt: () => this.tokenConsumer.CaseTok()},
      {alt: () => this.tokenConsumer.DefaultTok()},
      {alt: () => this.tokenConsumer.BreakTok()},
      {alt: () => this.tokenConsumer.ContinueTok()},
      {alt: () => this.tokenConsumer.TryTok()},
      {alt: () => this.tokenConsumer.CatchTok()},
      {alt: () => this.tokenConsumer.FinallyTok()},
      {alt: () => this.tokenConsumer.ThrowTok()},
      {alt: () => this.tokenConsumer.NewTok()},
      {alt: () => this.tokenConsumer.ThisTok()},
      {alt: () => this.tokenConsumer.ImportTok()},
      {alt: () => this.tokenConsumer.ExportTok()},
      {alt: () => this.tokenConsumer.FromTok()},
      {alt: () => this.tokenConsumer.AsTok()},
      {alt: () => this.tokenConsumer.OfTok()},
      {alt: () => this.tokenConsumer.InTok()},
      {alt: () => this.tokenConsumer.ExtendsTok()},
      {alt: () => this.tokenConsumer.StaticTok()},
      {alt: () => this.tokenConsumer.YieldTok()},
      {alt: () => this.tokenConsumer.SuperTok()},
      {alt: () => this.tokenConsumer.GetTok()},
      {alt: () => this.tokenConsumer.SetTok()},
      {alt: () => this.tokenConsumer.TypeofTok()},
      {alt: () => this.tokenConsumer.VoidTok()},
      {alt: () => this.tokenConsumer.DeleteTok()},
      {alt: () => this.tokenConsumer.WithTok()},
      {alt: () => this.tokenConsumer.InstanceOfTok()},
      {alt: () => this.tokenConsumer.DebuggerTok()},
      {alt: () => this.tokenConsumer.TrueTok()},
      {alt: () => this.tokenConsumer.FalseTok()},
    ])
  }

  @SubhutiRule
  ComputedPropertyName() {
    this.tokenConsumer.LBracket()
    this.AssignmentExpression()
    this.tokenConsumer.RBracket()
  }

  @SubhutiRule
  CoverInitializedName() {
    this.IdentifierReference()
    this.Initializer()
  }

  @SubhutiRule
  TemplateLiteral() {
    this.Or([
      {alt: () => this.tokenConsumer.NoSubstitutionTemplate()},
      {
        alt: () => {
          this.tokenConsumer.TemplateHead()
          this.Expression()
          this.TemplateSpans()
        }
      }
    ])
  }

  @SubhutiRule
  TemplateSpans() {
    this.Or([
      {alt: () => this.tokenConsumer.TemplateTail()},
      {
        alt: () => {
          this.TemplateMiddleList()
          this.tokenConsumer.TemplateTail()
        }
      }
    ])
  }

  @SubhutiRule
  TemplateMiddleList() {
    this.tokenConsumer.TemplateMiddle()
    this.Expression()
    this.Many(() => {
      this.tokenConsumer.TemplateMiddle()
      this.Expression()
    })
  }


  @SubhutiRule
  NewMemberExpressionArguments() {
    this.tokenConsumer.NewTok()
    this.MemberExpression()
    this.Arguments()
  }

  @SubhutiRule
  MemberExpression() {
    this.Or([
      {alt: () => this.PrimaryExpression()},
      {alt: () => this.SuperProperty()},
      {alt: () => this.MetaProperty()},
      {
        alt: () => {
          this.NewMemberExpressionArguments()
        }
      }
    ])
    // 使用 Many 处理多个后缀操作（. IdentifierName, [ Expression ], TemplateLiteral）
    this.Many(() => {
      this.Or([
        {
          alt: () => {
            this.DotIdentifier()
          }
        },
        {
          alt: () => {
            this.BracketExpression()
          }
        },
        {
          alt: () => {
            this.TemplateLiteral()
          }
        }
      ])
    })
  }

  @SubhutiRule
  DotIdentifier() {
    this.tokenConsumer.Dot()
    this.tokenConsumer.Identifier()
  }

  @SubhutiRule
  BracketExpression() {
    this.tokenConsumer.LBracket()
    this.Expression()
    this.tokenConsumer.RBracket()
  }


  @SubhutiRule
  SuperProperty() {
    this.Or([
      {
        alt: () => {
          this.tokenConsumer.SuperTok()
          this.BracketExpression()
        }
      },
      {
        alt: () => {
          this.tokenConsumer.SuperTok()
          this.tokenConsumer.Dot()
          this.tokenConsumer.Identifier()
        }
      }
    ])
  }

  @SubhutiRule
  MetaProperty() {
    this.NewTarget()
  }

  @SubhutiRule
  NewTarget() {
    this.tokenConsumer.NewTok()
    this.tokenConsumer.Dot()
    this.tokenConsumer.TargetTok()
  }

  @SubhutiRule
  NewExpression() {
    this.Or([
      {
        alt: () => {
          this.MemberExpression()
        }
      },
      {
        alt: () => {
          this.tokenConsumer.NewTok()
          this.NewExpression()
        }
      }
    ])
  }

  @SubhutiRule
  CallExpression() {
    this.Or([
      {
        alt: () => {
          this.MemberExpression()
          this.Arguments()
        }
      },
      {
        alt: () => {
          this.SuperCall()
        }
      }
    ])
    this.Many(() => {
      this.Or([
        {alt: () => this.Arguments()},
        {
          alt: () => {
            this.BracketExpression()
          }
        },
        {
          alt: () => {
            this.tokenConsumer.Dot()
            this.tokenConsumer.Identifier()
          }
        },
        {alt: () => this.TemplateLiteral()}
      ])
    })
  }


  @SubhutiRule
  SuperCall() {
    this.tokenConsumer.SuperTok()
    this.Arguments()
  }

  @SubhutiRule
  Arguments() {
    this.tokenConsumer.LParen()
    this.Option(() => this.ArgumentList())
    this.tokenConsumer.RParen()
  }

  @SubhutiRule
  EllipsisAssignmentExpression() {
    this.tokenConsumer.Ellipsis()
    this.AssignmentExpression()
  }

  @SubhutiRule
  ArgumentList() {
    this.Or([
      {alt: () => this.AssignmentExpression()},
      {alt: () => this.EllipsisAssignmentExpression()}
    ])
    // throw new Error('cjvla')
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.Or([
        {alt: () => this.AssignmentExpression()},
        {alt: () => this.EllipsisAssignmentExpression()}
      ])
    })
  }

  /*

  @SubhutiRule
  ArgumentList() {
      this.Or([
          {
              alt: () => {
                  this.AssignmentExpression()
              }
          },
          {
              alt: () => {
                  this.EllipsisAssignmentExpression()
              }
          }
      ]);
      this.Many(() => {
          this.tokenConsumer.Comma();
          this.Or([
              {alt: () => this.AssignmentExpression()},
              {alt: () => this.EllipsisAssignmentExpression()}
          ]);
      });
  }*/

  @SubhutiRule
  LeftHandSideExpression() {
    //需要保证 CallExpression 在前面执行
    this.Or([
      {
        alt: () => {
          this.CallExpression()
        }
      },
      {
        alt: () => {
          this.NewExpression()
        }
      }
    ])
  }

  @SubhutiRule
  PostfixExpression() {
    this.LeftHandSideExpression()
    this.Option(() => {
      this.Or([
        {alt: () => this.tokenConsumer.PlusPlus()},
        {alt: () => this.tokenConsumer.MinusMinus()}
      ])
    })
  }

  @SubhutiRule
  UnaryExpression() {
    this.Or([
      {
        alt: () => {
          this.PostfixExpression()
        }
      },
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
            {alt: () => this.tokenConsumer.Exclamation()}
          ])
          this.UnaryExpression()
        }
      }
    ])
  }

  @SubhutiRule
  MultiplicativeExpression() {
    this.UnaryExpression()
    this.Many(() => {
      this.MultiplicativeOperator()
      this.UnaryExpression()
    })
  }

  @SubhutiRule
  MultiplicativeOperator() {
    this.Or([
      {alt: () => this.tokenConsumer.Asterisk()},
      {alt: () => this.tokenConsumer.Slash()},
      {alt: () => this.tokenConsumer.Percent()}
    ])
  }

  @SubhutiRule
  AdditiveExpression() {
    this.MultiplicativeExpression()
    this.Many(() => {
      this.Or([
        {alt: () => this.tokenConsumer.Plus()},
        {alt: () => this.tokenConsumer.Minus()}
      ])
      this.MultiplicativeExpression()
    })
  }

  @SubhutiRule
  ShiftExpression() {
    this.AdditiveExpression()
    this.Many(() => {
      this.Or([
        {alt: () => this.tokenConsumer.LessLess()},
        {alt: () => this.tokenConsumer.MoreMore()},
        {alt: () => this.tokenConsumer.MoreMoreMore()}
      ])
      this.AdditiveExpression()
    })
  }

  @SubhutiRule
  RelationalExpression() {
    this.ShiftExpression()
    this.Many(() => {
      this.Or([
        {alt: () => this.tokenConsumer.Less()},
        {alt: () => this.tokenConsumer.More()},
        {alt: () => this.tokenConsumer.LessEq()},
        {alt: () => this.tokenConsumer.MoreEq()},
        {alt: () => this.tokenConsumer.InstanceOfTok()},
        {
          alt: () => {
            this.tokenConsumer.InTok()
          }
        }
      ])
      this.ShiftExpression()
    })
  }

  @SubhutiRule
  EqualityExpression() {
    this.RelationalExpression()
    this.Many(() => {
      this.Or([
        {alt: () => this.tokenConsumer.EqEq()},
        {alt: () => this.tokenConsumer.NotEq()},
        {alt: () => this.tokenConsumer.EqEqEq()},
        {alt: () => this.tokenConsumer.NotEqEq()}
      ])
      this.RelationalExpression()
    })
  }

  @SubhutiRule
  BitwiseANDExpression() {
    this.EqualityExpression()
    this.Many(() => {
      this.tokenConsumer.Ampersand()
      this.EqualityExpression()
    })
  }

  @SubhutiRule
  BitwiseXORExpression() {
    this.BitwiseANDExpression()
    this.Many(() => {
      this.tokenConsumer.Circumflex()
      this.BitwiseANDExpression()
    })
  }

  @SubhutiRule
  BitwiseORExpression() {
    this.BitwiseXORExpression()
    this.Many(() => {
      this.tokenConsumer.VerticalBar()
      this.BitwiseXORExpression()
    })
  }

  @SubhutiRule
  LogicalANDExpression() {
    this.BitwiseORExpression()
    this.Many(() => {
      this.tokenConsumer.AmpersandAmpersand()
      this.BitwiseORExpression()
    })
  }

  @SubhutiRule
  LogicalORExpression() {
    this.LogicalANDExpression()
    this.Many(() => {
      this.tokenConsumer.VerticalBarVerticalBar()
      this.LogicalANDExpression()
    })
  }

  @SubhutiRule
  ConditionalExpression() {

    this.LogicalORExpression()

    //这个把orbreak改为了false
    this.Option(() => {
      this.tokenConsumer.Question()
      this.AssignmentExpression()
      this.tokenConsumer.Colon()
      this.AssignmentExpression()
    })
  }


  @SubhutiRule
  AssignmentOperator() {
    this.Or([
      {alt: () => this.tokenConsumer.AsteriskEq()},
      {alt: () => this.tokenConsumer.SlashEq()},
      {alt: () => this.tokenConsumer.PercentEq()},
      {alt: () => this.tokenConsumer.PlusEq()},
      {alt: () => this.tokenConsumer.MinusEq()},
      {alt: () => this.tokenConsumer.LessLessEq()},
      {alt: () => this.tokenConsumer.MoreMoreEq()},
      {alt: () => this.tokenConsumer.MoreMoreMoreEq()},
      {alt: () => this.tokenConsumer.AmpersandEq()},
      {alt: () => this.tokenConsumer.CircumflexEq()},
      {alt: () => this.tokenConsumer.VerticalBarEq()}
    ])
  }

  @SubhutiRule
  Expression() {
    this.AssignmentExpression()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.AssignmentExpression()
    })
  }

  @SubhutiRule
  Statement() {
    this.Or([
      // {alt: () => this.AssignmentExpression()},
      {alt: () => this.BlockStatement()},
      {alt: () => this.VariableDeclaration()},
      {alt: () => this.EmptyStatement()},
      {alt: () => this.ExpressionStatement()},
      {alt: () => this.IfStatement()},
      {alt: () => this.BreakableStatement()},
      {alt: () => this.ContinueStatement()},
      {alt: () => this.BreakStatement()},
      {
        alt: () => {

          this.ReturnStatement()

        }
      },
      {
        alt: () => {
          this.WithStatement()
        }
      },
      {alt: () => this.LabelledStatement()},
      {alt: () => this.ThrowStatement()},
      {alt: () => this.TryStatement()},
      {alt: () => this.DebuggerStatement()}
    ])
  }

  @SubhutiRule
  Declaration() {
    this.Or([
      {alt: () => this.HoistableDeclaration()},
      {alt: () => this.ClassDeclaration()},
      {alt: () => this.VariableDeclaration()}
    ])
  }

  EmptySemicolon() {
    this.Option(() => {
      this.tokenConsumer.Semicolon()
    })
  }


  @SubhutiRule
  VariableLetOrConst() {
    this.Or([
      {alt: () => this.tokenConsumer.VarTok()},
      {alt: () => this.tokenConsumer.LetTok()},
      {alt: () => this.tokenConsumer.ConstTok()}
    ])
  }

  @SubhutiRule
  VariableDeclarationList() {
    this.VariableDeclarator()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.VariableDeclarator()
    })
  }

  //VariableStatement
  @SubhutiRule
  VariableDeclaration() {
    this.VariableLetOrConst()
    this.VariableDeclarationList()
    this.EmptySemicolon()
  }

  @SubhutiRule
  VariableDeclarator() {
    this.Or([
      {
        alt: () => {
          this.BindingIdentifier()
          this.Option(() => this.Initializer())
        }
      },
      {
        alt: () => {
          this.BindingPattern()
          this.Initializer()
        }
      }
    ])
  }

  @SubhutiRule
  Initializer() {
    this.tokenConsumer.Eq()
    this.AssignmentExpression()
  }


  @SubhutiRule
  AssignmentExpression() {
    this.Or([
      {
        alt: () => {
          this.YieldExpression()
        }
      },
      {alt: () => this.ArrowFunction()},
      {
        alt: () => {
          this.LeftHandSideExpression()
          this.tokenConsumer.Eq()
          this.AssignmentExpression()
        }
      },
      {
        alt: () => {
          this.LeftHandSideExpression()
          this.AssignmentOperator()
          this.AssignmentExpression()
        }
      },
      {alt: () => this.ConditionalExpression()}
    ])
  }

  @SubhutiRule
  HoistableDeclaration() {
    this.Or([
      {alt: () => this.FunctionDeclaration()},
      {alt: () => this.GeneratorDeclaration()}
    ])
  }

  @SubhutiRule
  BreakableStatement() {
    this.Or([
      {alt: () => this.IterationStatement()},
      {alt: () => this.SwitchStatement()}
    ])
  }

  @SubhutiRule
  BlockStatement() {
    this.Block()
  }

  @SubhutiRule
  Block() {
    this.tokenConsumer.LBrace()
    this.Option(() => this.StatementList())
    this.tokenConsumer.RBrace()
  }


  @SubhutiRule
  BindingPattern() {
    this.Or([
      {alt: () => this.ObjectBindingPattern()},
      {alt: () => this.ArrayBindingPattern()}
    ])
  }

  @SubhutiRule
  ObjectBindingPattern() {
    this.tokenConsumer.LBrace()
    this.Or([
      {alt: () => this.tokenConsumer.RBrace()},
      {
        alt: () => {
          this.BindingPropertyList()
          this.tokenConsumer.RBrace()
        }
      },
      {
        alt: () => {
          this.BindingPropertyList()
          this.tokenConsumer.Comma()
          this.tokenConsumer.RBrace()
        }
      }
    ])
  }

  @SubhutiRule
  ArrayBindingPattern() {
    this.tokenConsumer.LBracket()
    this.Or([
      {
        alt: () => {
          this.Option(() => this.Elision())
          this.Option(() => this.BindingRestElement())
          this.tokenConsumer.RBracket()
        }
      },
      {
        alt: () => {
          this.BindingElementList()
          this.tokenConsumer.RBracket()
        }
      },
      {
        alt: () => {
          this.BindingElementList()
          this.tokenConsumer.Comma()
          this.Option(() => this.Elision())
          this.Option(() => this.BindingRestElement())
          this.tokenConsumer.RBracket()
        }
      }
    ])
  }

  @SubhutiRule
  BindingPropertyList() {
    this.BindingProperty()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.BindingProperty()
    })
  }

  @SubhutiRule
  BindingElementList() {
    this.BindingElisionElement()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.BindingElisionElement()
    })
  }

  @SubhutiRule
  BindingElisionElement() {
    this.Option(() => this.Elision())
    this.BindingElement()
  }

  @SubhutiRule
  BindingProperty() {
    this.Or([
      {alt: () => this.SingleNameBinding()},
      {
        alt: () => {
          this.PropertyName()
          this.tokenConsumer.Colon()
          this.BindingElement()
        }
      }
    ])
  }

  @SubhutiRule
  BindingElement() {
    this.Or([
      {alt: () => this.SingleNameBinding()},
      {
        alt: () => {
          this.BindingPattern()
          this.Option(() => this.Initializer())
        }
      }
    ])
  }

  @SubhutiRule
  SingleNameBinding() {
    this.BindingIdentifier()
    this.Option(() => this.Initializer())
  }

  @SubhutiRule
  BindingRestElement() {
    this.tokenConsumer.Ellipsis()
    this.BindingIdentifier()
  }

  @SubhutiRule
  EmptyStatement() {
    this.EmptySemicolon()
  }

  @SubhutiRule
  ExpressionStatement() {
    // TODO: Implement lookahead check
    this.Expression()
    this.EmptySemicolon()
  }

  @SubhutiRule
  IfStatement() {
    this.tokenConsumer.IfTok()
    this.tokenConsumer.LParen()
    this.Expression()
    this.tokenConsumer.RParen()
    this.Statement()
    this.Option(() => {
      this.tokenConsumer.ElseTok()
      this.Statement()
    })
  }

  @SubhutiRule
  IterationStatement() {
    this.Or([
      {alt: () => this.DoWhileStatement()},
      {alt: () => this.WhileStatement()},
      {alt: () => this.ForStatement()},
      {alt: () => this.ForInOfStatement()}
    ])
  }

  @SubhutiRule
  DoWhileStatement() {
    this.tokenConsumer.DoTok()
    this.Statement()
    this.tokenConsumer.WhileTok()
    this.tokenConsumer.LParen()
    this.Expression()
    this.tokenConsumer.RParen()
    this.EmptySemicolon()
  }

  @SubhutiRule
  WhileStatement() {
    this.tokenConsumer.WhileTok()
    this.tokenConsumer.LParen()
    this.Expression()
    this.tokenConsumer.RParen()
    this.Statement()
  }

  @SubhutiRule
  ForStatement() {
    this.tokenConsumer.ForTok()
    this.tokenConsumer.LParen()
    // TODO: Implement lookahead check for 'let ['
    this.Or([
      {
        alt: () => {
          this.Option(() => this.Expression())
          this.EmptySemicolon()
          this.Option(() => this.Expression())
          this.EmptySemicolon()
          this.Option(() => this.Expression())
        }
      },
      {
        alt: () => {
          this.VariableDeclaration()
          this.Option(() => this.Expression())
          this.EmptySemicolon()
          this.Option(() => this.Expression())
        }
      }
    ])
    this.tokenConsumer.RParen()
    this.Statement()
  }

  @SubhutiRule
  ForInOfStatement() {
    this.tokenConsumer.ForTok()
    this.tokenConsumer.LParen()
    this.Or([
      {
        alt: () => {
          // TODO: Implement lookahead check for 'let ['
          this.LeftHandSideExpression()
          this.Or([
            {
              alt: () => {
                this.tokenConsumer.InTok()
                this.Expression()
              }
            },
            {
              alt: () => {
                this.tokenConsumer.OfTok()
                this.AssignmentExpression()
              }
            }
          ])
        }
      },
      {
        alt: () => {
          this.ForDeclaration()
          this.Or([
            {
              alt: () => {
                this.tokenConsumer.InTok()
                this.Expression()
              }
            },
            {
              alt: () => {
                this.tokenConsumer.OfTok()
                this.AssignmentExpression()
              }
            }
          ])
        }
      }
    ])
    this.tokenConsumer.RParen()
    this.Statement()
  }

  @SubhutiRule
  ForDeclaration() {
    this.VariableLetOrConst()
    this.ForBinding()
  }

  @SubhutiRule
  ForBinding() {
    this.Or([
      {alt: () => this.BindingIdentifier()},
      {alt: () => this.BindingPattern()}
    ])
  }

  @SubhutiRule
  ContinueStatement() {
    this.tokenConsumer.ContinueTok()
    this.Option(() => {
      // TODO: Implement [no LineTerminator here] check
      this.LabelIdentifier()
    })
    this.EmptySemicolon()
  }

  @SubhutiRule
  BreakStatement() {
    this.tokenConsumer.BreakTok()
    this.Option(() => {
      // TODO: Implement [no LineTerminator here] check
      this.LabelIdentifier()
    })
    this.EmptySemicolon()
  }

  @SubhutiRule
  ReturnStatement() {
    this.tokenConsumer.ReturnTok()
    this.Option(() => {
      // TODO: Implement [no LineTerminator here] check
      this.Expression()
    })
    this.EmptySemicolon()
  }

  @SubhutiRule
  WithStatement() {
    this.tokenConsumer.WithTok()
    this.tokenConsumer.LParen()
    this.Expression()
    this.tokenConsumer.RParen()
    this.Statement()
  }

  @SubhutiRule
  SwitchStatement() {
    this.tokenConsumer.SwitchTok()
    this.tokenConsumer.LParen()
    this.Expression()
    this.tokenConsumer.RParen()
    this.CaseBlock()
  }

  @SubhutiRule
  CaseBlock() {
    this.tokenConsumer.LBrace()
    this.Option(() => this.CaseClauses())
    this.Option(() => {
      this.DefaultClause()
      this.Option(() => this.CaseClauses())
    })
    this.tokenConsumer.RBrace()
  }

  @SubhutiRule
  CaseClauses() {
    this.Many(() => this.CaseClause())
  }

  @SubhutiRule
  CaseClause() {
    this.tokenConsumer.CaseTok()
    this.Expression()
    this.tokenConsumer.Colon()
    this.Option(() => this.StatementList())
  }

  @SubhutiRule
  DefaultClause() {
    this.tokenConsumer.DefaultTok()
    this.tokenConsumer.Colon()
    this.Option(() => this.StatementList())
  }

  @SubhutiRule
  LabelledStatement() {
    this.LabelIdentifier()
    this.tokenConsumer.Colon()
    this.LabelledItem()
  }

  @SubhutiRule
  LabelledItem() {
    this.Or([
      {alt: () => this.Statement()},
      {alt: () => this.FunctionDeclaration()}
    ])
  }

  @SubhutiRule
  ThrowStatement() {
    this.tokenConsumer.ThrowTok()
    // TODO: Implement [no LineTerminator here] check
    this.Expression()
    this.EmptySemicolon()
  }

  @SubhutiRule
  TryStatement() {
    this.tokenConsumer.TryTok()
    this.Block()
    this.Or([
      {
        alt: () => {
          this.Catch()
          this.Option(() => this.Finally())
        }
      },
      {alt: () => this.Finally()}
    ])
  }

  @SubhutiRule
  Catch() {
    this.tokenConsumer.CatchTok()
    this.tokenConsumer.LParen()
    this.CatchParameter()
    this.tokenConsumer.RParen()
    this.Block()
  }

  @SubhutiRule
  Finally() {
    this.tokenConsumer.FinallyTok()
    this.Block()
  }

  @SubhutiRule
  CatchParameter() {
    this.Or([
      {alt: () => this.BindingIdentifier()},
      {alt: () => this.BindingPattern()}
    ])
  }

  @SubhutiRule
  DebuggerStatement() {
    this.tokenConsumer.DebuggerTok()
    this.EmptySemicolon()
  }


  @SubhutiRule
  FunctionDeclaration() {
    this.tokenConsumer.FunctionTok()
    this.BindingIdentifier()
    this.FunctionFormalParametersBodyDefine()
  }

  @SubhutiRule
  FunctionExpression() {
    this.tokenConsumer.FunctionTok()
    this.Option(() => this.BindingIdentifier())
    this.FunctionFormalParametersBodyDefine()
  }


  @SubhutiRule
  FunctionBodyDefine() {
    this.tokenConsumer.LBrace()
    this.FunctionBody()
    this.tokenConsumer.RBrace()
  }

  @SubhutiRule
  FormalParameterList() {
    this.Or([
      {alt: () => this.FunctionRestParameter()},
      {
        alt: () => {
          this.FormalParameterListFormalsList()
        }
      }
    ])
  }

  @SubhutiRule
  FormalParameterListFormalsList() {
    this.FormalsList()
    this.Option(() => {
      this.CommaFunctionRestParameter()
    })
  }


  @SubhutiRule
  CommaFunctionRestParameter() {
    this.tokenConsumer.Comma()
    this.FunctionRestParameter()
  }

  @SubhutiRule
  FormalsList() {
    this.FormalParameter()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.FormalParameter()
    })
  }

  @SubhutiRule
  FunctionRestParameter() {
    this.BindingRestElement()
  }

  @SubhutiRule
  FormalParameter() {
    this.BindingElement()
  }

  @SubhutiRule
  FunctionBody() {
    this.Option(() => this.StatementList())
  }

  @SubhutiRule
  FunctionStatementList() {
    this.Option(() => this.StatementList())
  }

  @SubhutiRule
  ArrowFunction() {
    this.ArrowParameters()
    // TODO: Implement [no LineTerminator here] check
    this.tokenConsumer.Arrow()
    this.ConciseBody()
  }

  @SubhutiRule
  ArrowParameters() {
    this.Or([
      {alt: () => this.BindingIdentifier()},
      {alt: () => {
        this.tokenConsumer.LParen()
        this.Option(() => {
          this.FormalParameterList()
        })
        this.tokenConsumer.RParen()
      }}
    ])
  }

  @SubhutiRule
  ConciseBody() {
    this.Or([
      {
        alt: () => {
          // TODO: Implement lookahead check
          this.AssignmentExpression()
        }
      },
      {
        alt: () => {
          this.FunctionBodyDefine()
        }
      }
    ])
  }

  @SubhutiRule
  ArrowFormalParameters() {
    this.FunctionFormalParameters()
  }


  @SubhutiRule
  PropertyNameMethodDefinition() {
    this.PropertyName()
    this.FunctionFormalParametersBodyDefine()
  }

  @SubhutiRule
  GetMethodDefinition() {
    this.tokenConsumer.GetTok()
    this.PropertyName()
    this.tokenConsumer.LParen()
    this.tokenConsumer.RParen()
    this.FunctionBodyDefine()
  }

  @SubhutiRule
  SetMethodDefinition() {
    this.tokenConsumer.SetTok()
    this.PropertyNameMethodDefinition()
  }

  @SubhutiRule
  MethodDefinition() {
    this.Or([
      {
        alt: () => {
          this.PropertyNameMethodDefinition()
        }
      },
      {
        alt: () => {
          this.GeneratorMethod()
        }
      },
      {
        alt: () => {
          this.GetMethodDefinition()
        }
      },
      {
        alt: () => {
          this.SetMethodDefinition()
        }
      }
    ])
  }

  @SubhutiRule
  FunctionFormalParameters() {
    this.tokenConsumer.LParen()
    this.Option(() => {
      this.FormalParameterList()
    })
    this.tokenConsumer.RParen()
  }

  @SubhutiRule
  GeneratorMethod() {
    this.tokenConsumer.Asterisk()
    this.PropertyName()
    this.FunctionFormalParametersBodyDefine()
  }


  @SubhutiRule
  FunctionFormalParametersBodyDefine() {
    this.FunctionFormalParameters()
    this.FunctionBodyDefine()
  }

  @SubhutiRule
  GeneratorDeclaration() {
    this.tokenConsumer.FunctionTok()
    this.tokenConsumer.Asterisk()
    this.BindingIdentifier()
    this.tokenConsumer.LParen()
    this.FormalParameterList()
    this.tokenConsumer.RParen()
    this.FunctionBodyDefine()
  }

  @SubhutiRule
  GeneratorExpression() {
    this.tokenConsumer.FunctionTok()
    this.tokenConsumer.Asterisk()
    this.Option(() => this.BindingIdentifier())
    this.tokenConsumer.LParen()
    this.FormalParameterList()
    this.tokenConsumer.RParen()
    this.FunctionBodyDefine()
  }

  @SubhutiRule
  YieldExpression() {
    this.tokenConsumer.YieldTok()
    this.Option(() => {
      // TODO: Implement [no LineTerminator here] check
      this.Or([
        {alt: () => this.AssignmentExpression()},
        {
          alt: () => {
            this.tokenConsumer.Asterisk()
            this.AssignmentExpression()
          }
        }
      ])
    })
  }

  @SubhutiRule
  ClassDeclaration() {
    this.tokenConsumer.ClassTok()
    this.BindingIdentifier()
    this.ClassTail()
  }

  @SubhutiRule
  ClassExpression() {
    this.tokenConsumer.ClassTok()
    this.Option(() => this.BindingIdentifier())
    this.ClassTail()
  }

  @SubhutiRule
  ClassTail() {
    this.Option(() => this.ClassHeritage())
    this.tokenConsumer.LBrace()
    this.Option(() => this.ClassBody())
    this.tokenConsumer.RBrace()
  }

  @SubhutiRule
  ClassHeritage() {
    this.tokenConsumer.ExtendsTok()
    this.LeftHandSideExpression()
  }

  @SubhutiRule
  ClassBody() {
    this.ClassElementList()
  }

  @SubhutiRule
  ClassElementList() {
    this.Many(() => this.ClassElement())
  }

  @SubhutiRule
  ClassElement() {
    this.Or([
      {alt: () => this.MethodDefinition()},
      {
        alt: () => {
          this.tokenConsumer.StaticTok()
          this.MethodDefinition()
        }
      },
      {
        alt: () => {
          this.FieldDefinition()
        }
      },
      {
        alt: () => {
          this.tokenConsumer.StaticTok()
          this.FieldDefinition()
        }
      },
      {alt: () => this.EmptySemicolon()}
    ])
  }

  @SubhutiRule
  FieldDefinition() {
    this.PropertyName()
    this.Option(() => this.Initializer())
    this.Option(() => this.EmptySemicolon())
  }

  @SubhutiRule
  Program() {
    this.Or([
      {
        alt: () => {
          this.ModuleItemList()
        }
      },
    ])
    return this.getCurCst()
  }

  @SubhutiRule
  ModuleItemList() {
    this.FaultToleranceMany(() => {
      this.Or([
        {alt: () => this.ImportDeclaration()},
        {alt: () => this.ExportDeclaration()},
        {alt: () => this.StatementListItem()},
      ])
    })
  }

  @SubhutiRule
  StatementList() {
    this.Many(() => {
      this.StatementListItem()
    })
  }

  @SubhutiRule
  StatementListItem() {
    this.Or([
      {
        alt: () => {

          this.Statement()

        }
      },
      {
        alt: () => {
          this.Declaration()
        }
      }
    ])
  }


  @SubhutiRule
  ImportDeclaration() {
    this.tokenConsumer.ImportTok()
    this.Or([
      {
        alt: () => {
          this.ImportClause()
          this.FromClause()
        }
      },
      {
        alt: () => {
          this.ModuleSpecifier()
        }
      }
    ])
    this.EmptySemicolon()
  }

  @SubhutiRule
  ImportClause() {
    this.Or([
      {alt: () => this.ImportedDefaultBinding()},
      {alt: () => this.NameSpaceImport()},
      {alt: () => this.NamedImports()},
      {
        alt: () => {
          this.ImportedDefaultBindingCommaNameSpaceImport()
        }
      },
      {
        alt: () => {
          this.ImportedDefaultBindingCommaNamedImports()
        }
      }
    ])
  }

  @SubhutiRule
  ImportedDefaultBindingCommaNameSpaceImport() {
    this.ImportedDefaultBinding()
    this.tokenConsumer.Comma()
    this.NameSpaceImport()
  }

  @SubhutiRule
  ImportedDefaultBindingCommaNamedImports() {
    this.ImportedDefaultBinding()
    this.tokenConsumer.Comma()
    this.NameSpaceImport()
  }

  @SubhutiRule
  ImportedDefaultBinding() {
    this.ImportedBinding()
  }

  @SubhutiRule
  NameSpaceImport() {
    this.tokenConsumer.Asterisk()
    this.tokenConsumer.AsTok()
    this.ImportedBinding()
  }

  @SubhutiRule
  NamedImports() {
    this.tokenConsumer.LBrace()
    //应该消耗多的在前面，因为不是按顺序匹配的
    this.Or([
      {
        alt: () => {
          this.ImportsList()
          this.tokenConsumer.Comma()
          this.tokenConsumer.RBrace()
        }
      },
      {
        alt: () => {
          this.ImportsList()
          this.tokenConsumer.RBrace()
        }
      },
      {
        alt: () => {
          this.tokenConsumer.RBrace()
        }
      },
    ])
  }

  @SubhutiRule
  FromClause() {
    this.tokenConsumer.FromTok()
    this.ModuleSpecifier()
  }

  @SubhutiRule
  ImportsList() {
    this.ImportSpecifier()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.ImportSpecifier()
    })
  }

  @SubhutiRule
  ImportSpecifier() {
    this.Or([
      {alt: () => this.ImportedBinding()},
      {
        alt: () => {
          this.tokenConsumer.Identifier()
          this.tokenConsumer.AsTok()
          this.ImportedBinding()
        }
      }
    ])
  }

  @SubhutiRule
  ModuleSpecifier() {
    this.tokenConsumer.StringLiteral()
  }

  @SubhutiRule
  ImportedBinding() {
    this.BindingIdentifier()
  }

  @SubhutiRule
  AsteriskFromClauseEmptySemicolon() {
    this.tokenConsumer.Asterisk()
    this.FromClause()
    this.EmptySemicolon()
  }

  @SubhutiRule
  ExportClauseFromClauseEmptySemicolon() {
    this.ExportClause()
    this.FromClause()
    this.EmptySemicolon()
  }


  @SubhutiRule
  ExportClauseEmptySemicolon() {
    this.ExportClause()
    this.EmptySemicolon()
  }

  @SubhutiRule
  DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression() {
    this.tokenConsumer.DefaultTok()
    this.Or([
      {alt: () => this.HoistableDeclaration()},
      {alt: () => this.ClassDeclaration()},
      {
        alt: () => {
          // TODO: Implement lookahead check
          this.AssignmentExpressionEmptySemicolon()
        }
      }
    ])
  }

  @SubhutiRule
  AssignmentExpressionEmptySemicolon() {
    this.AssignmentExpression()
    this.EmptySemicolon()
  }

  @SubhutiRule
  ExportDeclaration() {
    this.tokenConsumer.ExportTok()
    this.Or([
      {
        alt: () => {
          this.AsteriskFromClauseEmptySemicolon()
        }
      },
      {
        alt: () => {
          this.ExportClauseFromClauseEmptySemicolon()
        }
      },
      {
        alt: () => {
          this.ExportClauseEmptySemicolon()
        }
      },
      {alt: () => this.Declaration()},
      {
        alt: () => {
          this.DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression()
        }
      }
    ])
  }

  @SubhutiRule
  ExportClause() {
    this.tokenConsumer.LBrace()
    this.Or([
      {alt: () => this.tokenConsumer.RBrace()},
      {
        alt: () => {
          this.ExportsList()
          this.tokenConsumer.RBrace()
        }
      },
      {
        alt: () => {
          this.ExportsList()
          this.tokenConsumer.Comma()
          this.tokenConsumer.RBrace()
        }
      }
    ])
  }

  @SubhutiRule
  ExportsList() {
    this.ExportSpecifier()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.ExportSpecifier()
    })
  }

  @SubhutiRule
  ExportSpecifier() {
    this.tokenConsumer.Identifier()
    this.Option(() => {
      this.tokenConsumer.AsTok()
      this.tokenConsumer.Identifier()
    })
  }
}

