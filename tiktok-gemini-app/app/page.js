"use client";

import { useState } from 'react';
import Head from 'next/head'; // Import Head from Next.js
import axios from 'axios';
import ReactPlayer from 'react-player';
import VideoConverter from '../components/VideoConverter';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setVideo(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get video. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>AI-Powered TikTok Video Downloader</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-2xl font-bold text-center my-4">AI-Powered TikTok Video Downloader</h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to find a TikTok video"
            className="border p-2 mb-4 w-full max-w-lg"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search and Download'}
          </button>
        </form>

        {video && (
          <div className="result mt-8">
            <h2 className="text-xl font-semibold">Result:</h2>
            <p className="mt-2">Original URL: <a href={video.original_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{video.original_url}</a></p>
            <p className="mt-2">HD Video URL: <a href={video.hdplay_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{video.hdplay_url}</a></p>
          </div>
        )}
      </main>
    </div>
  );
}
