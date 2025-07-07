import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, SplitSquareHorizontal, Plus, Undo, Redo } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { VideoAsset } from '../types/video';
import { VideoPreview } from './VideoPreview';

interface SplitTimelineProps {
  currentVideo: VideoAsset;
  isOpen: boolean;
  onClose: () => void;
  onVideoUpdate: (updates: Partial<VideoAsset>) => void;
  onAddToTimeline?: (video: VideoAsset) => void;
}

// State history interface for undo/redo
interface StateSnapshot {
  splitPoints: number[];
  selectedSegments: Set<number>;
  currentTime: number;
}

export function SplitTimeline({ 
  currentVideo, 
  isOpen, 
  onClose, 
  onVideoUpdate,
  onAddToTimeline 
}: SplitTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [splitPoints, setSplitPoints] = useState<number[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState<'playhead' | null>(null);
  const [undoStack, setUndoStack] = useState<StateSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<StateSnapshot[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Get original duration and calculate effective timeline
  const originalDuration = currentVideo.originalDuration || currentVideo.duration;
  const videoSpeed = currentVideo.speed || currentVideo.audio?.speed || 1;
  
  // Use trim bounds if available, otherwise use full original duration
  const trimStart = currentVideo.trimStart || 0;
  const trimEnd = currentVideo.trimEnd || originalDuration;
  const effectiveDuration = trimEnd - trimStart;

  // Reset split points when video changes
  useEffect(() => {
    setSplitPoints([]);
    setSelectedSegments(new Set());
    setCurrentTime(0);
    setUndoStack([]);
    setRedoStack([]);
  }, [currentVideo.id]);

  // Create state snapshot for undo/redo
  const createSnapshot = useCallback((): StateSnapshot => ({
    splitPoints: [...splitPoints],
    selectedSegments: new Set(selectedSegments),
    currentTime
  }), [splitPoints, selectedSegments, currentTime]);

  // Validate and clean selected segments whenever segments change
  useEffect(() => {
    const segments = generateSegments();
    const validSelections = new Set(
      Array.from(selectedSegments).filter(index => index < segments.length)
    );
    
    // Only update if there's a difference to avoid infinite loops
    if (validSelections.size !== selectedSegments.size || 
        !Array.from(validSelections).every(index => selectedSegments.has(index))) {
      setSelectedSegments(validSelections);
    }
  }, [splitPoints]); // Only depend on splitPoints to avoid infinite loops

  // Save state for undo
  const saveState = useCallback(() => {
    const snapshot = createSnapshot();
    setUndoStack(prev => [...prev, snapshot]);
    setRedoStack([]); // Clear redo stack when new action is performed
  }, [createSnapshot]);

  // Undo last action
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const currentSnapshot = createSnapshot();
    const previousSnapshot = undoStack[undoStack.length - 1];
    
    // Add current state to redo stack
    setRedoStack(prev => [...prev, currentSnapshot]);
    
    // Remove last item from undo stack
    setUndoStack(prev => prev.slice(0, -1));
    
    // Restore previous state
    setSplitPoints(previousSnapshot.splitPoints);
    
    // Validate selected segments against new segment count
    const newSegments = generateSegmentsFromSplitPoints(previousSnapshot.splitPoints);
    const validSelectedSegments = new Set(
      Array.from(previousSnapshot.selectedSegments).filter(index => index < newSegments.length)
    );
    setSelectedSegments(validSelectedSegments);
    setCurrentTime(previousSnapshot.currentTime);
  }, [undoStack, createSnapshot]);

  // Redo last undone action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const currentSnapshot = createSnapshot();
    const nextSnapshot = redoStack[redoStack.length - 1];
    
    // Add current state to undo stack
    setUndoStack(prev => [...prev, currentSnapshot]);
    
    // Remove last item from redo stack
    setRedoStack(prev => prev.slice(0, -1));
    
    // Restore next state
    setSplitPoints(nextSnapshot.splitPoints);
    
    // Validate selected segments against new segment count
    const newSegments = generateSegmentsFromSplitPoints(nextSnapshot.splitPoints);
    const validSelectedSegments = new Set(
      Array.from(nextSnapshot.selectedSegments).filter(index => index < newSegments.length)
    );
    setSelectedSegments(validSelectedSegments);
    setCurrentTime(nextSnapshot.currentTime);
  }, [redoStack, createSnapshot]);

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
    return trimStart + (percentage * effectiveDuration);
  }, [trimStart, effectiveDuration]);

  // Handle mouse events for dragging playhead
  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'playhead') => {
    e.preventDefault();
    setIsDragging(type);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = getTimeFromPosition(x);

    if (isDragging === 'playhead') {
      const clampedTime = Math.max(trimStart, Math.min(trimEnd, newTime));
      setCurrentTime(clampedTime);
    }
  }, [isDragging, trimStart, trimEnd, getTimeFromPosition]);

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
    
    // Clear segment selections if clicking without modifier key
    if (!e.ctrlKey && !e.metaKey && selectedSegments.size > 0) {
      setSelectedSegments(new Set());
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = getTimeFromPosition(x);
    setCurrentTime(Math.max(0, Math.min(effectiveDuration, newTime)));
  }, [isDragging, effectiveDuration, getTimeFromPosition, selectedSegments]);

  // Handle double-click for quick split
  const handleTimelineDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = getTimeFromPosition(x);
    const clampedTime = Math.max(trimStart, Math.min(trimEnd, newTime));
    
    if (clampedTime > 0 && clampedTime < effectiveDuration) {
      saveState(); // Save state for undo
      const newSplitPoints = [...splitPoints, clampedTime].sort((a, b) => a - b);
      // Remove duplicates (within 0.1 seconds)
      const uniqueSplitPoints = newSplitPoints.filter((point, index) => {
        if (index === 0) return true;
        return point - newSplitPoints[index - 1] > 0.1;
      });
      setSplitPoints(uniqueSplitPoints);
      setCurrentTime(clampedTime);
    }
  }, [getTimeFromPosition, trimStart, trimEnd, effectiveDuration, splitPoints, saveState]);

  // Add split point at current time
  const handleAddSplit = () => {
    if (currentTime > 0 && currentTime < effectiveDuration) {
      saveState(); // Save state for undo
      const newSplitPoints = [...splitPoints, currentTime].sort((a, b) => a - b);
      // Remove duplicates (within 0.1 seconds)
      const uniqueSplitPoints = newSplitPoints.filter((point, index) => {
        if (index === 0) return true;
        return point - newSplitPoints[index - 1] > 0.1;
      });
      setSplitPoints(uniqueSplitPoints);
    }
  };

  // Remove a split point
  const handleRemoveSplit = (pointToRemove: number) => {
    saveState(); // Save state for undo
    const newSplitPoints = splitPoints.filter(point => Math.abs(point - pointToRemove) > 0.01);
    setSplitPoints(newSplitPoints);
    setSelectedSegments(new Set()); // Clear selections when splits change
  };

  // Toggle segment selection (only with modifier key)
  const handleSegmentClick = (segmentIndex: number, e: React.MouseEvent) => {
    // Only select segments if Ctrl/Cmd is held
    if (e.ctrlKey || e.metaKey) {
      e.stopPropagation();
      e.preventDefault();
      
      // Validate segment index
      const segments = generateSegments();
      if (segmentIndex >= segments.length) return;
      
      saveState(); // Save state for undo
      const newSelected = new Set(selectedSegments);
      if (newSelected.has(segmentIndex)) {
        newSelected.delete(segmentIndex);
      } else {
        newSelected.add(segmentIndex);
      }
      setSelectedSegments(newSelected);
      return;
    }
    
    // If not holding modifier key, let the click pass through to timeline
    // by not stopping propagation
  };



  // Remove selected segments
  const handleRemoveSelected = () => {
    if (selectedSegments.size === 0) return;
    
    const segments = generateSegments();
    const segmentsToKeep = segments.filter((_, index) => !selectedSegments.has(index));
    
    if (segmentsToKeep.length === 0) {
      // Can't remove all segments
      return;
    }
    
    // Note: We don't save state for operations that modify the video itself
    // because undo/redo can't restore video changes made via onVideoUpdate
    
    // Create new split points based on remaining segments
    const newSplitPoints: number[] = [];
    let currentTime = 0;
    
    segmentsToKeep.forEach((segment, index) => {
      if (index > 0) {
        newSplitPoints.push(currentTime);
      }
      currentTime += segment.end - segment.start;
    });
    
    // Update the video with the combined duration of kept segments
    const totalDuration = segmentsToKeep.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
    
    onVideoUpdate({
      duration: totalDuration,
      position: currentVideo.position ? {
        ...currentVideo.position,
        endTime: (currentVideo.position.startTime || 0) + totalDuration
      } : undefined
    });
    
    // Reset state but keep modal open to show updated clip
    // Clear undo/redo history since video state has changed
    setUndoStack([]);
    setRedoStack([]);
    setSelectedSegments(new Set());
    setSplitPoints(newSplitPoints);
    setCurrentTime(0);
  };

  // Extract selected segments as new clips
  const handleExtractSelected = () => {
    if (selectedSegments.size === 0 || !onAddToTimeline) return;
    
    const segments = generateSegments();
    const selectedSegmentsList = Array.from(selectedSegments).sort((a, b) => a - b);
    
    selectedSegmentsList.forEach((segmentIndex, index) => {
      const segment = segments[segmentIndex];
      if (segment) {
        const newVideo: VideoAsset = {
          ...currentVideo,
          id: `${currentVideo.id}-extract-${segmentIndex}`,
          name: `${currentVideo.name} (Extract ${index + 1})`,
          duration: segment.end - segment.start,
          trimStart: segment.start,
          trimEnd: segment.end,
          position: undefined // Will be positioned by the timeline system
        };
        onAddToTimeline(newVideo);
      }
    });
    
    setSelectedSegments(new Set());
    onClose();
  };

  // Handle play/pause with video preview
  const handlePlayPause = () => {
    const video = document.querySelector('.video-preview video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.currentTime = currentTime;
        video.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Update video time when currentTime changes
  useEffect(() => {
    const video = document.querySelector('.video-preview video') as HTMLVideoElement;
    if (video && !isPlaying) {
      video.currentTime = currentTime;
    }
  }, [currentTime, isPlaying]);

  // Handle video time updates during playback
  useEffect(() => {
    if (!isPlaying) return;
    
    const video = document.querySelector('.video-preview video') as HTMLVideoElement;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying]);

  // Handle skip functions
  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 5));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(currentVideo.duration, currentTime + 5));
  };

  // Generate split segments from given split points
  const generateSegmentsFromSplitPoints = (points: number[]) => {
    if (points.length === 0) return [{ start: 0, end: currentVideo.duration }];
    
    const segments = [];
    segments.push({ start: 0, end: points[0] });
    
    for (let i = 0; i < points.length - 1; i++) {
      segments.push({ start: points[i], end: points[i + 1] });
    }
    
    segments.push({ start: points[points.length - 1], end: currentVideo.duration });
    
    return segments;
  };

  // Generate split segments
  const generateSegments = () => {
    return generateSegmentsFromSplitPoints(splitPoints);
  };

  // Apply split
  const handleApplySplit = () => {
    if (splitPoints.length === 0) {
      onClose();
      return;
    }

    const segments = generateSegments();
    
    // Create new video assets for each segment
    segments.forEach((segment, index) => {
      if (index === 0) {
        // Update the original video to be the first segment
        onVideoUpdate({
          duration: segment.end - segment.start,
          position: currentVideo.position ? {
            ...currentVideo.position,
            endTime: (currentVideo.position.startTime || 0) + (segment.end - segment.start)
          } : undefined
        });
      } else if (onAddToTimeline) {
        // Create new videos for additional segments
        const newVideo: VideoAsset = {
          ...currentVideo,
          id: `${currentVideo.id}-split-${index}`,
          name: `${currentVideo.name} (${index + 1})`,
          duration: segment.end - segment.start,
          position: undefined // Will be positioned by the timeline system
        };
        onAddToTimeline(newVideo);
      }
    });

    onClose();
  };

  // Generate time markers
  const generateTimeMarkers = () => {
    const markers = [];
    const duration = currentVideo.duration;
    const interval = duration > 60 ? 10 : duration > 30 ? 5 : 1;
    
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

  const segments = generateSegments();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-lg">Split Video</h2>
            <p className="text-sm text-muted-foreground">{currentVideo.name}</p>
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
              className="shadow-lg video-preview"
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
              onDoubleClick={handleTimelineDoubleClick}
              title="Click to move playhead, double-click to split"
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
                        className="flex-shrink-0 h-full bg-cover bg-center border-r border-black/10 last:border-r-0"
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

              {/* Segment Separators and Selection */}
              {segments.map((segment, index) => (
                <div key={index}>
                  {/* Segment boundary lines */}
                  {index > 0 && (
                    <div
                      className="absolute top-0 h-full w-0.5 bg-orange-500"
                      style={{ left: `${(segment.start / currentVideo.duration) * 100}%` }}
                    />
                  )}
                  
                  {/* Segment selection overlay */}
                  <div
                    className={`absolute top-0 h-full transition-all pointer-events-none ${
                      selectedSegments.has(index) 
                        ? 'bg-blue-500/30 border-2 border-blue-500' 
                        : ''
                    }`}
                    style={{ 
                      left: `${(segment.start / currentVideo.duration) * 100}%`,
                      width: `${((segment.end - segment.start) / currentVideo.duration) * 100}%`
                    }}
                  >
                    {selectedSegments.has(index) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Selected
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Segment selection area (full height) */}
                  <div
                    className={`absolute top-0 h-full transition-all ${
                      selectedSegments.has(index) 
                        ? 'bg-blue-500/20 cursor-pointer' 
                        : 'hover:bg-blue-500/10 cursor-pointer'
                    }`}
                    style={{ 
                      left: `${(segment.start / currentVideo.duration) * 100}%`,
                      width: `${((segment.end - segment.start) / currentVideo.duration) * 100}%`
                    }}
                    onClick={(e) => handleSegmentClick(index, e)}
                    onDoubleClick={(e) => {
                      // Prevent double-click from propagating to timeline when holding modifier
                      if (e.ctrlKey || e.metaKey) {
                        e.stopPropagation();
                        e.preventDefault();
                      }
                    }}
                    title={`Segment ${index + 1}: ${formatTime(segment.start)} - ${formatTime(segment.end)} (Ctrl/Cmd + click to select)`}
                  />
                </div>
              ))}

              {/* Split Points */}
              {splitPoints.map((point, index) => (
                <div
                  key={index}
                  className="absolute top-0 h-full w-1 bg-orange-500 cursor-pointer hover:bg-orange-600"
                  style={{ left: `${(point / currentVideo.duration) * 100}%`, transform: 'translateX(-50%)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSplit(point);
                  }}
                  title={`Split at ${formatTime(point)} (click to remove)`}
                >
                  <div className="absolute -top-2 left-1/2 w-4 h-4 bg-orange-500 rounded-full transform -translate-x-1/2 flex items-center justify-center">
                    <X className="w-2 h-2 text-white" />
                  </div>
                </div>
              ))}

              {/* Playhead */}
              <div
                className="absolute top-0 h-full w-0.5 bg-red-500 cursor-ew-resize z-10"
                style={{ left: `${(currentTime / currentVideo.duration) * 100}%` }}
                onMouseDown={(e) => handleMouseDown(e, 'playhead')}
              >
                <div className="absolute -top-1 left-1/2 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2"></div>
              </div>
            </div>
          </div>

          {/* Split Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button onClick={handleAddSplit} disabled={currentTime <= 0 || currentTime >= currentVideo.duration}>
                <Plus className="w-4 h-4 mr-2" />
                Add Split at {formatTime(currentTime)}
              </Button>
              <div className="text-sm text-muted-foreground">
                {splitPoints.length} split{splitPoints.length !== 1 ? 's' : ''} • {segments.length} segment{segments.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Segment Actions */}
            {selectedSegments.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm">
                  <span className="font-medium">{selectedSegments.size} segment{selectedSegments.size !== 1 ? 's' : ''} selected</span>
                  <p className="text-muted-foreground text-xs mt-1">
                    Choose an action for the selected segment{selectedSegments.size !== 1 ? 's' : ''}
                  </p>
                  <p className="text-orange-600 text-xs mt-1 font-medium">
                    ⚠️ Note: Removing segments will clear undo history
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRemoveSelected}
                    disabled={selectedSegments.size === segments.length}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExtractSelected}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Extract as New Clip{selectedSegments.size > 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            )}

            {segments.length > 1 && selectedSegments.size === 0 && (
              <div className="text-sm text-muted-foreground text-center p-2 bg-slate-50 rounded">
                Hold <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Ctrl</kbd> (or <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">⌘</kbd>) and click on segments to select them
              </div>
            )}
            
            <div className="text-xs text-muted-foreground text-center">
              💡 <strong>Quick Split:</strong> Double-click anywhere on the timeline to split at that position
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
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {/* Undo/Redo Controls */}
            <div className="flex items-center space-x-1 border-l pl-2 ml-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="Undo last action (splits, selections only)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Redo last action (splits, selections only)"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
            
            <Button variant="outline" onClick={() => {
              if (splitPoints.length > 0 || selectedSegments.size > 0) {
                saveState();
                setSplitPoints([]);
                setSelectedSegments(new Set());
                setCurrentTime(0);
              }
            }}>
              Clear All
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button onClick={handleApplySplit}>
              Apply Split
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}