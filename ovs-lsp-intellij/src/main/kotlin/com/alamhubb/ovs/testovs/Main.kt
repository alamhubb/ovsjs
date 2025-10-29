interface Printer {
    var name: String
    fun print()
}

object ConsolePrinter : Printer {
    override var name = "console"
    override fun print() {
        println("Printing to $name")
    }
}

// 使用委托
object Document : Printer by ConsolePrinter {
    fun install() {
        println("Installing $name")
    }
}

fun main() {
    Document.install()  // 输出: Installing console
    Document.name = "Document"
    Document.print()    // 输出: Printing to Document

    ConsolePrinter.print() // 输出: Printing to Document
}