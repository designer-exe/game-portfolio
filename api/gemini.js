import { handleGeminiRequest } from '../src/server/geminiHandler.js'

/**
 * Vercel Serverless Function for Ani Gemini AI Chatbot
 * Handles POST requests to /api/gemini on Vercel production deployment.
 */
export default async function handler(req, res)
{
    // Enable CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    // Handle preflight OPTIONS request
    if(req.method === 'OPTIONS')
    {
        res.status(200).end()
        return
    }

    if(req.method !== 'POST')
    {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    try
    {
        let body = req.body
        if(typeof body === 'string')
        {
            try
            {
                body = JSON.parse(body)
            }
            catch(parseErr)
            {
                // keep body as string if not JSON
            }
        }
        body = body || {}

        const result = await handleGeminiRequest(body, process.env)
        res.status(result.status || 200).json(result.data)
    }
    catch(err)
    {
        console.error('Vercel Gemini Serverless Handler Error:', err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
