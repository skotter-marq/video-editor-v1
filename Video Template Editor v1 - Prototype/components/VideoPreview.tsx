import React, { useRef, useEffect, useState } from 'react';
import { VideoAsset } from '../types/video';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VideoPreviewProps {
  video: VideoAsset;
  currentTime: number;
  width?: number;
  height?: number;
  className?: string;
}

export function VideoPreview({ 
  video, 
  currentTime, 
  width = 320, 
  height = 180,
  className = ""
}: VideoPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Set up video element
  useEffect(() => {
    if (!videoRef.current) return;
    
    const videoElement = videoRef.current;
    
    const handleLoadedData = () => {
      setIsVideoLoaded(true);
    };
    
    videoElement.addEventListener('loadeddata', handleLoadedData);
    
    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [video.url]);
  
  // Update video time and render to canvas
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isVideoLoaded) return;
    
    const videoElement = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set video time
    videoElement.currentTime = currentTime;
    
    // Wait for the video to seek to the correct time
    const handleSeeked = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply video transforms
      ctx.save();
      
      // Move to center for transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Apply video transformations
      if (video.transform) {
        ctx.scale(video.transform.scaleX || 1, video.transform.scaleY || 1);
        ctx.rotate((video.transform.rotation || 0) * Math.PI / 180);
        ctx.globalAlpha = video.transform.opacity || 1;
      }
      
      // Calculate video dimensions maintaining aspect ratio
      const videoAspectRatio = videoElement.videoWidth / videoElement.videoHeight;
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let renderWidth = canvas.width;
      let renderHeight = canvas.height;
      
      if (videoAspectRatio > canvasAspectRatio) {
        // Video is wider than canvas
        renderHeight = canvas.width / videoAspectRatio;
      } else {
        // Video is taller than canvas
        renderWidth = canvas.height * videoAspectRatio;
      }
      
      // Draw video centered
      ctx.drawImage(
        videoElement,
        -renderWidth / 2,
        -renderHeight / 2,
        renderWidth,
        renderHeight
      );
      
      ctx.restore();
    };
    
    videoElement.addEventListener('seeked', handleSeeked);
    
    // Trigger initial render
    if (videoElement.readyState >= 2) {
      handleSeeked();
    }
    
    return () => {
      videoElement.removeEventListener('seeked', handleSeeked);
    };
  }, [currentTime, video.transform, isVideoLoaded]);
  
  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Hidden video element for rendering */}
      <video
        ref={videoRef}
        src={video.url}
        className="hidden"
        muted
        playsInline
        crossOrigin="anonymous"
        preload="metadata"
      />
      
      {/* Canvas for rendering video frames */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain"
      />
      
      {/* Fallback thumbnail */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          {video.thumbnail ? (
            <ImageWithFallback
              src={video.thumbnail}
              alt={video.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white/50 text-center">
              <div className="text-sm">Loading preview...</div>
            </div>
          )}
        </div>
      )}
      


      {/* Video info overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-xs text-white bg-black/50 rounded px-2 py-1">
        <span>{video.name}</span>
        <span>{Math.round(currentTime * 100) / 100}s</span>
      </div>
    </div>
  );
}