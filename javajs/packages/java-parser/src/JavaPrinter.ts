/**
 * Java Pretty Printer - 将 CST 转换回 Java 源代码
 *
 * 用于往返测试：parse -> print -> parse 应该产生等效的 CST
 */
import type { SubhutiCst } from 'subhuti'

export interface PrinterOptions {
    indent?: string      // 缩进字符，默认 4 空格
    newline?: string     // 换行符，默认 \n
}

export default class JavaPrinter {
    private indent: string
    private newline: string
    private indentLevel: number = 0
    private output: string[] = []

    constructor(options: PrinterOptions = {}) {
        this.indent = options.indent ?? '    '
        this.newline = options.newline ?? '\n'
    }

    /**
     * 将 CST 转换为 Java 源代码
     */
    print(cst: SubhutiCst): string {
        this.output = []
        this.indentLevel = 0
        this.visit(cst)
        return this.output.join('')
    }

    private visit(node: SubhutiCst): void {
        if (!node) return

        // 如果是叶节点（token），直接输出值
        if (node.value !== undefined) {
            this.emit(node.value)
            return
        }

        // 根据节点类型分发处理
        const handler = this.getHandler(node.name)
        if (handler) {
            handler.call(this, node)
        } else {
            // 默认处理：遍历所有子节点
            this.visitChildren(node)
        }
    }

    private visitChildren(node: SubhutiCst): void {
        if (node.children) {
            for (const child of node.children) {
                this.visit(child)
            }
        }
    }


    private getHandler(name: string): ((node: SubhutiCst) => void) | undefined {
        const handlers: Record<string, (node: SubhutiCst) => void> = {
            // 编译单元
            compilationUnit: this.printCompilationUnit,
            packageDeclaration: this.printPackageDeclaration,
            importDeclaration: this.printImportDeclaration,

            // 类型声明
            typeDeclaration: this.printTypeDeclaration,
            classOrInterfaceModifier: this.printClassOrInterfaceModifier,
            classDeclaration: this.printClassDeclaration,
            interfaceDeclaration: this.printInterfaceDeclaration,
            enumDeclaration: this.printEnumDeclaration,
            recordDeclaration: this.printRecordDeclaration,
            annotationTypeDeclaration: this.printAnnotationTypeDeclaration,

            // 类体
            classBody: this.printClassBody,
            classBodyDeclaration: this.printClassBodyDeclaration,
            methodDeclaration: this.printMethodDeclaration,
            constructorDeclaration: this.printConstructorDeclaration,
            fieldDeclaration: this.printFieldDeclaration,

            // 语句
            block: this.printBlock,
            blockStatement: this.printBlockStatement,
            statement: this.printStatement,

            // 表达式
            expression: this.printExpression,

            // 注解
            annotation: this.printAnnotation,
        }
        return handlers[name]
    }

    // ============================================
    // 输出辅助方法
    // ============================================

    private emit(text: string): void {
        this.output.push(text)
    }

    private emitSpace(): void {
        this.emit(' ')
    }

    private emitNewline(): void {
        this.emit(this.newline)
    }

    private emitIndent(): void {
        this.emit(this.indent.repeat(this.indentLevel))
    }

    private increaseIndent(): void {
        this.indentLevel++
    }

    private decreaseIndent(): void {
        this.indentLevel = Math.max(0, this.indentLevel - 1)
    }


    // ============================================
    // 编译单元
    // ============================================

    private printCompilationUnit(node: SubhutiCst): void {
        for (const child of node.children || []) {
            this.visit(child)
            if (child.name === 'packageDeclaration' || child.name === 'importDeclaration') {
                this.emitNewline()
            }
        }
    }

    private printPackageDeclaration(node: SubhutiCst): void {
        // annotation* PACKAGE qualifiedName ';'
        for (const child of node.children || []) {
            if (child.name === 'annotation') {
                this.visit(child)
                this.emitNewline()
            } else if (child.value === 'package') {
                this.emit('package')
                this.emitSpace()
            } else if (child.name === 'qualifiedName') {
                this.visit(child)
            } else if (child.value === ';') {
                this.emit(';')
            }
        }
    }

    private printImportDeclaration(node: SubhutiCst): void {
        // IMPORT STATIC? qualifiedName ('.' '*')? ';'
        this.emit('import')
        this.emitSpace()
        for (const child of node.children || []) {
            if (child.value === 'static') {
                this.emit('static')
                this.emitSpace()
            } else if (child.name === 'qualifiedName') {
                this.visit(child)
            } else if (child.value === '.') {
                this.emit('.')
            } else if (child.value === '*') {
                this.emit('*')
            } else if (child.value === ';') {
                this.emit(';')
            }
        }
    }

    // ============================================
    // 类型声明
    // ============================================

    private printTypeDeclaration(node: SubhutiCst): void {
        // classOrInterfaceModifier* (classDeclaration | enumDeclaration | ...)
        const children = node.children || []
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            this.visit(child)
            // 在修饰符后添加空格（如果下一个不是修饰符）
            if (child.name === 'classOrInterfaceModifier') {
                this.emitSpace()
            }
        }
    }

    private printClassOrInterfaceModifier(node: SubhutiCst): void {
        // annotation | PUBLIC | PROTECTED | PRIVATE | ABSTRACT | STATIC | FINAL | STRICTFP | SEALED | NON_SEALED
        for (const child of node.children || []) {
            if (child.name === 'annotation') {
                this.visit(child)
            } else if (child.value) {
                this.emit(child.value)
            }
        }
    }

    private printClassDeclaration(node: SubhutiCst): void {
        // CLASS typeIdentifier typeParameters? (EXTENDS typeType)? (IMPLEMENTS typeList)? (PERMITS typeList)? classBody
        for (const child of node.children || []) {
            if (child.value === 'class') {
                this.emit('class')
                this.emitSpace()
            } else if (child.name === 'typeIdentifier') {
                this.visit(child)
            } else if (child.name === 'typeParameters') {
                this.visit(child)
            } else if (child.value === 'extends') {
                this.emitSpace()
                this.emit('extends')
                this.emitSpace()
            } else if (child.value === 'implements') {
                this.emitSpace()
                this.emit('implements')
                this.emitSpace()
            } else if (child.value === 'permits') {
                this.emitSpace()
                this.emit('permits')
                this.emitSpace()
            } else if (child.name === 'typeType' || child.name === 'typeList') {
                this.visit(child)
            } else if (child.name === 'classBody') {
                this.emitSpace()
                this.visit(child)
            }
        }
    }

    private printInterfaceDeclaration(node: SubhutiCst): void {
        for (const child of node.children || []) {
            if (child.value === 'interface') {
                this.emit('interface')
                this.emitSpace()
            } else if (child.name === 'typeIdentifier') {
                this.visit(child)
            } else if (child.name === 'typeParameters') {
                this.visit(child)
            } else if (child.value === 'extends') {
                this.emitSpace()
                this.emit('extends')
                this.emitSpace()
            } else if (child.value === 'permits') {
                this.emitSpace()
                this.emit('permits')
                this.emitSpace()
            } else if (child.name === 'typeList') {
                this.visit(child)
            } else if (child.name === 'interfaceBody') {
                this.emitSpace()
                this.visit(child)
            }
        }
    }

    private printEnumDeclaration(node: SubhutiCst): void {
        for (const child of node.children || []) {
            if (child.value === 'enum') {
                this.emit('enum')
                this.emitSpace()
            } else if (child.name === 'typeIdentifier') {
                this.visit(child)
            } else if (child.value === 'implements') {
                this.emitSpace()
                this.emit('implements')
                this.emitSpace()
            } else if (child.name === 'typeList') {
                this.visit(child)
            } else {
                this.visit(child)
            }
        }
    }

    private printRecordDeclaration(node: SubhutiCst): void {
        for (const child of node.children || []) {
            if (child.value === 'record') {
                this.emit('record')
                this.emitSpace()
            } else if (child.name === 'typeIdentifier') {
                this.visit(child)
            } else if (child.name === 'typeParameters') {
                this.visit(child)
            } else if (child.name === 'recordHeader') {
                this.visit(child)
            } else if (child.value === 'implements') {
                this.emitSpace()
                this.emit('implements')
                this.emitSpace()
            } else if (child.name === 'typeList') {
                this.visit(child)
            } else if (child.name === 'recordBody') {
                this.emitSpace()
                this.visit(child)
            }
        }
    }

    private printAnnotationTypeDeclaration(node: SubhutiCst): void {
        for (const child of node.children || []) {
            if (child.value === '@') {
                this.emit('@')
            } else if (child.value === 'interface') {
                this.emit('interface')
                this.emitSpace()
            } else if (child.name === 'typeIdentifier') {
                this.visit(child)
            } else if (child.name === 'annotationTypeBody') {
                this.emitSpace()
                this.visit(child)
            }
        }
    }


    // ============================================
    // 类体
    // ============================================

    private printClassBody(node: SubhutiCst): void {
        this.emit('{')
        this.emitNewline()
        this.increaseIndent()
        for (const child of node.children || []) {
            if (child.name === 'classBodyDeclaration') {
                this.emitIndent()
                this.visit(child)
                this.emitNewline()
            }
        }
        this.decreaseIndent()
        this.emitIndent()
        this.emit('}')
    }

    private printClassBodyDeclaration(node: SubhutiCst): void {
        for (const child of node.children || []) {
            this.visit(child)
            if (child.name === 'modifier' || child.name === 'classOrInterfaceModifier') {
                this.emitSpace()
            }
        }
    }

    private printMethodDeclaration(node: SubhutiCst): void {
        for (const child of node.children || []) {
            if (child.name === 'typeTypeOrVoid') {
                this.visit(child)
                this.emitSpace()
            } else if (child.name === 'identifier') {
                this.visit(child)
            } else if (child.name === 'formalParameters') {
                this.visit(child)
            } else if (child.value === 'throws') {
                this.emitSpace()
                this.emit('throws')
                this.emitSpace()
            } else if (child.name === 'qualifiedNameList') {
                this.visit(child)
            } else if (child.name === 'methodBody') {
                this.emitSpace()
                this.visit(child)
            } else {
                this.visit(child)
            }
        }
    }

    private printConstructorDeclaration(node: SubhutiCst): void {
        for (const child of node.children || []) {
            if (child.name === 'identifier') {
                this.visit(child)
            } else if (child.name === 'formalParameters') {
                this.visit(child)
            } else if (child.value === 'throws') {
                this.emitSpace()
                this.emit('throws')
                this.emitSpace()
            } else if (child.name === 'qualifiedNameList') {
                this.visit(child)
            } else if (child.name === 'block') {
                this.emitSpace()
                this.visit(child)
            }
        }
    }

    private printFieldDeclaration(node: SubhutiCst): void {
        for (const child of node.children || []) {
            if (child.name === 'typeType') {
                this.visit(child)
                this.emitSpace()
            } else if (child.name === 'variableDeclarators') {
                this.visit(child)
            } else if (child.value === ';') {
                this.emit(';')
            }
        }
    }

    // ============================================
    // 语句
    // ============================================

    private printBlock(node: SubhutiCst): void {
        this.emit('{')
        this.emitNewline()
        this.increaseIndent()
        for (const child of node.children || []) {
            if (child.name === 'blockStatement') {
                this.emitIndent()
                this.visit(child)
                this.emitNewline()
            }
        }
        this.decreaseIndent()
        this.emitIndent()
        this.emit('}')
    }

    private printBlockStatement(node: SubhutiCst): void {
        this.visitChildren(node)
    }

    private printStatement(node: SubhutiCst): void {
        this.visitChildren(node)
    }

    // ============================================
    // 表达式
    // ============================================

    private printExpression(node: SubhutiCst): void {
        this.visitChildren(node)
    }

    // ============================================
    // 注解
    // ============================================

    private printAnnotation(node: SubhutiCst): void {
        this.emit('@')
        for (const child of node.children || []) {
            if (child.value !== '@') {
                this.visit(child)
            }
        }
    }
}
