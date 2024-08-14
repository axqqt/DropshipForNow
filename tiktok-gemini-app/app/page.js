"use client";

import { useState } from 'react';
import Head from 'next/head'; // Import Head from Next.js
import axios from 'axios';
import ReactPlayer from 'react-player';

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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = video.hdplay_url;
    link.setAttribute('download', 'video.mp4');
    document.body.appendChild(link);
    link.click();
    link.remove();
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
            style={{ color: "black" }}
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
            <div className="video-player my-4">
              <ReactPlayer url={video.hdplay_url} controls={true} width="100%" />
            </div>
            <p className="mt-2">
              <a
                href={video.hdplay_url}
                onClick={handleDownload}
                className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer"
                download="video.mp4"
              >
                Download Video
              </a>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
