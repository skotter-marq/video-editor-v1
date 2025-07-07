import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ZoomIn, ZoomOut, Play, Pause, SkipBack, SkipForward, Film, Clock, Music, Undo2, Redo2, ChevronUp, ChevronDown, Plus, Copy, Trash2, Type, Image, Square, Layers, ArrowUpDown, MoreHorizontal, Scissors, Wand2, RefreshCw, Replace, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { VideoAsset, SceneLayer, LayerType, TextLayerProperties, ShapeLayerProperties, FrameProperties } from '../types/video';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface VideoTimelineRef {
  scrollToTime: (time: number) => void;
  updateProgress?: (progress: number) => void;
}

interface VideoTimelineProps {
  timelineVideos: VideoAsset[];
  currentVideo: VideoAsset | null;
  onVideoSelect?: (video: VideoAsset) => void;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeSeek: (time: number) => void;
  onSceneDuplicate?: (videoId: string) => void;
  onSceneDelete?: (videoId: string) => void;
  onSceneReplaceMedia?: (videoId: string) => void;
  onAddScene?: () => void;
  onLayerAdd?: (type: LayerType) => void;
  selectedLayer?: SceneLayer | null;
  onLayerSelect?: (layer: SceneLayer | null) => void;
  onLayerDelete?: (layerId: string) => void;
  onLayerDuplicate?: (layerId: string) => void;
  onLayerMove?: (layerId: string, direction: 'up' | 'down') => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onExportVideo?: () => void;
}

export const VideoTimeline = forwardRef<VideoTimelineRef, VideoTimelineProps>(({
  timelineVideos,
  currentVideo,
  onVideoSelect,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onTimeSeek,
  onSceneDuplicate,
  onSceneDelete,
  onSceneReplaceMedia,
  onAddScene,
  onLayerAdd,
  selectedLayer,
  onLayerSelect,
  onLayerDelete,
  onLayerDuplicate,
  onLayerMove,
  isExpanded = false,
  onToggleExpanded,
  onExportVideo
}, ref) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get scene duration helper
  const getSceneDuration = (video: VideoAsset) => {
    return video.frameProperties?.duration || video.duration || 5;
  };

  // Get layer icon
  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'text': return Type;
      case 'image': return Image;
      case 'shape': return Square;
      case 'video': return Film;
      default: return Layers;
    }
  };

  // Get layer color
  const getLayerColor = (type: LayerType) => {
    switch (type) {
      case 'text': return 'bg-blue-500';
      case 'image': return 'bg-green-500';
      case 'shape': return 'bg-purple-500';
      case 'video': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate total duration if not provided
  const calculatedTotalDuration = totalDuration || timelineVideos.reduce((total, video) => {
    return total + getSceneDuration(video);
  }, 0);

  // Calculate playhead position based on scene containers
  const calculatePlayheadPosition = () => {
    if (calculatedTotalDuration === 0 || timelineVideos.length === 0) return 0;
    
    let accumulatedTime = 0;
    const sceneWidth = 224 + 16; // 224px scene width + 16px gap
    
    for (let i = 0; i < timelineVideos.length; i++) {
      const sceneDuration = getSceneDuration(timelineVideos[i]);
      const sceneStartTime = accumulatedTime;
      const sceneEndTime = accumulatedTime + sceneDuration;
      
      if (currentTime >= sceneStartTime && currentTime <= sceneEndTime) {
        // Playhead is within this scene
        const progressInScene = (currentTime - sceneStartTime) / sceneDuration;
        return (i * sceneWidth) + (progressInScene * 224) + 32; // 32px is padding offset
      }
      
      accumulatedTime += sceneDuration;
    }
    
    // If playhead is at the end, position it at the end of the last scene
    return (timelineVideos.length * sceneWidth) + 32;
  };

  const playheadPosition = calculatePlayheadPosition();

  // Debug timeline state
  useEffect(() => {
    if (timelineVideos.length > 0) {
      console.log('Timeline state:', {
        videoCount: timelineVideos.length,
        totalDuration: calculatedTotalDuration,
        currentTime,
        playheadPosition: playheadPosition + 'px',
        isPlaying
      });
    }
  }, [timelineVideos.length, calculatedTotalDuration, currentTime, playheadPosition, isPlaying]);

  // Scroll to specific time
  const scrollToTime = useCallback((time: number) => {
    if (!timelineRef.current) return;
    
    const timelineWidth = timelineRef.current.scrollWidth;
    const containerWidth = timelineRef.current.clientWidth;
    const scrollPosition = playheadPosition - containerWidth / 2;
    
    timelineRef.current.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    });
  }, [playheadPosition]);

  // Expose scroll function via ref
  useImperativeHandle(ref, () => ({
    scrollToTime,
    updateProgress: (progress: number) => {
      const newTime = progress * calculatedTotalDuration;
      onTimeSeek(newTime);
    }
  }), [scrollToTime, calculatedTotalDuration, onTimeSeek]);

  // Handle timeline click
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 32; // Subtract padding offset
    const sceneWidth = 224 + 16; // Scene width + gap
    
    // Calculate which scene was clicked and the position within it
    const sceneIndex = Math.floor(x / sceneWidth);
    const positionInScene = (x % sceneWidth) / 224; // Position within the scene (0-1)
    
    if (sceneIndex >= 0 && sceneIndex < timelineVideos.length) {
      let accumulatedTime = 0;
      for (let i = 0; i < sceneIndex; i++) {
        accumulatedTime += getSceneDuration(timelineVideos[i]);
      }
      
      const sceneDuration = getSceneDuration(timelineVideos[sceneIndex]);
      const newTime = accumulatedTime + (positionInScene * sceneDuration);
      
      onTimeSeek(Math.max(0, Math.min(newTime, calculatedTotalDuration)));
    }
  };

  // Handle playhead drag
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 32; // Subtract padding offset
    const sceneWidth = 224 + 16; // Scene width + gap
    
    // Calculate which scene and position within it
    const sceneIndex = Math.floor(x / sceneWidth);
    const positionInScene = Math.max(0, Math.min((x % sceneWidth) / 224, 1));
    
    if (sceneIndex >= 0 && sceneIndex < timelineVideos.length) {
      let accumulatedTime = 0;
      for (let i = 0; i < sceneIndex; i++) {
        accumulatedTime += getSceneDuration(timelineVideos[i]);
      }
      
      const sceneDuration = getSceneDuration(timelineVideos[sceneIndex]);
      const newTime = accumulatedTime + (positionInScene * sceneDuration);
      
      onTimeSeek(Math.max(0, Math.min(newTime, calculatedTotalDuration)));
    }
  }, [isDragging, calculatedTotalDuration, onTimeSeek, timelineVideos]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for drag
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

  // Auto-scroll timeline to follow playhead when playing
  useEffect(() => {
    if (isPlaying && timelineRef.current) {
      const containerWidth = timelineRef.current.clientWidth;
      const scrollPosition = playheadPosition - containerWidth / 2;
      timelineRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [isPlaying, playheadPosition]);

  return (
    <div className="bg-gray-50 border-t border-gray-200 h-72 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPlayPause}
              className="text-gray-700 hover:bg-gray-100 h-8 w-8 p-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 bg-gray-300" />

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-400">/</span>
            <span>{formatTime(calculatedTotalDuration)}</span>
          </div>

          <Separator orientation="vertical" className="h-6 bg-gray-300" />

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-500 w-12 text-center">{zoomLevel}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onLayerAdd && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Layer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onLayerAdd('text')}>
                    <Type className="w-4 h-4 mr-2" />
                    Text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLayerAdd('image')}>
                    <Image className="w-4 h-4 mr-2" />
                    Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLayerAdd('shape')}>
                    <Square className="w-4 h-4 mr-2" />
                    Shape
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Separator orientation="vertical" className="h-6 bg-gray-300" />
            </>
          )}

          {onExportVideo && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExportVideo}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Separator orientation="vertical" className="h-6 bg-gray-300" />
            </>
          )}

          {onToggleExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Scene Timeline with Playhead */}
      <div 
        ref={timelineRef}
        className="relative flex-1 p-8 overflow-x-auto overflow-y-hidden cursor-pointer"
        onClick={handleTimelineClick}
      >
        <div className="flex space-x-4 min-w-max">
          {timelineVideos.map((video, index) => {
            const isCurrentVideo = currentVideo?.id === video.id;
            const sceneDuration = getSceneDuration(video);
            const layers = video.layers || [];
            
            return (
              <div key={video.id} className="relative">
                {layers.length > 0 && (
                  <div className="absolute -top-14 left-0 right-0 flex flex-wrap gap-1 justify-center mb-2 z-10">
                    {layers.map((layer) => {
                      const LayerIcon = getLayerIcon(layer.type);
                      const isSelected = selectedLayer?.id === layer.id;
                      
                      return (
                        <button
                          key={layer.id}
                          onClick={() => onLayerSelect?.(layer)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs text-white cursor-pointer transition-all hover:scale-105 ${
                            isSelected ? 'ring-2 ring-white' : ''
                          } ${getLayerColor(layer.type)}`}
                        >
                          <LayerIcon className="w-3 h-3" />
                          <span className="truncate max-w-20">{layer.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div
                  className={`w-56 h-36 bg-white rounded-lg border-2 cursor-pointer transition-all hover:scale-105 overflow-hidden ${
                    isCurrentVideo ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVideoSelect?.(video);
                  }}
                >
                  <div className="relative w-full h-full">
                    {video.thumbnail || video.thumbnailUrl ? (
                      <ImageWithFallback
                        src={video.thumbnail || video.thumbnailUrl || ''}
                        alt={video.name || `Scene ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Film className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 left-2 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded text-sm font-medium">
                      {index + 1}
                    </div>
                    
                    <div className="absolute bottom-2 right-2 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                      {formatTime(sceneDuration)}
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-6 w-6 p-0"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onSceneDuplicate?.(video.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSceneReplaceMedia?.(video.id)}>
                        <Replace className="w-4 h-4 mr-2" />
                        Replace Media
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onSceneDelete?.(video.id)}
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}

          {onAddScene && (
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={onAddScene}
                className="w-56 h-36 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-transparent hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Plus className="w-8 h-8" />
                  <span className="text-sm">Add Scene</span>
                </div>
              </Button>
            </div>
          )}
        </div>

        {/* Vertical Playhead Over Scenes */}
        {timelineVideos.length > 0 && (
          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-0.5 bg-gray-900 cursor-ew-resize z-40 pointer-events-none"
            style={{ left: `${playheadPosition}px` }}
          >
            {/* Diamond-shaped top indicator */}
            <div 
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 cursor-ew-resize pointer-events-auto"
              onMouseDown={handlePlayheadMouseDown}
            />
            
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-900" />
            
            {/* Current Time Indicator */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap shadow-lg font-medium">
              {formatTime(currentTime)}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
            </div>
          </div>
        )}
      </div>


    </div>
  );
});

VideoTimeline.displayName = 'VideoTimeline';