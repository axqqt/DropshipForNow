"use server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest as req , NextResponse as res } from 'next/server';
import axios from 'axios';

export async function POST(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    // Generate TikTok video URL using Gemini
    const result = await model.generateContent(`Generate a TikTok video URL based on this prompt: ${prompt}`);
    const tiktokUrl = result.response.text().trim();

    // Use RapidAPI to get the HD version of the video
    const rapidApiUrl = "https://tiktok-video-no-watermark2.p.rapidapi.com/";
    const querystring = { url: tiktokUrl, hd: "1" };
    const headers = {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "tiktok-video-no-watermark2.p.rapidapi.com"
    };

    const response = await axios.get(rapidApiUrl, { headers, params: querystring });

    if (response.status === 200) {
      const hdplay_url = response.data.hdplay || "No HD play URL found";
      res.status(200).json({ hdplay_url, original_url: tiktokUrl });
    } else {
      res.status(response.status).json({ error: "Failed to get response from API" });
    }
  } catch (error) {
    console.error('Error in /api/search-and-download:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
}