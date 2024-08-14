import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const VideoProcessor = ({ videos }) => {
  const [ffmpeg, setFfmpeg] = useState(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('Loading ffmpeg-core.js');
  const [result, setResult] = useState('');

  useEffect(() => {
    const load = async () => {
      const ffmpegInstance = new FFmpeg();
      ffmpegInstance.on('log', ({ message }) => {
        console.log(message);
      });
      
      // Load ffmpeg.wasm-core script
      await ffmpegInstance.load();
      
      setFfmpeg(ffmpegInstance);
      setReady(true);
    };
    load();
  }, []);

  const processVideos = async () => {
    setMessage('Processing videos...');
    for (let i = 0; i < videos.length; i++) {
      await ffmpeg.writeFile(`video${i}.mp4`, await fetchFile(videos[i]));
    }

    // Concatenate videos and apply filters
    await ffmpeg.exec([
      '-i', `concat:${videos.map((_, i) => `video${i}.mp4`).join('|')}`,
      '-filter_complex', '[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]',
      '-map', '[v]', '-map', '[a]',
      '-t', '60',
      'output.mp4'
    ]);

    const data = await ffmpeg.readFile('output.mp4');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    setResult(url);
    setMessage('Processing complete!');
  };

  return ready ? (
    <div>
      <button onClick={processVideos}>Create Short Video</button>
      <p>{message}</p>
      {result && <video src={result} controls></video>}
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default VideoProcessor;