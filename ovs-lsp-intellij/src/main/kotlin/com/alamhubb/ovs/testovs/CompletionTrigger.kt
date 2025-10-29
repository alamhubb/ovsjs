package com.alamhubb.ovs.testovs

import com.intellij.codeInsight.completion.CodeCompletionHandlerBase
import com.intellij.codeInsight.completion.CompletionType
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.application.ModalityState
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.project.Project
import com.intellij.util.concurrency.AppExecutorUtil
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

object CompletionTrigger {
    private val executor = AppExecutorUtil.getAppScheduledExecutorService()
    private val pendingTasks = ConcurrentHashMap<Editor, ScheduledFuture<*>>()
    private val delayMs = 80L

    fun trigger(project: Project, editor: Editor) {
        val future = executor.schedule({
            ApplicationManager.getApplication().invokeLater({
                // 如需智能补全（等效 Ctrl+Shift+Space）
                CodeCompletionHandlerBase(CompletionType.BASIC).invokeCompletion(project, editor)
            }, ModalityState.any())
        }, delayMs, TimeUnit.MILLISECONDS)
        pendingTasks[editor] = future
    }
}