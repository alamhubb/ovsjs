package com.alamhubb.ovs.testovs

import com.intellij.codeInsight.editorActions.TypedHandlerDelegate
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.project.Project
import com.intellij.psi.PsiFile

class OvsTypedHandler : TypedHandlerDelegate() {
    override fun charTyped(c: Char, project: Project, editor: Editor, file: PsiFile): Result {
        val vFile = file.virtualFile ?: return Result.CONTINUE
        if (vFile.extension != "ovs") return Result.CONTINUE
        println("触发了:$c")
        if (!(c in 'a'..'z' || c in 'A'..'Z')) return Result.CONTINUE
        println("触发了1111：$c")
//        CompletionTrigger.trigger(project, editor)
        return Result.CONTINUE
    }
}