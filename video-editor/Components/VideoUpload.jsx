import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const VideoUpload = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'video/*',
    maxFiles: 10,
  });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the videos here ...</p>
      ) : (
        <p>Drag 'n' drop up to 10 videos here, or click to select videos</p>
      )}
    </div>
  );
};

export default VideoUpload;