# 快速技术演示 - 浏览器 Linux 容器

## 方案一：使用 v86（最快上手，开源）

### 1. 基础 HTML 演示

```html
<!DOCTYPE html>
<html>
<head>
    <title>Browser Linux Container Demo</title>
</head>
<body>
    <h1>Browser Linux Demo</h1>
    <div id="screen_container">
        <canvas id="screen"></canvas>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/v86@latest/build/libv86.js"></script>
    <script>
        window.onload = function() {
            var emulator = new V86Starter({
                screen_container: document.getElementById("screen_container"),
                bios: {
                    url: "https://k.copy.sh/v86/bios/seabios.bin",
                },
                vga_bios: {
                    url: "https://k.copy.sh/v86/bios/vgabios.bin",
                },
                cdrom: {
                    url: "https://k.copy.sh/v86/images/linux4.iso",
                },
                autostart: true,
            });
        }
    </script>
</body>
</html>
```

## 方案二：使用 Pyodide（Python in Browser）

### 2. Python 运行时演示

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
</head>
<body>
    <h1>Python in Browser</h1>
    <textarea id="code" rows="10" cols="50">
print("Hello from Python!")
import sys
print(f"Python version: {sys.version}")
    </textarea>
    <br>
    <button onclick="runPython()">Run Python</button>
    <pre id="output"></pre>

    <script>
        let pyodide;
        
        async function loadPyodide() {
            pyodide = await loadPyodide();
            console.log("Pyodide loaded!");
        }
        
        async function runPython() {
            if (!pyodide) {
                await loadPyodide();
            }
            
            const code = document.getElementById('code').value;
            try {
                const result = await pyodide.runPythonAsync(code);
                document.getElementById('output').textContent = result;
            } catch (err) {
                document.getElementById('output').textContent = err;
            }
        }
        
        loadPyodide();
    </script>
</body>
</html>
```

## 方案三：完整的 IDE 架构（React + Monaco + xterm.js）

### 3. 项目结构

```
browser-linux-ide/
├── package.json
├── src/
│   ├── components/
│   │   ├── Editor.tsx          # Monaco 编辑器
│   │   ├── Terminal.tsx        # xterm.js 终端
│   │   ├── FileExplorer.tsx    # 文件管理器
│   │   └── IDE.tsx             # 主界面
│   ├── core/
│   │   ├── VirtualMachine.ts   # VM 抽象层
│   │   ├── FileSystem.ts       # 文件系统
│   │   └── ProcessManager.ts   # 进程管理
│   ├── runtime/
│   │   ├── V86Runtime.ts       # v86 集成
│   │   ├── PyodideRuntime.ts   # Python 运行时
│   │   └── WasmRuntime.ts      # 通用 WASM 运行时
│   └── App.tsx
└── public/
    └── workers/
        └── vm.worker.ts        # Web Worker 中运行 VM
```

### 4. 核心代码示例

#### FileSystem.ts - 浏览器文件系统抽象

```typescript
// src/core/FileSystem.ts

export class BrowserFileSystem {
    private root: FileSystemDirectoryHandle | null = null;
    private cache = new Map<string, Uint8Array>();

    async init() {
        // 使用 OPFS (Origin Private File System)
        this.root = await navigator.storage.getDirectory();
    }

    async readFile(path: string): Promise<Uint8Array> {
        if (this.cache.has(path)) {
            return this.cache.get(path)!;
        }

        const file = await this.getFileHandle(path);
        const fileHandle = await file.getFile();
        const buffer = await fileHandle.arrayBuffer();
        const data = new Uint8Array(buffer);
        
        this.cache.set(path, data);
        return data;
    }

    async writeFile(path: string, data: Uint8Array): Promise<void> {
        const file = await this.getFileHandle(path, true);
        const writable = await file.createWritable();
        await writable.write(data);
        await writable.close();
        
        this.cache.set(path, data);
    }

    async listDir(path: string): Promise<string[]> {
        const dir = await this.getDirHandle(path);
        const entries: string[] = [];
        
        for await (const [name, handle] of dir.entries()) {
            entries.push(name);
        }
        
        return entries;
    }

    private async getFileHandle(
        path: string, 
        create = false
    ): Promise<FileSystemFileHandle> {
        const parts = path.split('/').filter(p => p);
        let current = this.root!;
        
        for (let i = 0; i < parts.length - 1; i++) {
            current = await current.getDirectoryHandle(parts[i], { create });
        }
        
        return await current.getFileHandle(parts[parts.length - 1], { create });
    }

    private async getDirHandle(path: string): Promise<FileSystemDirectoryHandle> {
        const parts = path.split('/').filter(p => p);
        let current = this.root!;
        
        for (const part of parts) {
            current = await current.getDirectoryHandle(part);
        }
        
        return current;
    }
}
```

#### VirtualMachine.ts - VM 抽象层

```typescript
// src/core/VirtualMachine.ts

export interface Runtime {
    start(): Promise<void>;
    stop(): Promise<void>;
    execute(code: string, language: string): Promise<ExecutionResult>;
    sendInput(input: string): Promise<void>;
    onOutput(callback: (output: string) => void): void;
}

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    duration: number;
}

export class VirtualMachine {
    private runtime: Runtime;
    private fs: BrowserFileSystem;

    constructor(runtimeType: 'v86' | 'wasm') {
        this.fs = new BrowserFileSystem();
        
        if (runtimeType === 'v86') {
            this.runtime = new V86Runtime(this.fs);
        } else {
            this.runtime = new WasmRuntime(this.fs);
        }
    }

    async init() {
        await this.fs.init();
        await this.runtime.start();
    }

    async runCode(code: string, language: string): Promise<ExecutionResult> {
        // 将代码写入临时文件
        const filename = `temp.${this.getExtension(language)}`;
        const encoder = new TextEncoder();
        await this.fs.writeFile(filename, encoder.encode(code));

        // 执行代码
        return await this.runtime.execute(code, language);
    }

    private getExtension(language: string): string {
        const extensions: Record<string, string> = {
            'python': 'py',
            'javascript': 'js',
            'typescript': 'ts',
            'rust': 'rs',
            'go': 'go',
        };
        return extensions[language] || 'txt';
    }
}
```

#### PyodideRuntime.ts - Python 运行时

```typescript
// src/runtime/PyodideRuntime.ts

export class PyodideRuntime implements Runtime {
    private pyodide: any;
    private outputCallbacks: ((output: string) => void)[] = [];

    async start() {
        // @ts-ignore
        this.pyodide = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });

        // 重定向 stdout
        await this.pyodide.runPythonAsync(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()
            sys.stderr = StringIO()
        `);
    }

    async stop() {
        // Pyodide 没有显式的 stop 方法
    }

    async execute(code: string, language: string): Promise<ExecutionResult> {
        if (language !== 'python') {
            throw new Error(`Unsupported language: ${language}`);
        }

        const startTime = performance.now();
        let stdout = '';
        let stderr = '';
        let exitCode = 0;

        try {
            await this.pyodide.runPythonAsync(code);
            
            // 获取输出
            stdout = await this.pyodide.runPythonAsync('sys.stdout.getvalue()');
            stderr = await this.pyodide.runPythonAsync('sys.stderr.getvalue()');
            
            // 清空缓冲区
            await this.pyodide.runPythonAsync(`
                sys.stdout = StringIO()
                sys.stderr = StringIO()
            `);
        } catch (error) {
            stderr = String(error);
            exitCode = 1;
        }

        const duration = performance.now() - startTime;

        // 触发输出回调
        if (stdout) this.notifyOutput(stdout);
        if (stderr) this.notifyOutput(stderr);

        return { stdout, stderr, exitCode, duration };
    }

    async sendInput(input: string) {
        // Pyodide 不支持交互式输入
        throw new Error('Interactive input not supported in Pyodide');
    }

    onOutput(callback: (output: string) => void) {
        this.outputCallbacks.push(callback);
    }

    private notifyOutput(output: string) {
        this.outputCallbacks.forEach(cb => cb(output));
    }
}
```

#### IDE.tsx - 主界面组件

```typescript
// src/components/IDE.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from './Editor';
import { Terminal } from './Terminal';
import { FileExplorer } from './FileExplorer';
import { VirtualMachine } from '../core/VirtualMachine';

export const IDE: React.FC = () => {
    const [code, setCode] = useState('print("Hello, World!")');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const vmRef = useRef<VirtualMachine | null>(null);

    useEffect(() => {
        const initVM = async () => {
            const vm = new VirtualMachine('wasm');
            await vm.init();
            vmRef.current = vm;
        };
        
        initVM();
    }, []);

    const runCode = async () => {
        if (!vmRef.current) return;
        
        setIsRunning(true);
        setOutput('Running...\n');
        
        try {
            const result = await vmRef.current.runCode(code, language);
            setOutput(result.stdout + result.stderr);
        } catch (error) {
            setOutput(`Error: ${error}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="ide-container">
            <div className="sidebar">
                <FileExplorer />
            </div>
            
            <div className="main-content">
                <div className="toolbar">
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                    </select>
                    
                    <button 
                        onClick={runCode} 
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                </div>
                
                <div className="editor-container">
                    <Editor 
                        value={code}
                        language={language}
                        onChange={setCode}
                    />
                </div>
                
                <div className="output-container">
                    <Terminal output={output} />
                </div>
            </div>
        </div>
    );
};
```

### 5. package.json

```json
{
  "name": "browser-linux-ide",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@monaco-editor/react": "^4.6.0",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0",
    "pyodide": "^0.24.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 立即开始

### 选项 1: 快速原型（推荐）

```bash
# 1. 创建新项目
npm create vite@latest browser-ide -- --template react-ts

# 2. 安装依赖
cd browser-ide
npm install @monaco-editor/react xterm xterm-addon-fit

# 3. 添加 Pyodide
npm install pyodide

# 4. 开始开发
npm run dev
```

### 选项 2: 完整的 v86 Linux 环境

```bash
# 克隆 v86 示例
git clone https://github.com/copy/v86.git
cd v86
npm install
npm run build

# 启动演示
npm run serve
```

## 性能优化技巧

1. **使用 Web Worker**
   - 在后台线程运行 VM
   - 避免阻塞主线程

2. **懒加载**
   - 按需加载语言运行时
   - 使用 dynamic import

3. **缓存**
   - 缓存编译结果
   - 使用 Service Worker 缓存资源

4. **增量加载**
   - 分块加载 Linux 镜像
   - 使用流式加载

## 下一步

1. 从方案二（Pyodide）开始，快速搭建原型
2. 添加更多语言支持（Node.js, Ruby, PHP）
3. 集成 v86 实现完整的 Linux 环境
4. 添加协作功能

祝你构建成功！🚀

