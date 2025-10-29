package com.alamhubb.ovs.testovs

import com.intellij.extapi.psi.PsiFileBase
import com.intellij.openapi.fileTypes.FileType
import com.intellij.psi.FileViewProvider
import javax.swing.Icon

class OvsFile(viewProvider: FileViewProvider) : PsiFileBase(viewProvider, OvsLanguage.INSTANCE) {
    override fun getFileType(): FileType {
        return OvsFileType
    }

    override fun toString(): String {
        return "Ovs File"
    }

    override fun getIcon(flags: Int): Icon? {
        return OvsIcons.FILE
    }
}