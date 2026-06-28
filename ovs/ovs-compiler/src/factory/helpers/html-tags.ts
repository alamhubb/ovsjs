/**
 * HTML 标签列表
 * 用于判断是否需要转换为 $OvsHtmlTag.xxx()
 */
export const HTML_TAGS = [
    'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
    'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
    'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
    'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
    'em', 'embed',
    'fieldset', 'figcaption', 'figure', 'footer', 'form',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
    'i', 'iframe', 'img', 'input', 'ins',
    'kbd',
    'label', 'legend', 'li', 'link',
    'main', 'map', 'mark', 'menu', 'meta', 'meter',
    'nav', 'noscript',
    'object', 'ol', 'optgroup', 'option', 'output',
    'p', 'picture', 'pre', 'progress',
    'q',
    'rp', 'rt', 'ruby',
    's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg',
    'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
    'u', 'ul',
    'var', 'video',
    'wbr'
]

/**
 * 检查标签名是否是 HTML 标签
 */
export function isHtmlTag(tagName: string): boolean {
    const normalizedTagName = tagName.trim().toLowerCase()
    for (let i = 0; i < HTML_TAGS.length; i++) {
        if (HTML_TAGS[i] === normalizedTagName) {
            return true
        }
    }
    return false
}

import {
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils,
    type SlimeExpression
} from "slime-ast"

/**
 * 创建 callee 表达式
 * - HTML 标签返回 $OvsHtmlTag.xxx
 * - 用户组件返回标识符（需要配合 h() 使用）
 */
export function createCalleeForTag(tagName: string, loc?: any): SlimeExpression {
    const normalizedTagName = tagName.trim()
    if (isHtmlTag(normalizedTagName)) {
        // HTML tag -> $OvsHtmlTag.tagName.
        // Keep the synthetic member property unmapped; mapping the property
        // back to the source tag can make the generator insert source-layout
        // gaps between "$OvsHtmlTag." and the property name.
        const tagIdentifier = SlimeAstCreateUtils.createIdentifier(normalizedTagName)
        const memberExpr = SlimeAstCreateUtils.createMemberExpression(
            SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag'),
            SlimeTokenCreateUtils.createDotToken(),
            tagIdentifier
        )
        return memberExpr
    } else {
        // 用户组件 → 直接使用标识符
        const id = SlimeAstCreateUtils.createIdentifier(normalizedTagName)
        if (loc) id.loc = loc
        return id
    }
}
