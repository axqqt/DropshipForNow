"use client";

import { useState } from 'react';
import VideoUpload from '../components/VideoUpload';
import VideoProcessor from '../components/VideoProcessor';

export default function Home() {
  const [videos, setVideos] = useState([]);

  const handleUpload = (acceptedFiles) => {
    setVideos(acceptedFiles);
  };

  return (
    <div className="container">
      <h1>Auto Video Editor</h1>
      <VideoUpload onUpload={handleUpload} />
      {videos.length > 0 && <VideoProcessor videos={videos} />}
    </div>
  );
}