const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  throw new Error('RAPIDAPI_KEY is missing');
}

export async function POST(request) {
  try {
    const { prompt, novids } = await request.json();
    if (!prompt || prompt.length === 0) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }
    
    // Validate `novids`
    if (!Number.isInteger(novids) || novids < 1 || novids > 10) {
      return new Response(JSON.stringify({ error: 'Number of videos should be between 1 and 10' }), { status: 400 });
    }

    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://tiktok-video-no-watermark2.p.rapidapi.com/feed/search?keywords=${encodedPrompt}&count=${novids}&cursor=0&region=US&publish_time=0&sort_type`;

    const scraperRequest = new Request(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'tiktok-video-no-watermark2.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    const scraperResponse = await fetch(scraperRequest);

    // Check for HTTP errors
    if (!scraperResponse.ok) {
      const errorText = await scraperResponse.text();
      console.error('API error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to fetch data from the API' }), { status: scraperResponse.status });
    }

    const { code, data } = await scraperResponse.json();

    if (code !== 0) {
      console.log('Error in scraper API:', data);
      return new Response(JSON.stringify({ error: 'An error occurred in the scraper API' }), { status: 500 });
    }

    const videos = data?.videos || [];
    if (videos.length === 0) {
      return new Response(JSON.stringify({ message: 'No videos found', videos: [] }), { status: 200 });
    }

    return new Response(JSON.stringify({ videos }), { status: 200 });
  } catch (error) {
    console.error('Error in /api/search:', error);
    return new Response(JSON.stringify({ error: 'An error occurred', details: error.message }), { status: 500 });
  }
}
