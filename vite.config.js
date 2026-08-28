import fs from 'fs'
import { resolve } from 'path'
import restart from 'vite-plugin-restart'
import glsl from 'vite-plugin-glsl'
import { loadEnv } from 'vite'
import { handleGeminiRequest } from './src/server/geminiHandler.js'

function musicStaticPlugin()
{
    return {
        name: 'vite-plugin-music-static',
        configureServer(server)
        {
            server.middlewares.use((req, res, next) =>
            {
                const pathname = (req.url || '').split('?')[0]
                if(pathname.startsWith('/music/'))
                {
                    const filename = decodeURIComponent(pathname.replace(/^\/music\//, ''))
                    const filePath = resolve(process.cwd(), 'public/music', filename)
                    if(fs.existsSync(filePath) && fs.statSync(filePath).isFile())
                    {
                        res.setHeader('Content-Type', 'audio/mpeg')
                        res.setHeader('Accept-Ranges', 'bytes')
                        const stream = fs.createReadStream(filePath)
                        stream.pipe(res)
                        return
                    }
                }
                else if(pathname !== '/' && !pathname.startsWith('/@') && !pathname.startsWith('/src'))
                {
                    const decoded = decodeURIComponent(pathname.replace(/^\//, ''))
                    const filePath = resolve(process.cwd(), 'public', decoded)
                    if(fs.existsSync(filePath) && fs.statSync(filePath).isFile())
                    {
                        const ext = decoded.split('.').pop().toLowerCase()
                        const mimes = { 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'webp': 'image/webp', 'svg': 'image/svg+xml' }
                        if(mimes[ext])
                        {
                            res.setHeader('Content-Type', mimes[ext])
                            const stream = fs.createReadStream(filePath)
                            stream.pipe(res)
                            return
                        }
                    }
                }
                next()
            })
        },
        closeBundle()
        {
            const srcDir = resolve(process.cwd(), 'public/music')
            const dstDir = resolve(process.cwd(), 'dist/music')
            if(fs.existsSync(srcDir))
            {
                fs.mkdirSync(dstDir, { recursive: true })
                const files = fs.readdirSync(srcDir)
                for(const f of files)
                {
                    const srcF = resolve(srcDir, f)
                    if(fs.statSync(srcF).isFile())
                    {
                        fs.copyFileSync(srcF, resolve(dstDir, f))
                    }
                }
            }
        }
    }
}

function adminRewritePlugin()
{
    return {
        name: 'vite-plugin-admin-rewrite',
        configureServer(server)
        {
            server.middlewares.use((req, res, next) =>
            {
                const pathname = (req.url || '').split('?')[0]
                if(pathname === '/admin/music' || pathname === '/admin/music/' || pathname === '/admin' || pathname === '/admin/')
                {
                    req.url = '/admin.html'
                }
                next()
            })
        }
    }
}

function geminiApiPlugin()
{
    return {
        name: 'vite-plugin-gemini-api',
        configureServer(server)
        {
            const env = loadEnv('development', process.cwd(), '')

            server.middlewares.use('/api/gemini', async (req, res) =>
            {
                if(req.method !== 'POST')
                {
                    res.statusCode = 405
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: 'Method not allowed' }))
                    return
                }

                let bodyRaw = ''
                req.on('data', chunk => { bodyRaw += chunk })
                req.on('end', async () =>
                {
                    try
                    {
                        const body = bodyRaw ? JSON.parse(bodyRaw) : {}
                        const result = await handleGeminiRequest(body, env)
                        res.statusCode = result.status
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify(result.data))
                    }
                    catch(err)
                    {
                        res.statusCode = 500
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({ error: err.message || 'Internal server error' }))
                    }
                })
            })
        }
    }
}

export default {
    root: 'src/', // Sources files (typically where index.html is)
    envDir: resolve(process.cwd()), // Load .env from project root
    publicDir: '../static/', // Path from "root" to static assets (files that are served as they are)
    server:
    {
        host: true, // Open to local network and display URL
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
    },
    build:
    {
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true, // Add sourcemap
        rollupOptions:
        {
            input:
            {
                main: resolve(process.cwd(), 'src/index.html'),
                admin: resolve(process.cwd(), 'src/admin.html'),
                adminMusic: resolve(process.cwd(), 'src/admin/music/index.html')
            }
        }
    },
    plugins:
    [
        glsl(), // Support GLSL files
        restart({ restart: [ '../static/**', ] }), // Restart server on static file change
        musicStaticPlugin(),
        adminRewritePlugin(),
        geminiApiPlugin()
    ],
}