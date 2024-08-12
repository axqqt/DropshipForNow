"use server";

import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    // Generate search terms using Gemini
    const result = await model.generateContent(prompt);
    const searchTerms = result.response.text();

    // Search TikTok using generated terms
    const tiktokResponse = await axios.get(`https://api2.musical.ly/aweme/v1/search/item/?keyword=${encodeURIComponent(searchTerms)}`, {
      headers: {
        'X-API-KEY': process.env.TIKTOK_API_KEY,
      },
    });

    // Extract video URLs from TikTok response
    const videoUrls = tiktokResponse.data.items.map(item => item.video.download_addr.url_list[0]);

    return NextResponse.json({ videoUrls });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}