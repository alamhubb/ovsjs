plugins {
    kotlin("jvm") version "2.2.20"
    id("org.jetbrains.intellij.platform") version "2.10.2"
    id("org.jetbrains.grammarkit") version "2022.3.2.2"  // ← 添加 JFlex 支持
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    gradlePluginPortal()
    mavenCentral()

    intellijPlatform {
        defaultRepositories()
    }
}


dependencies {
    testImplementation(kotlin("test"))
    // https://mvnrepository.com/artifact/com.jetbrains.intellij.platform/ide-util-io
//    runtimeOnly("com.intellij.platform:ide-util-io:242.23726.103")

    intellijPlatform {
        intellijIdeaUltimate("2025.2.1")
        bundledPlugins("JavaScript")
    }
}

intellijPlatform {
    buildSearchableOptions = false
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(21)
}

// ========== JFlex 配置 ==========

sourceSets {
    main {
        java.srcDirs("src/main/gen")  // 添加生成代码目录
    }
}

tasks {
    runIde {
        jvmArgs("-Dfile.encoding=UTF-8")
        jvmArgs("-Dstdout.encoding=UTF-8")
        jvmArgs("-Dstderr.encoding=UTF-8")
    }
    generateLexer {
        sourceFile.set(file("src/main/grammar/Es6.flex"))
        targetOutputDir.set(file("src/main/gen/com/alamhubb/ovs/testovs/lexer"))
        purgeOldFiles.set(true)
    }
    
    // 确保编译前生成 Lexer
    compileKotlin {
        dependsOn(generateLexer)
    }
}
