"use client";

import { useState } from "react";
import Head from "next/head";
import ReactPlayer from "react-player";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [vidNumber, setVidNumber] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, novids: vidNumber }),
      });
      const data = await response.json();
      if (data.videos && data.videos.length > 0) {
        setVideos(data.videos);
      } else {
        setVideos([]);
        setMessage(data.message || "No videos found. Please try a different prompt.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Failed to get videos. Please try again.");
    }
    setLoading(false);
  };

  const handleDownload = (url) => {
    try {
      // Open the video URL in a new tab
      const newTab = window.open(url, '_blank');
      
      // Check if the new tab was successfully opened
      if (!newTab) {
        throw new Error('Failed to open the new tab.');
      }
      
      // Set a timeout to trigger the download after the new tab has loaded
      setTimeout(() => {
        // Create a temporary link to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.download = "video.mp4";  // Ensure a filename is set
        link.style.display = "none";
        
        // Append the link to the body
        document.body.appendChild(link);
        link.click();
        
        // Remove the link after triggering download
        link.remove();
      }, 500); // Adjust the timeout as needed

    } catch (error) {
      console.error("Error downloading video:", error);
      setMessage("Failed to download video. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>AI-Powered TikTok Video Downloader</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-2xl font-bold text-center my-4">
          TikTok Video Downloader
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <input
            type="text"
            value={prompt}
            style={{ color: "black" }}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to find TikTok videos"
            className="border p-2 mb-4 w-full max-w-lg"
            required
          />
          <span>
            <label>Enter number of vids needed (min 1, max 10)</label>{" "}
            <input
              type="number"
              value={vidNumber}
              style={{ color: "black" }}
              onChange={(e) => setVidNumber(Number(e.target.value))}
              className="border p-2 mb-4 w-full max-w-lg"
              min={1}
              max={10}
              required
            />
          </span>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search and Download"}
          </button>
        </form>

        {message && <p className="text-center mt-4">{message}</p>}

        <div className="video-list mt-8">
          {videos.length > 0 ? videos.map((video, index) => (
            <section key={index}>
              <div className="video-item my-4">
                <h2 className="text-xl font-semibold">Video {index + 1}:</h2>
                <div className="video-player my-4">
                  <ReactPlayer url={video.play} controls={true} width="100%" />
                </div>
                <p className="mt-2">
                  <button
                    onClick={() => handleDownload(video.play)}
                    className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer"
                  >
                    Download Video
                  </button>
                </p>
              </div>
            </section>
          )) : <h1>No results found</h1>}
        </div>
      </main>
    </div>
  );
}
