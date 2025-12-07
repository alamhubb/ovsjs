/**
 * OVS SSR 开发服务器
 * 
 * 使用 Express + Vite 中间件实现 SSR 开发模式
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

async function createServer() {
    const app = express()

    let vite
    if (!isProduction) {
        // 开发模式：使用 Vite 中间件
        vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'custom'
        })
        app.use(vite.middlewares)
    } else {
        // 生产模式：静态文件服务
        app.use(express.static(path.resolve(__dirname, 'dist/client')))
    }

    app.use('*', async (req, res, next) => {
        const url = req.originalUrl

        try {
            let template, render

            if (!isProduction) {
                // 开发模式：读取并转换 HTML
                template = fs.readFileSync(
                    path.resolve(__dirname, 'index.html'),
                    'utf-8'
                )
                template = await vite.transformIndexHtml(url, template)

                // 加载服务端入口
                const { render: ssrRender } = await vite.ssrLoadModule('/src/entry-server.ts')
                render = ssrRender
            } else {
                // 生产模式：使用构建后的文件
                template = fs.readFileSync(
                    path.resolve(__dirname, 'dist/client/index.html'),
                    'utf-8'
                )
                const { render: ssrRender } = await import('./dist/server/entry-server.js')
                render = ssrRender
            }

            // 渲染 Vue 组件为 HTML
            const { html: appHtml } = await render()

            // 替换占位符
            const html = template.replace('<!--ssr-outlet-->', appHtml)

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
        } catch (e) {
            if (!isProduction && vite) {
                vite.ssrFixStacktrace(e)
            }
            console.error(e)
            next(e)
        }
    })

    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`\n  🚀 OVS SSR Server running at:`)
        console.log(`     http://localhost:${port}`)
        console.log(`\n  Mode: ${isProduction ? 'Production' : 'Development'}\n`)
    })
}

createServer()

