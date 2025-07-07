import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProjectSize, VideoAsset, SceneLayer } from '../types/video';
import { getVideoAnimationStyles, getAnimationKey } from './VideoAnimations';

interface VideoCanvasAnimatedProps {
  projectSize: ProjectSize;
  currentVideo: VideoAsset | null;
  isPlaying: boolean;
  currentTime: number;
  containerDimensions: { width: number; height: number };
}

export function VideoCanvasAnimated({
  projectSize,
  currentVideo,
  isPlaying,
  currentTime,
  containerDimensions
}: VideoCanvasAnimatedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationKey, setAnimationKey] = useState<string>('');

  // Update animation key when video animations change
  useEffect(() => {
    const newKey = getAnimationKey(currentVideo);
    setAnimationKey(newKey);
  }, [currentVideo?.animations]);

  // Apply video filters from adjustments
  const createVideoFilter = (adjustments?: any) => {
    if (!adjustments) return 'none';
    
    const filters: string[] = [];
    
    if (adjustments.brightness !== undefined) {
      filters.push(`brightness(${adjustments.brightness / 100})`);
    }
    if (adjustments.contrast !== undefined) {
      filters.push(`contrast(${adjustments.contrast / 100})`);
    }
    if (adjustments.exposure !== undefined) {
      // Exposure as brightness adjustment
      filters.push(`brightness(${(100 + adjustments.exposure) / 100})`);
    }
    if (adjustments.hue !== undefined) {
      filters.push(`hue-rotate(${adjustments.hue}deg)`);
    }
    if (adjustments.saturation !== undefined) {
      filters.push(`saturate(${adjustments.saturation / 100})`);
    }
    if (adjustments.blur !== undefined && adjustments.blur > 0) {
      filters.push(`blur(${adjustments.blur}px)`);
    }
    
    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  // Get animation styles for the video container
  const animationStyles = getVideoAnimationStyles(currentVideo);

  // Update video time
  useEffect(() => {
    if (videoRef.current && currentVideo) {
      const video = videoRef.current;
      if (Math.abs(video.currentTime - currentTime) > 0.1) {
        video.currentTime = currentTime;
      }
    }
  }, [currentTime, currentVideo]);

  // Handle play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  if (!currentVideo || !currentVideo.url) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500">No video selected</div>
      </div>
    );
  }

  const videoFilter = createVideoFilter(currentVideo.adjustments);
  
  // Calculate video dimensions and positioning
  const transform = currentVideo.transform || { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };
  const scaleX = containerDimensions.width / projectSize.width;
  const scaleY = containerDimensions.height / projectSize.height;
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: '#000000'
      }}
    >
      <div
        key={animationKey} // Force re-render when animations change
        className="absolute inset-0 flex items-center justify-center"
        style={{
          ...animationStyles,
          transform: `
            translate(${transform.x * scaleX}px, ${transform.y * scaleY}px) 
            scale(${transform.scale}) 
            rotate(${transform.rotation}deg)
          `,
          opacity: transform.opacity,
          transformOrigin: 'center center'
        }}
      >
        <video
          ref={videoRef}
          src={currentVideo.url}
          className="max-w-full max-h-full object-contain"
          style={{
            filter: videoFilter,
            transform: `
              ${currentVideo.effects?.flipHorizontal ? 'scaleX(-1)' : ''} 
              ${currentVideo.effects?.flipVertical ? 'scaleY(-1)' : ''}
            `,
            borderRadius: currentVideo.effects?.roundCorners 
              ? `${currentVideo.effects?.cornerRadius?.topLeft || 0}px ${currentVideo.effects?.cornerRadius?.topRight || 0}px ${currentVideo.effects?.cornerRadius?.bottomRight || 0}px ${currentVideo.effects?.cornerRadius?.bottomLeft || 0}px`
              : '0'
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = currentTime;
            }
          }}
          loop={false}
          muted
          playsInline
        />
      </div>
    </div>
  );
}