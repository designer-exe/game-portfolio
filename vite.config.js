import restart from 'vite-plugin-restart'
import glsl from 'vite-plugin-glsl'
import { loadEnv } from 'vite'
import { handleGeminiRequest } from './src/server/geminiHandler.js'

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
        sourcemap: true // Add sourcemap
    },
    plugins:
    [
        glsl(), // Support GLSL files
        restart({ restart: [ '../static/**', ] }), // Restart server on static file change
        geminiApiPlugin()
    ],
}