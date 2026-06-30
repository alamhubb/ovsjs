/**
 * OVS CST到AST转换器模块
 * 
## 重构进度：部分完成（基础层提取完成40%）

已成功提取核心基础层：
- O

vsCstToSlimeAst.Helpers.ts - 基础辅助方法（96行）
- OvsCstToSlimeAst.Judgement.ts - 判断逻辑（65行）
- OvsCstToSlimeAst.IIFE.ts - IIFE构建（180行）  
- OvsCstToSlimeAst.View.ts - 视图构建（147行）
- OvsCstToSlimeAst.Property.ts - 属性处理（210行）
- OvsCstToSlimeAst.Statement.ts - 语句转换（257行）
- OvsCstToSlimeAst.Import.ts - 导入管理（311行）

## 使用说明

由于历史原文件(`OvsCstToSlimeAstUtils.ts`)仍包含完整功能且稳定可用，
新拆分文件可作为未来渐进重构的参考。

## 下一步建议

1. **渐进式迁移**：逐个方法从原文件迁移到对应层文件
2. **类型修复**：解决abstract方法声明和父类方法调用问题
3. **测试验证**：每迁移一个层立即运行测试确保功能正常

## 注意事项

当前拆分文件依赖父类方法实现（如 createIdentifierReferenceAst 等来自 generated SlimeCstToAstBridge）
会有编译错误。需要先修复这些依赖关系后再完全替换原文件。
 */

// 导出原始完整实现（当前稳定版本）
export { OvsCstToSlimeAstUtils, registerOvsCstToSlimeAst, checkCstName, throwNewError } from '../OvsCstToSlimeAstUtils'

// 导出新拆分的层（供未来迁移使用）
export { OvsCstToSlimeAstHelpers } from './OvsCstToSlimeAst.Helpers'
export { OvsCstToSlimeAstJudgement } from './OvsCstToSlimeAst.Judgement'
export { OvsCstToSlimeAstIIFE } from './OvsCstToSlimeAst.IIFE'
export { OvsCstToSlimeAstView } from './OvsCstToSlimeAst.View'
export { OvsCstToSlimeAstProperty } from './OvsCstToSlimeAst.Property'
export { OvsCstToSlimeAstStatement } from './OvsCstToSlimeAst.Statement'
export { OvsCstToSlimeAstImport } from './OvsCstToSlimeAst.Import'
// export { OvsCstToSlimeAst } from './OvsCstToSlimeAst'  // 待完成
