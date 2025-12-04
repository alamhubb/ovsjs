package com.alamhubb.ovs.testovs

import com.intellij.openapi.fileTypes.LanguageFileType
import javax.swing.Icon

object OvsFileType : LanguageFileType(OvsLanguage.INSTANCE) {
    override fun getName(): String = "Ovs File"

    override fun getDescription(): String = "Ovs language file"

    override fun getDefaultExtension(): String = "ovs"

    override fun getIcon(): Icon = OvsIcons.FILE
}