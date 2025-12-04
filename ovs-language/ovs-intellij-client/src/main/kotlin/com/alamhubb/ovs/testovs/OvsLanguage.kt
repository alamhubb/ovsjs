package com.alamhubb.ovs.testovs

import com.intellij.lang.Language

class OvsLanguage private constructor() : Language("ovs") {

    companion object {
        val INSTANCE = OvsLanguage()
    }
}