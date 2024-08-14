"use server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    // Generate multiple TikTok video URLs using Gemini AI
    const result = await model.generateContent(`Generate 15 TikTok video URLs based on this prompt: ${prompt}`);
    const tiktokUrls = result.response.text().split('\n').filter(url => url.trim().startsWith('https://'));

    if (tiktokUrls.length === 0) {
      return NextResponse.json({ message: 'No valid TikTok URLs generated', videos: [] }, { status: 200 });
    }

    const videoUrls = await Promise.all(tiktokUrls.map(async (url) => {
      const rapidApiUrl = "https://tiktok-video-no-watermark2.p.rapidapi.com/";
      const querystring = { url, hd: "1" };
      const headers = {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "tiktok-video-no-watermark2.p.rapidapi.com"
      };

      try {
        const response = await axios.get(rapidApiUrl, { headers, params: querystring });

        if (response.status === 200 && response.data.hdplay) {
          return {
            original_url: url,
            hdplay_url: response.data.hdplay,
          };
        } else {
          return null;
        }
      } catch (error) {
        console.error(`Error fetching video for URL: ${url}`, error);
        return null;
      }
    }));

    const validVideos = videoUrls.filter(video => video !== null);

    if (validVideos.length === 0) {
      return NextResponse.json({ message: 'No valid videos found', videos: [] }, { status: 200 });
    }

    return NextResponse.json({ videos: validVideos }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/search-and-download:', error);
    return NextResponse.json({ error: 'An error occurred', details: error.message }, { status: 500 });
  }
}