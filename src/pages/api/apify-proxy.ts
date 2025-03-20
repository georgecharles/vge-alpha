import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * This API route acts as a proxy for Apify API requests to avoid CORS issues.
 * Instead of the frontend calling Apify directly, it calls this endpoint, which then
 * forwards the request to Apify and returns the response.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { originalEndpoint, originalMethod, originalBody } = req.body;

    if (!originalEndpoint) {
      return res.status(400).json({ error: 'Missing originalEndpoint parameter' });
    }

    // Get the Apify API key from environment variables
    const apifyApiKey = process.env.VITE_APIFY_API_KEY || process.env.NEXT_PUBLIC_APIFY_API_KEY;
    
    if (!apifyApiKey) {
      return res.status(500).json({ error: 'Apify API key not configured on the server' });
    }

    // Prepare the request to Apify
    const fetchOptions: RequestInit = {
      method: originalMethod || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apifyApiKey}`
      },
      body: originalBody ? JSON.stringify(originalBody) : undefined
    };

    console.log(`Proxy forwarding request to: ${originalEndpoint}`);
    
    // Make the request to Apify
    const apifyResponse = await fetch(originalEndpoint, fetchOptions);
    
    // Get the response data
    const responseData = await apifyResponse.json();
    
    // Return the Apify response to the client
    return res.status(apifyResponse.status).json(responseData);
  } catch (error) {
    console.error('Error in Apify proxy:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy request to Apify',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 