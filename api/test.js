export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Diagnostic endpoint to check environment
    const apiKey = process.env.GEMINI_API_KEY;

    return res.status(200).json({
        status: 'API is working! ✅',
        method: req.method,
        path: req.url,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : '❌ MISSING',
        environment: process.env.VERCEL_ENV || 'development',
        region: process.env.VERCEL_REGION || 'unknown',
        timestamp: new Date().toISOString(),
        message: apiKey
            ? '✅ Everything looks good! Your API key is configured.'
            : '❌ API key missing! Add GEMINI_API_KEY in Vercel dashboard and redeploy.'
    });
}