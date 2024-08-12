"use server";

import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export default async function handler(req, res) {
  const { prompt } = req.body;

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

    res.status(200).json({ videoUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}