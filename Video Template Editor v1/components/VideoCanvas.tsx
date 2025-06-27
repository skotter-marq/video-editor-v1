import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, X } from 'lucide-react';
import { ProjectSize, VideoAsset } from '../types/video';
import { Button } from './ui/button';
import { ProjectSizeSelector } from './ProjectSizeSelector';

interface VideoCanvasProps {
  projectSize: ProjectSize;
  currentVideo: VideoAsset | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onVideoReady: (duration: number) => void;
  onProjectSizeChange: (size: ProjectSize) => void;
}

export function VideoCanvas({
  projectSize,
  currentVideo,
  isPlaying,
  onPlayPause,
  currentTime,
  onTimeUpdate,
  onVideoReady,
  onProjectSizeChange
}: VideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  // Calculate canvas size based on project dimensions, not video dimensions
  const calculateCanvasSize = () => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Available space (with some padding)
    const availableWidth = containerRect.width - 32; // 16px padding on each side
    const availableHeight = containerRect.height - 120; // Reserve space for controls
    
    // Project aspect ratio (this is what determines canvas size)
    const projectAspectRatio = projectSize.width / projectSize.height;
    
    // Calculate dimensions that fit within available space while maintaining project aspect ratio
    let canvasWidth = availableWidth;
    let canvasHeight = availableWidth / projectAspectRatio;
    
    // If height exceeds available space, scale based on height instead
    if (canvasHeight > availableHeight) {
      canvasHeight = availableHeight;
      canvasWidth = availableHeight * projectAspectRatio;
    }
    
    // Ensure minimum size
    const minSize = 200;
    if (canvasWidth < minSize || canvasHeight < minSize) {
      if (projectAspectRatio > 1) {
        // Landscape
        canvasWidth = minSize;
        canvasHeight = minSize / projectAspectRatio;
      } else {
        // Portrait or square
        canvasHeight = minSize;
        canvasWidth = minSize * projectAspectRatio;
      }
    }
    
    setCanvasDimensions({ 
      width: Math.round(canvasWidth), 
      height: Math.round(canvasHeight) 
    });
  };

  // Handle video metadata loaded to get natural dimensions
  const handleVideoLoadedMetadata = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    setVideoDimensions({
      width: video.videoWidth,
      height: video.videoHeight
    });
    
    onVideoReady(video.duration);
    setVideoError(null);
  };

  // Update canvas size when project size or container size changes
  useEffect(() => {
    calculateCanvasSize();
  }, [projectSize]); // Dependency on projectSize, not videoDimensions

  // Add resize observer to recalculate on container size changes
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      calculateCanvasSize();
    });

    resizeObserver.observe(canvasContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [projectSize]); // Dependency on projectSize

  // Handle video playback
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    if (isPlaying) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Handle time updates
  useEffect(() => {
    if (!videoRef.current || !currentVideo) return;

    const video = videoRef.current;
    const targetTime = currentVideo.position.startTime + currentTime;
    
    if (Math.abs(video.currentTime - targetTime) > 0.1) {
      video.currentTime = targetTime;
    }
  }, [currentTime, currentVideo]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current || !currentVideo) return;
    
    const video = videoRef.current;
    const relativeTime = video.currentTime - currentVideo.position.startTime;
    
    // Ensure we stay within the trimmed clip bounds
    if (video.currentTime >= currentVideo.position.endTime) {
      video.currentTime = currentVideo.position.endTime;
      video.pause();
    } else if (video.currentTime < currentVideo.position.startTime) {
      video.currentTime = currentVideo.position.startTime;
    }
    
    onTimeUpdate(Math.max(0, relativeTime));
  };

  const handleVideoError = () => {
    setVideoError('Failed to load video');
    console.error('Video loading error');
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoRef.current?.requestFullscreen) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Calculate how the video should fit within the project canvas
  const getVideoFitStyle = () => {
    if (!videoDimensions) return {};

    const projectAspectRatio = projectSize.width / projectSize.height;
    const videoAspectRatio = videoDimensions.width / videoDimensions.height;

    // Determine if we need letterboxing (black bars) or cropping
    let objectFit: 'contain' | 'cover' = 'contain'; // Default to letterbox/pillarbox
    
    // You could make this configurable in the future
    // For now, we'll use 'contain' to show the full video with letterboxing if needed
    
    return {
      objectFit,
      transform: `
        translate(${currentVideo?.transform?.x || 0}px, ${currentVideo?.transform?.y || 0}px)
        scale(${currentVideo?.transform?.scale || 1})
        rotate(${currentVideo?.transform?.rotation || 0}deg)
      `,
      opacity: currentVideo?.transform?.opacity || 1,
      filter: `
        brightness(${1 + (currentVideo?.effects?.brightness || 0)})
        contrast(${1 + (currentVideo?.effects?.contrast || 0)})
        saturate(${1 + (currentVideo?.effects?.saturation || 0)})
        hue-rotate(${currentVideo?.effects?.hue || 0}deg)
      `
    };
  };

  // Use project dimensions for aspect ratio calculation
  const projectAspectRatio = projectSize.width / projectSize.height;

  return (
    <div className="h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
      {/* Canvas Header - Simplified */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-medium">Canvas Preview</h3>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasContainerRef}
        className="flex-1 relative overflow-hidden bg-muted/20 flex items-center justify-center p-4"
      >
        {/* Floating Project Size Selector */}
        <div className="absolute top-4 right-4 z-20">
          <ProjectSizeSelector
            currentSize={projectSize}
            onSizeChange={onProjectSizeChange}
          />
        </div>

        {currentVideo ? (
          <div className="relative">
            {/* Project-Sized Canvas Container */}
            <div
              className="relative bg-black rounded-lg overflow-hidden shadow-lg"
              style={{
                width: `${canvasDimensions.width || projectSize.width}px`,
                height: `${canvasDimensions.height || projectSize.height}px`,
                aspectRatio: projectAspectRatio
              }}
            >
              {/* Video Element */}
              <video
                ref={videoRef}
                src={currentVideo.url}
                className="w-full h-full"
                onLoadedMetadata={handleVideoLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onError={handleVideoError}
                muted={isMuted}
                style={getVideoFitStyle()}
              />

              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onPlayPause}
                  className="bg-white/90 hover:bg-white text-black"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
              </div>

              {/* Corner Controls */}
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleMute}
                  className="bg-black/70 hover:bg-black/90 text-white border-0"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="bg-black/70 hover:bg-black/90 text-white border-0"
                >
                  {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>

              {/* Error Overlay */}
              {videoError && (
                <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-destructive font-medium">Video Error</div>
                    <div className="text-sm text-destructive/80 mt-1">{videoError}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center">
            <div 
              className="mx-auto bg-muted rounded-lg flex items-center justify-center mb-4"
              style={{
                width: `${Math.min(canvasDimensions.width || 320, 320)}px`,
                height: `${Math.min(canvasDimensions.height || 180, 180)}px`,
                aspectRatio: projectAspectRatio
              }}
            >
              <Play className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No Video Selected</h3>
            <p className="text-muted-foreground">
              Upload a video or drag one from the library to start editing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}