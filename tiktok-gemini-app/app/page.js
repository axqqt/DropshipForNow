"use client";

import { useState } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import VideoConverter from '../components/VideoConverter';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

export default function Home() {
  const [loading,setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [videos, setVideos] = useState([]);
  const [convertedVideos, setConvertedVideos] = useState([]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/search', { prompt });
      setVideos(response.data.videoUrls);
    } catch (error) {
      console.error('Error searching videos:', error);
    }finally{
      setLoading(false)
    }
  };

  const handleConvert = (index, mp4Url) => {
    setConvertedVideos(prev => [...prev, { index, url: mp4Url }]);
  };

  const exportVideos = async () => {
    const zip = new JSZip();
    
    for (let i = 0; i < convertedVideos.length; i++) {
      const response = await fetch(convertedVideos[i].url);
      const blob = await response.blob();
      zip.file(`video${i + 1}.mp4`, blob);
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
      FileSaver.saveAs(content, 'converted_videos.zip');
    });
  };

  return (
    <div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
      />
      <button onClick={handleSearch}>Search</button>

      {videos.map((url, index) => (
        <div key={index}>
          <ReactPlayer url={url} controls width="300px" height="500px" />
          <VideoConverter url={url} onConvert={(mp4Url) => handleConvert(index, mp4Url)} />
        </div>
      ))}

      {convertedVideos.length > 0 && (
        <div>
          <h2>Converted Videos</h2>
          {convertedVideos.map((video, index) => (
            <ReactPlayer key={index} url={video.url} controls width="300px" height="500px" />
          ))}
          <button onClick={exportVideos}>Export Videos</button>
        </div>
      )}
    </div>
  );
}