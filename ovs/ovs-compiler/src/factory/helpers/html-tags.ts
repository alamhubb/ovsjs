/**
 * HTML 标签列表
 * 用于判断是否需要转换为 $OvsHtmlTag.xxx()
 */
export const HTML_TAGS = new Set([
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
])

/**
 * 检查标签名是否是 HTML 标签
 */
export function isHtmlTag(tagName: string): boolean {
    return HTML_TAGS.has(tagName.toLowerCase())
}

/**
 * 创建 callee 表达式
 * - HTML 标签返回 $OvsHtmlTag.xxx
 * - 用户组件返回标识符（需要配合 h() 使用）
 */
export function createCalleeForTag(
    tagName: string,
    loc?: any,
    SlimeAstCreateUtils?: any,
    SlimeTokenCreateUtils?: any
): any {
    if (isHtmlTag(tagName)) {
        // HTML 标签 → $OvsHtmlTag.tagName
        // 关键：给标签名标识符设置 loc，用于 source map 映射
        const tagIdentifier = SlimeAstCreateUtils.createIdentifier(tagName)
        if (loc) {
            tagIdentifier.loc = {
                ...loc,
                value: tagName  // 确保 value 字段包含标签名，供 SlimeGenerator 使用
            }
        }
        const memberExpr = SlimeAstCreateUtils.createMemberExpression(
            SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag'),
            SlimeTokenCreateUtils.createDotToken(),
            tagIdentifier
        )
        if (loc) memberExpr.loc = loc
        return memberExpr
    } else {
        // 用户组件 → 直接使用标识符
        const id = SlimeAstCreateUtils.createIdentifier(tagName)
        if (loc) id.loc = loc
        return id
    }
}
