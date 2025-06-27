import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Play, Pause, SkipBack, SkipForward, Film, Clock, Music, Undo, Redo, Plus } from 'lucide-react';
import { VideoAsset } from '../types/video';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import exampleImage from 'figma:asset/ae2b08bad7dcd8ba507a64a297c9453642ba6215.png';

interface VideoTimelineProps {
  currentVideo: VideoAsset | null;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayPause: () => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onVideoUpdate?: (updates: Partial<VideoAsset>) => void;
  undoStack: any[];
  redoStack: any[];
  onUndo: () => void;
  onRedo: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
}

export function VideoTimeline({
  currentVideo,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayPause,
  zoomLevel,
  onZoomChange,
  onVideoUpdate,
  undoStack,
  redoStack,
  onUndo,
  onRedo,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave
}: VideoTimelineProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [trimState, setTrimState] = useState<{
    isActive: boolean;
    side: 'left' | 'right' | null;
    startX: number;
    originalStartTime: number;
    originalEndTime: number;
  } | null>(null);
  
  // Add drag state for moving clips
  const [clipDragState, setClipDragState] = useState<{
    isActive: boolean;
    startX: number;
    originalStartTime: number;
    originalEndTime: number;
  } | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Zoom control constants - 100% (1) is in the middle
  const ZOOM_MIN = 0.25;  // 25%
  const ZOOM_MAX = 1.75;  // 175%
  const ZOOM_STEP = 0.1;  // 10% increments

  // Get the original full duration of the video
  const getOriginalDuration = useCallback(() => {
    if (!currentVideo) return 0;
    // Use the stored duration property, or fall back to the current position duration
    return currentVideo.duration || (currentVideo.position.endTime - currentVideo.position.startTime);
  }, [currentVideo]);

  // Calculate timeline view duration - based on original full duration, not trimmed duration
  const getTimelineViewDuration = useCallback(() => {
    if (!currentVideo) return 60;
    
    const originalDuration = getOriginalDuration();
    
    // At zoom level 1, show the video at its full original duration
    // At higher zoom levels, show more detail (smaller timeline view)
    // At lower zoom levels, show more context (larger timeline view)
    const baseDuration = originalDuration;
    
    if (zoomLevel >= 1.5) return baseDuration / 1.5; // Zoom in: show less duration for more detail
    if (zoomLevel >= 1.25) return baseDuration / 1.25; // Medium zoom: show 4/5 duration
    if (zoomLevel >= 1) return baseDuration; // Normal zoom: show full duration
    if (zoomLevel >= 0.75) return baseDuration * 1.25; // Zoom out: show 1.25x duration
    if (zoomLevel >= 0.5) return baseDuration * 1.5; // More zoom out: show 1.5x duration
    return baseDuration * 2; // Maximum zoom out: show 2x duration for context
  }, [currentVideo, zoomLevel, getOriginalDuration]);

  // Calculate the timeline scroll width based on zoom and content
  const getTimelineScrollWidth = useCallback(() => {
    if (!currentVideo || !timelineRef.current) return 0;
    
    const timelineViewDuration = getTimelineViewDuration();
    const originalDuration = getOriginalDuration();
    const containerWidth = timelineRef.current.getBoundingClientRect().width;
    
    // Calculate minimum width needed to show the entire timeline at current zoom
    // At higher zoom levels, we need more width to show detail
    const minRequiredWidth = (originalDuration / timelineViewDuration) * containerWidth;
    
    // Ensure minimum width is at least the container width
    return Math.max(minRequiredWidth, containerWidth);
  }, [currentVideo, zoomLevel, getTimelineViewDuration, getOriginalDuration]);

  // Calculate playhead position based on timeline view and scroll
  const getPlayheadPosition = useCallback(() => {
    if (!currentVideo) return 0;
    const timelineScrollWidth = getTimelineScrollWidth();
    const originalDuration = getOriginalDuration();
    
    // Position playhead based on current time relative to original duration
    const absoluteTime = currentVideo.position.startTime + currentTime;
    const progress = absoluteTime / originalDuration;
    return progress * timelineScrollWidth;
  }, [currentVideo, currentTime, getTimelineScrollWidth, getOriginalDuration]);

  // Auto-scroll to follow playhead during playback
  useEffect(() => {
    if (!isPlaying || !scrollContainerRef.current || !currentVideo) return;
    
    const playheadPixelPosition = getPlayheadPosition();
    const container = scrollContainerRef.current;
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    
    // Check if playhead is outside visible area
    if (playheadPixelPosition < scrollLeft + 50) {
      // Playhead is too far left, scroll left
      container.scrollTo({
        left: Math.max(0, playheadPixelPosition - 50),
        behavior: 'smooth'
      });
    } else if (playheadPixelPosition > scrollLeft + containerWidth - 50) {
      // Playhead is too far right, scroll right
      container.scrollTo({
        left: playheadPixelPosition - containerWidth + 50,
        behavior: 'smooth'
      });
    }
  }, [isPlaying, currentTime, getPlayheadPosition, currentVideo]);

  // Handle timeline scrubbing with scroll offset
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!currentVideo || !timelineRef.current || !scrollContainerRef.current || trimState?.isActive || clipDragState?.isActive) return;

    const scrollContainer = scrollContainerRef.current;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollContainer.scrollLeft;
    const timelineScrollWidth = getTimelineScrollWidth();
    const originalDuration = getOriginalDuration();
    
    const progress = x / timelineScrollWidth;
    const absoluteTime = progress * originalDuration;
    
    // Convert to relative time within the clip
    const relativeTime = Math.max(0, Math.min(
      absoluteTime - currentVideo.position.startTime,
      currentVideo.position.endTime - currentVideo.position.startTime
    ));
    
    onTimeUpdate(relativeTime);
  }, [currentVideo, onTimeUpdate, getTimelineScrollWidth, getOriginalDuration, trimState, clipDragState]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Skip controls
  const handleSkipBackward = () => {
    const newTime = Math.max(0, currentTime - 5);
    onTimeUpdate(newTime);
  };

  const handleSkipForward = () => {
    if (!currentVideo) return;
    const duration = currentVideo.position.endTime - currentVideo.position.startTime;
    const newTime = Math.min(duration, currentTime + 5);
    onTimeUpdate(newTime);
  };

  // Enhanced drop handlers with better visual feedback
  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop(e);
  };

  const handleDragOverInternal = (e: React.DragEvent) => {
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeaveInternal = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDragLeave(e);
  };

  // Generate timeline markers for the entire timeline view
  const generateTimelineMarkers = () => {
    const originalDuration = getOriginalDuration();
    const timelineScrollWidth = getTimelineScrollWidth();
    const markers = [];
    
    // Calculate marker interval based on original duration and zoom level
    let interval = 5; // Default 5 second intervals
    let subInterval = 1; // Sub-markers
    
    if (originalDuration <= 10) {
      interval = 1;
      subInterval = 0.25;
    } else if (originalDuration <= 30) {
      interval = 2;
      subInterval = 0.5;
    } else if (originalDuration <= 60) {
      interval = 5;
      subInterval = 1;
    } else if (originalDuration <= 120) {
      interval = 10;
      subInterval = 2;
    } else {
      interval = 30;
      subInterval = 5;
    }
    
    // Generate main markers for the entire original duration
    for (let time = 0; time <= originalDuration; time += interval) {
      const position = (time / originalDuration) * timelineScrollWidth;
      
      markers.push({
        time,
        position,
        isMainMarker: true,
        isSubMarker: false,
        label: formatTime(time)
      });
    }
    
    // Generate sub-markers for better granularity
    for (let time = subInterval; time <= originalDuration; time += subInterval) {
      // Skip if this time already has a main marker
      if (time % interval === 0) continue;
      
      const position = (time / originalDuration) * timelineScrollWidth;
      
      markers.push({
        time,
        position,
        isMainMarker: false,
        isSubMarker: true,
        label: null
      });
    }
    
    // Sort markers by position
    return markers.sort((a, b) => a.position - b.position);
  };

  // Calculate clip dimensions accurately based on timeline scroll width
  const getClipDimensions = () => {
    if (!currentVideo) {
      return { width: 0, left: 0, height: 80 };
    }

    const timelineScrollWidth = getTimelineScrollWidth();
    const originalDuration = getOriginalDuration();
    const trimmedDuration = currentVideo.position.endTime - currentVideo.position.startTime;
    
    // Calculate clip width based on trimmed duration within the scrollable timeline
    const clipWidth = Math.max(80, (trimmedDuration / originalDuration) * timelineScrollWidth);
    
    // Calculate clip left position based on start time within the scrollable timeline
    const clipLeft = (currentVideo.position.startTime / originalDuration) * timelineScrollWidth;
    
    return {
      width: clipWidth,
      left: clipLeft,
      height: 80
    };
  };

  // Clip drag handlers (updated for scroll support)
  const handleClipMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentVideo || trimState?.isActive) return;
    
    // Check if clicking on trim handles
    const target = e.target as HTMLElement;
    if (target.closest('.trim-handle')) return;
    
    setClipDragState({
      isActive: true,
      startX: e.clientX,
      originalStartTime: currentVideo.position.startTime,
      originalEndTime: currentVideo.position.endTime
    });
  };

  // Handle clip dragging (updated for scroll support)
  const handleClipMouseMove = useCallback((e: MouseEvent) => {
    if (!clipDragState?.isActive || !currentVideo || !timelineRef.current || !scrollContainerRef.current || !onVideoUpdate) return;

    const scrollContainer = scrollContainerRef.current;
    const timelineScrollWidth = getTimelineScrollWidth();
    const originalDuration = getOriginalDuration();
    const deltaX = e.clientX - clipDragState.startX;
    const deltaTime = (deltaX / timelineScrollWidth) * originalDuration;
    
    // Calculate new start and end times
    const clipDuration = clipDragState.originalEndTime - clipDragState.originalStartTime;
    let newStartTime = clipDragState.originalStartTime + deltaTime;
    let newEndTime = clipDragState.originalEndTime + deltaTime;
    
    // Constrain to valid bounds
    if (newStartTime < 0) {
      newStartTime = 0;
      newEndTime = clipDuration;
    }
    
    const maxStartTime = originalDuration - clipDuration;
    if (newStartTime > maxStartTime) {
      newStartTime = maxStartTime;
      newEndTime = originalDuration;
    }
    
    // Update the video position
    onVideoUpdate({
      position: {
        ...currentVideo.position,
        startTime: newStartTime,
        endTime: newEndTime
      }
    });
  }, [clipDragState, currentVideo, onVideoUpdate, getTimelineScrollWidth, getOriginalDuration]);

  // Handle clip drag end
  const handleClipMouseUp = useCallback(() => {
    if (clipDragState?.isActive) {
      setClipDragState(null);
    }
  }, [clipDragState]);

  // Trim handle mouse event handlers (updated for scroll support)
  const handleTrimMouseDown = (e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentVideo) return;
    
    setTrimState({
      isActive: true,
      side,
      startX: e.clientX,
      originalStartTime: currentVideo.position.startTime,
      originalEndTime: currentVideo.position.endTime
    });
  };

  // Handle trim dragging (updated for scroll support)
  const handleTrimMouseMove = useCallback((e: MouseEvent) => {
    if (!trimState?.isActive || !currentVideo || !timelineRef.current || !scrollContainerRef.current || !onVideoUpdate) return;

    const timelineScrollWidth = getTimelineScrollWidth();
    const originalDuration = getOriginalDuration();
    const deltaX = e.clientX - trimState.startX;
    const deltaTime = (deltaX / timelineScrollWidth) * originalDuration;
    
    let newStartTime = trimState.originalStartTime;
    let newEndTime = trimState.originalEndTime;
    
    if (trimState.side === 'left') {
      // Trimming from the left
      newStartTime = Math.max(
        0, // Can't go below 0
        Math.min(
          trimState.originalStartTime + deltaTime,
          trimState.originalEndTime - 0.1 // Must leave at least 0.1s of clip
        )
      );
    } else {
      // Trimming from the right
      newEndTime = Math.min(
        originalDuration, // Can't exceed original duration
        Math.max(
          trimState.originalEndTime + deltaTime,
          trimState.originalStartTime + 0.1 // Must leave at least 0.1s of clip
        )
      );
    }
    
    // Update the video with new trim positions
    onVideoUpdate({
      position: {
        ...currentVideo.position,
        startTime: newStartTime,
        endTime: newEndTime
      }
    });
  }, [trimState, currentVideo, onVideoUpdate, getTimelineScrollWidth, getOriginalDuration]);

  // Handle trim end
  const handleTrimMouseUp = useCallback(() => {
    if (trimState?.isActive) {
      setTrimState(null);
    }
  }, [trimState]);

  // Add mouse event listeners for both trimming and clip dragging
  React.useEffect(() => {
    if (trimState?.isActive) {
      document.addEventListener('mousemove', handleTrimMouseMove);
      document.addEventListener('mouseup', handleTrimMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleTrimMouseMove);
        document.removeEventListener('mouseup', handleTrimMouseUp);
      };
    }
  }, [trimState, handleTrimMouseMove, handleTrimMouseUp]);

  React.useEffect(() => {
    if (clipDragState?.isActive) {
      document.addEventListener('mousemove', handleClipMouseMove);
      document.addEventListener('mouseup', handleClipMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleClipMouseMove);
        document.removeEventListener('mouseup', handleClipMouseUp);
      };
    }
  }, [clipDragState, handleClipMouseMove, handleClipMouseUp]);

  // Render video clip with accurate timeline positioning and trim handles
  const renderVideoClip = () => {
    if (!currentVideo) return null;

    const clipDimensions = getClipDimensions();
    const thumbnailImage = currentVideo.thumbnail || exampleImage;
    
    // Calculate how many thumbnails to repeat based on clip width
    const thumbnailWidth = 120; // Base thumbnail width
    const repeatCount = Math.ceil(clipDimensions.width / thumbnailWidth);

    return (
      <div
        className={`relative rounded-lg overflow-hidden shadow-md border-2 border-primary group ${
          clipDragState?.isActive ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ 
          width: `${clipDimensions.width}px`,
          height: `${clipDimensions.height}px`,
          left: `${clipDimensions.left}px`
        }}
        onMouseDown={handleClipMouseDown}
      >
        {/* Repeating thumbnail background - Canva style */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: repeatCount }, (_, index) => (
            <img
              key={index}
              src={thumbnailImage}
              alt={`${currentVideo.name} thumbnail ${index + 1}`}
              className="h-full object-cover"
              style={{ 
                width: `${thumbnailWidth}px`,
                minWidth: `${thumbnailWidth}px`
              }}
            />
          ))}
        </div>
        
        {/* Left trim handle */}
        <div
          className="trim-handle absolute left-0 top-0 bottom-0 w-2 bg-primary/20 hover:bg-primary/40 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          onMouseDown={(e) => handleTrimMouseDown(e, 'left')}
          style={{ cursor: trimState?.side === 'left' ? 'ew-resize' : 'ew-resize' }}
        >
          <div className="w-0.5 h-8 bg-white rounded-full shadow-sm" />
        </div>
        
        {/* Right trim handle */}
        <div
          className="trim-handle absolute right-0 top-0 bottom-0 w-2 bg-primary/20 hover:bg-primary/40 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          onMouseDown={(e) => handleTrimMouseDown(e, 'right')}
          style={{ cursor: trimState?.side === 'right' ? 'ew-resize' : 'ew-resize' }}
        >
          <div className="w-0.5 h-8 bg-white rounded-full shadow-sm" />
        </div>
        
        {/* Clip content overlay - UPDATED: Removed name, moved duration to bottom right */}
        <div className="absolute inset-0 flex items-end justify-end p-2 pointer-events-none">
          {/* Duration in bottom right corner */}
          <div className="flex items-center space-x-1 flex-shrink-0 bg-black/70 rounded-full px-2 py-1">
            <Clock className="w-3 h-3 text-white/90" />
            <span className="text-xs text-white/90">
              {Math.round(currentVideo.position.endTime - currentVideo.position.startTime)}s
            </span>
          </div>
        </div>
        
        {/* Active trim overlay */}
        {trimState?.isActive && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg pointer-events-none" />
        )}

        {/* Active drag overlay */}
        {clipDragState?.isActive && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 rounded-lg pointer-events-none" />
        )}
      </div>
    );
  };

  // Render skeleton placeholder when no video - centered and larger
  const renderVideoSkeleton = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-8 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center space-x-4 hover:border-primary/50 hover:bg-primary/5 transition-colors">
          <div className="bg-muted-foreground/20 rounded-full p-3">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-base text-muted-foreground font-medium">Drop video here to get started</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Drag a video from the library to begin editing</p>
          </div>
        </div>
      </div>
    );
  };

  // Handle zoom slider change
  const handleZoomSliderChange = (value: number[]) => {
    onZoomChange(value[0]);
  };

  // Zoom button handlers
  const handleZoomOut = () => {
    const newZoom = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
    onZoomChange(newZoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
    onZoomChange(newZoom);
  };

  const timelineMarkers = generateTimelineMarkers();
  const timelineScrollWidth = getTimelineScrollWidth();

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Timeline Header with Time Markers */}
      <div className="border-b border-border">
        {/* Controls Row */}
        <div className="p-3 flex items-center justify-between">
          {/* Left side - Playback controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipBackward}
              className="h-8 w-8 p-0"
              disabled={!currentVideo}
              title="Skip backward 5s"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant={isPlaying ? "default" : "secondary"}
              size="sm"
              onClick={onPlayPause}
              className="h-8 w-8 p-0"
              disabled={!currentVideo}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipForward}
              className="h-8 w-8 p-0"
              disabled={!currentVideo}
              title="Skip forward 5s"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />

            {/* Time display */}
            <div className="text-xs text-muted-foreground font-mono min-w-[60px]">
              {currentVideo ? formatTime(currentTime) : '0:00'}
            </div>
            
            {currentVideo && (
              <>
                <span className="text-xs text-muted-foreground">/</span>
                <div className="text-xs text-muted-foreground font-mono">
                  {formatTime(currentVideo.position.endTime - currentVideo.position.startTime)}
                </div>
              </>
            )}
          </div>

          {/* Right side - Zoom slider and actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={undoStack.length === 0}
              className="h-8 w-8 p-0"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={redoStack.length === 0}
              className="h-8 w-8 p-0"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />
            
            {/* Zoom Controls with Interactive Buttons and Slider */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= ZOOM_MIN}
                className="h-8 w-8 p-0"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Slider
                  value={[zoomLevel]}
                  onValueChange={handleZoomSliderChange}
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step={ZOOM_STEP}
                  className="w-20"
                />
                <div className="text-xs text-muted-foreground min-w-[45px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= ZOOM_MAX}
                className="h-8 w-8 p-0"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Time Markers Row - Only show when there's a video on the timeline */}
        {currentVideo && (
          <div 
            ref={scrollContainerRef}
            className="relative h-8 bg-muted/20 overflow-x-auto"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div 
              className="relative h-full"
              style={{ width: `${timelineScrollWidth}px`, minWidth: '100%' }}
            >
              {timelineMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-0 h-full flex flex-col justify-between"
                  style={{ left: `${marker.position}px` }}
                >
                  {/* Marker line */}
                  <div 
                    className={`w-px bg-muted-foreground ${
                      marker.isMainMarker 
                        ? 'h-full opacity-60' 
                        : marker.isSubMarker 
                        ? 'h-2 opacity-20' 
                        : 'h-4 opacity-30'
                    }`}
                  />
                  {/* Marker label */}
                  {marker.label && (
                    <div className="absolute top-0 left-0 transform -translate-x-1/2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {marker.label}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Content Area - Full Height with Horizontal Scroll */}
      <div className="flex-1 relative overflow-hidden">
        {/* Enhanced drop zone feedback */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-primary border-2 border-dashed rounded-lg flex items-center justify-center z-20 m-2">
            <div className="text-center">
              <div className="bg-primary/20 rounded-full p-4 mb-3 mx-auto w-fit">
                <Film className="w-8 h-8 text-primary" />
              </div>
              <div className="text-primary font-medium text-lg">Drop video here</div>
              <div className="text-primary/70 text-sm mt-1">Add to timeline</div>
            </div>
          </div>
        )}
        
        {/* Timeline content with horizontal scroll */}
        <div className="h-full overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'thin' }}>
          <div
            ref={timelineRef}
            className="relative h-full cursor-pointer bg-muted/10"
            style={{ 
              width: currentVideo ? `${timelineScrollWidth}px` : '100%',
              minWidth: '100%'
            }}
            onClick={handleTimelineClick}
            onDrop={handleDrop}
            onDragOver={handleDragOverInternal}
            onDragEnter={onDragEnter}
            onDragLeave={handleDragLeaveInternal}
          >
            {/* Video clip or skeleton */}
            {currentVideo ? (
              <div className="absolute" style={{ top: '20px', left: '0px' }}>
                {renderVideoClip()}
              </div>
            ) : (
              renderVideoSkeleton()
            )}

            {/* Playhead - Positioned based on timeline scroll width */}
            {currentVideo && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                style={{
                  left: `${getPlayheadPosition()}px`
                }}
              >
                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                <div className="absolute -bottom-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}