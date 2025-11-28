import {
    ArrayExpression,
    ArrowFunctionExpression,
    AssignmentExpression,
    AwaitExpression,
    BigIntLiteral,
    BinaryExpression,
    BindExpression,
    BooleanLiteral,
    CallExpression,
    ClassExpression,
    ConditionalExpression,
    DecimalLiteral,
    DoExpression,
    Expression,
    FunctionExpression,
    Identifier,
    Import,
    ImportExpression,
    JSXElement,
    JSXFragment,
    LogicalExpression,
    MemberExpression,
    MetaProperty,
    ModuleExpression,
    NewExpression,
    NullLiteral,
    NumericLiteral,
    ObjectExpression,
    OptionalCallExpression,
    OptionalMemberExpression,
    ParenthesizedExpression,
    PipelineBareFunction,
    PipelinePrimaryTopicReference,
    PipelineTopicExpression,
    RecordExpression,
    RegExpLiteral,
    SequenceExpression,
    StringLiteral,
    Super,
    TaggedTemplateExpression,
    TemplateLiteral,
    ThisExpression,
    TopicReference,
    TSAsExpression,
    TSInstantiationExpression,
    TSNonNullExpression,
    TSSatisfiesExpression,
    TSTypeAssertion,
    TupleExpression,
    TypeCastExpression,
    UnaryExpression,
    UpdateExpression,
    YieldExpression,
} from '@babel/types';
import {
    SlimeAssignmentExpression,
    SlimeBaseNode,
    SlimeExpression,
    SlimeIdentifier
} from "slime-ast/src/SlimeAstInterface.ts";

// 自定义声明类型
export interface OvsAstRenderDomViewDeclaration extends SlimeBaseNode {
    type: "OvsRenderDomViewDeclaration";
    id: SlimeIdentifier;
    children: SlimeAssignmentExpression[];
    arguments: SlimeExpression[];
}

export interface OvsAstLexicalBinding extends SlimeBaseNode {
    type: "OvsLexicalBinding";
    id: SlimeIdentifier;
    init?: SlimeExpression | null | undefined;
}

type OvsAstExpression = OvsAstRenderDomViewDeclaration | Expression
