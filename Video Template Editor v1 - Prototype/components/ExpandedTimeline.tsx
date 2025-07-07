import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { VideoAsset } from '../types/video';
import { VideoPreview } from './VideoPreview';

interface ExpandedTimelineProps {
  currentVideo: VideoAsset;
  isOpen: boolean;
  onClose: () => void;
  onVideoUpdate: (updates: Partial<VideoAsset>) => void;
}

export function ExpandedTimeline({ 
  currentVideo, 
  isOpen, 
  onClose, 
  onVideoUpdate 
}: ExpandedTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'playhead' | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Timeline dimensions
  const TIMELINE_HEIGHT = 120;
  const WAVEFORM_HEIGHT = 60;
  const CONTROLS_HEIGHT = 60;
  const HANDLE_WIDTH = 12;

  // Get original duration (either stored or current duration if not trimmed)
  const originalDuration = currentVideo.originalDuration || currentVideo.duration;
  
  // Calculate effective duration based on speed setting
  const videoSpeed = currentVideo.speed || currentVideo.audio?.speed || 1;
  const effectiveDuration = originalDuration / videoSpeed;
  
  // Get trimmed start and end times from stored values or defaults
  const [trimStart, setTrimStart] = useState(currentVideo.trimStart || 0);
  const [trimEnd, setTrimEnd] = useState(currentVideo.trimEnd || originalDuration);

  // Reset trim values when video changes
  useEffect(() => {
    const originalDur = currentVideo.originalDuration || currentVideo.duration;
    setTrimStart(currentVideo.trimStart || 0);
    setTrimEnd(currentVideo.trimEnd || originalDur);
    setCurrentTime(currentVideo.trimStart || 0);
  }, [currentVideo.id]);

  // Update trim values when video properties change (preserving trim points)
  useEffect(() => {
    setTrimStart(currentVideo.trimStart || 0);
    setTrimEnd(currentVideo.trimEnd || originalDuration);
  }, [currentVideo.trimStart, currentVideo.trimEnd, originalDuration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = useCallback((x: number): number => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * originalDuration;
  }, [originalDuration]);

  const getPositionFromTime = useCallback((time: number): number => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    return (time / originalDuration) * rect.width;
  }, [originalDuration]);

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'start' | 'end' | 'playhead') => {
    e.preventDefault();
    setIsDragging(type);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = getTimeFromPosition(x);

    if (isDragging === 'start') {
      const newStart = Math.max(0, Math.min(newTime, trimEnd - 0.1));
      setTrimStart(newStart);
    } else if (isDragging === 'end') {
      // Limit end time to original duration
      const newEnd = Math.min(originalDuration, Math.max(newTime, trimStart + 0.1));
      setTrimEnd(newEnd);
    } else if (isDragging === 'playhead') {
      const newTime = Math.max(trimStart, Math.min(trimEnd, newTime));
      setCurrentTime(newTime);
    }
  }, [isDragging, trimStart, trimEnd, originalDuration, getTimeFromPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Set up global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle timeline click
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = getTimeFromPosition(x);
    const clampedTime = Math.max(trimStart, Math.min(trimEnd, newTime));
    setCurrentTime(clampedTime);
  }, [isDragging, trimStart, trimEnd, getTimeFromPosition]);

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle skip functions
  const handleSkipBack = () => {
    setCurrentTime(Math.max(trimStart, currentTime - 5));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(trimEnd, currentTime + 5));
  };

  // Apply trim changes
  const handleApplyTrim = () => {
    const trimmedDuration = trimEnd - trimStart;
    const finalDuration = trimmedDuration / videoSpeed; // Apply speed to trimmed duration
    
    onVideoUpdate({
      duration: finalDuration,
      originalDuration: originalDuration, // Store original duration
      trimStart: trimStart, // Store trim points in original timeline
      trimEnd: trimEnd,
      // Note: We're trimming the video content, not changing its timeline position
      // The position.startTime and position.endTime relate to timeline placement
      position: currentVideo.position ? {
        ...currentVideo.position,
        endTime: (currentVideo.position.startTime || 0) + finalDuration
      } : undefined
    });
    onClose();
  };

  // Generate time markers
  const generateTimeMarkers = () => {
    const markers = [];
    const duration = originalDuration;
    const interval = duration > 60 ? 10 : duration > 30 ? 5 : 1; // Adjust interval based on duration
    
    for (let time = 0; time <= duration; time += interval) {
      const position = (time / duration) * 100;
      markers.push(
        <div
          key={time}
          className="absolute top-0 text-xs text-muted-foreground"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-px h-2 bg-border mb-1"></div>
          {formatTime(time)}
        </div>
      );
    }
    return markers;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-lg">Trim Video</h2>
            <p className="text-sm text-muted-foreground">{currentVideo.name}</p>
            {videoSpeed !== 1 && (
              <p className="text-xs text-yellow-600 mt-1">
                Speed: {videoSpeed}x (Original: {formatTime(originalDuration)})
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Timeline Area */}
        <div className="flex-1 p-6 space-y-6">
          {/* Video Preview */}
          <div className="flex justify-center">
            <VideoPreview
              video={currentVideo}
              currentTime={currentTime}
              width={400}
              height={225}
              className="shadow-lg"
            />
          </div>

          {/* Timeline Ruler */}
          <div className="relative h-8 border-b">
            {generateTimeMarkers()}
          </div>

          {/* Main Timeline */}
          <div className="relative">
            <div
              ref={timelineRef}
              className="relative h-24 bg-muted rounded-lg cursor-pointer"
              onClick={handleTimelineClick}
            >
              {/* Video Clip Track */}
              <div className="absolute inset-2 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded overflow-hidden">
                {/* Repeating Video thumbnails */}
                {(currentVideo.thumbnail || currentVideo.src || currentVideo.url) ? (
                  <div className="absolute inset-0 flex">
                    {Array.from({ 
                      length: Math.min(
                        Math.max(2, Math.ceil((timelineRef.current?.offsetWidth || 600) / 120)), 
                        Math.ceil(originalDuration / 5) || 8
                      )
                    }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-30 h-full bg-cover bg-center border-r border-black/10 last:border-r-0"
                        style={{ 
                          backgroundImage: `url(${currentVideo.thumbnail || currentVideo.src || currentVideo.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          width: `${100 / Math.min(Math.max(2, Math.ceil((timelineRef.current?.offsetWidth || 600) / 120)), Math.ceil(originalDuration / 5) || 8)}%`
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Trim Overlay - areas outside trim range */}
              <div
                className="absolute top-0 left-0 h-full bg-black/30 rounded-l-lg"
                style={{ width: `${(trimStart / originalDuration) * 100}%` }}
              />
              <div
                className="absolute top-0 right-0 h-full bg-black/30 rounded-r-lg"
                style={{ width: `${((originalDuration - trimEnd) / originalDuration) * 100}%` }}
              />

              {/* Start Handle */}
              <div
                className="absolute top-0 h-full w-3 bg-primary cursor-ew-resize flex items-center justify-center"
                style={{ left: `${(trimStart / originalDuration) * 100}%`, transform: 'translateX(-50%)' }}
                onMouseDown={(e) => handleMouseDown(e, 'start')}
              >
                <div className="w-1 h-8 bg-white rounded"></div>
              </div>

              {/* End Handle */}
              <div
                className="absolute top-0 h-full w-3 bg-primary cursor-ew-resize flex items-center justify-center"
                style={{ left: `${(trimEnd / originalDuration) * 100}%`, transform: 'translateX(-50%)' }}
                onMouseDown={(e) => handleMouseDown(e, 'end')}
              >
                <div className="w-1 h-8 bg-white rounded"></div>
              </div>

              {/* Playhead */}
              <div
                className="absolute top-0 h-full w-0.5 bg-red-500 cursor-ew-resize"
                style={{ left: `${(currentTime / originalDuration) * 100}%` }}
                onMouseDown={(e) => handleMouseDown(e, 'playhead')}
              >
                <div className="absolute -top-1 left-1/2 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2"></div>
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="flex justify-between items-center text-sm">
            <div className="space-x-4">
              <span>Start: {formatTime(trimStart)}</span>
              <span>End: {formatTime(trimEnd)}</span>
              <span>Trimmed: {formatTime(trimEnd - trimStart)}</span>
              {videoSpeed !== 1 && (
                <span className="text-yellow-600">Final: {formatTime((trimEnd - trimStart) / videoSpeed)}</span>
              )}
            </div>
            <div>
              Current: {formatTime(currentTime)}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleSkipBack}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSkipForward}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>


        </div>

        {/* Footer Actions */}
        <div className="flex justify-between p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => {
              // Reset to original duration
              setTrimStart(0);
              setTrimEnd(originalDuration);
              setCurrentTime(0);
              
              // Update the video to restore original duration considering speed
              const finalDuration = originalDuration / videoSpeed;
              onVideoUpdate({
                duration: finalDuration,
                originalDuration: originalDuration,
                trimStart: 0,
                trimEnd: originalDuration,
                position: currentVideo.position ? {
                  ...currentVideo.position,
                  endTime: (currentVideo.position.startTime || 0) + finalDuration
                } : undefined
              });
            }}>
              Reset
            </Button>
            <Button onClick={handleApplyTrim}>
              Apply Trim
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}