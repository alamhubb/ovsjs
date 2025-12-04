import * as ts from "typescript";

const fileName = "example.ts";
const fileContent = `
const user = { name: "Kai", age: 25 };
le`;

const files: Record<string, { version: number; content: string }> = {
  [fileName]: { version: 0, content: fileContent }
};

const host: ts.LanguageServiceHost = {
  getScriptFileNames: () => [fileName],
  getScriptVersion: (fileName) => files[fileName]?.version.toString() || "0",
  getScriptSnapshot: (fileName) => {
    const f = files[fileName];
    if (f) return ts.ScriptSnapshot.fromString(f.content);
    return undefined;
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => ({ allowJs: true, strict: true }),
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),

  // 必须实现这两个方法
  fileExists: (fileName) => !!files[fileName],
  readFile: (fileName) => files[fileName]?.content || ""
};

const languageService = ts.createLanguageService(host);
const position = fileContent.length;

const completions = languageService.getCompletionsAtPosition(fileName, position, {});

console.log("智能提示结果：", completions?.entries.map(e => e.name));
