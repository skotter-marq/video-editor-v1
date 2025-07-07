import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProjectSize, VideoAsset, SceneLayer, TextLayerProperties, ImageLayerProperties, ShapeLayerProperties, FrameLayerProperties, FrameProperties } from '../types/video';
import { ProjectSizeSelector } from './ProjectSizeSelector';
import { Button } from './ui/button';
import { Play, Pause, Square, ZoomIn, ZoomOut, Settings, ChevronDown, Palette, Monitor } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { getVideoAnimationStyles, getAnimationKey } from './VideoAnimations';

interface VideoCanvasProps {
  projectSize: ProjectSize;
  currentVideo: VideoAsset | null;
  timelineVideos: VideoAsset[];
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onVideoReady: (duration: number) => void;
  onProjectSizeChange: (size: ProjectSize) => void;
  selectedLayer?: SceneLayer | null;
  onLayerSelect?: (layer: SceneLayer | null) => void;
  onLayerUpdate?: (layerId: string, updates: Partial<SceneLayer>) => void;
  onCanvasDrop?: (e: React.DragEvent) => void;
  onCanvasDragOver?: (e: React.DragEvent) => void;
  zoom?: number;
  onOpenColorPanel?: (color: string, onChange: (color: string) => void) => void;
  onBackgroundColorChange?: (color: string) => void;
}

export function VideoCanvas({
  projectSize,
  currentVideo,
  timelineVideos,
  isPlaying,
  onPlayPause,
  currentTime,
  onTimeUpdate,
  onVideoReady,
  onProjectSizeChange,
  selectedLayer,
  onLayerSelect,
  onLayerUpdate,
  onCanvasDrop,
  onCanvasDragOver,
  zoom = 100,
  onOpenColorPanel,
  onBackgroundColorChange
}: VideoCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [layerPosition, setLayerPosition] = useState({ x: 0, y: 0 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  // Function to get scene duration
  const getSceneDuration = (video: VideoAsset) => {
    return video.frameProperties?.duration || video.duration || 5;
  };

  // Find which scene should be playing at the current time
  const getCurrentScene = () => {
    let accumulatedTime = 0;
    
    for (const video of timelineVideos) {
      const sceneDuration = getSceneDuration(video);
      
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + sceneDuration) {
        // Calculate the local time within this scene
        const sceneTime = currentTime - accumulatedTime;
        return { scene: video, sceneTime };
      }
      
      accumulatedTime += sceneDuration;
    }
    
    // If no scene found, return the last scene or null
    if (timelineVideos.length > 0) {
      const lastScene = timelineVideos[timelineVideos.length - 1];
      const lastSceneDuration = getSceneDuration(lastScene);
      return { scene: lastScene, sceneTime: lastSceneDuration };
    }
    
    return { scene: null, sceneTime: 0 };
  };

  // Get the current scene that should be displayed
  const { scene: currentDisplayScene, sceneTime } = getCurrentScene();
  
  // Use the scene determined by playhead position, falling back to currentVideo
  const displayVideo = currentDisplayScene || currentVideo;
  
  // Debug logging for video state
  useEffect(() => {
    if (displayVideo) {
      console.log('🎬 Canvas state:', {
        currentTime: currentTime.toFixed(2),
        sceneTime: sceneTime.toFixed(2),
        totalVideos: timelineVideos.length,
        currentScene: currentDisplayScene?.name,
        displayVideo: displayVideo?.name,
        hasUrl: !!displayVideo?.url
      });
    }
  }, [currentTime, sceneTime, timelineVideos.length, currentDisplayScene?.name, displayVideo?.name, displayVideo?.url]);
  
  // Get background color from display video or default
  const backgroundColor = displayVideo?.backgroundColor || '#ffffff';

  // Helper function to generate CSS filters from video adjustments
  const generateVideoFilters = (video: VideoAsset) => {
    if (!video?.adjustments) return '';
    
    const { adjustments } = video;
    const filters = [];
    
    // Color Correction filters
    if (adjustments.brightness !== 0) {
      // Convert -100 to 100 range to 0 to 2 range (1 = normal)
      const brightness = (adjustments.brightness + 100) / 100;
      filters.push(`brightness(${brightness})`);
    }
    
    if (adjustments.contrast !== 0) {
      // Convert -100 to 100 range to 0 to 2 range (1 = normal)
      const contrast = (adjustments.contrast + 100) / 100;
      filters.push(`contrast(${contrast})`);
    }
    
    if (adjustments.saturation !== 0) {
      // Convert -100 to 100 range to 0 to 2 range (1 = normal)
      const saturation = (adjustments.saturation + 100) / 100;
      filters.push(`saturate(${saturation})`);
    }
    
    if (adjustments.hue !== 0) {
      // Hue is already in degrees (-180 to 180)
      filters.push(`hue-rotate(${adjustments.hue}deg)`);
    }
    
    if (adjustments.exposure !== 0) {
      // Exposure can be approximated with brightness adjustments
      // Convert -100 to 100 range to additional brightness multiplier
      const exposureBrightness = 1 + (adjustments.exposure / 100);
      filters.push(`brightness(${exposureBrightness})`);
    }
    
    // Effects filters
    if (adjustments.blur > 0) {
      // Convert 0 to 100 range to 0 to 10px blur
      const blurPx = (adjustments.blur / 100) * 10;
      filters.push(`blur(${blurPx}px)`);
    }
    
    if (adjustments.sharpen > 0) {
      // Sharpen can be approximated with contrast
      const sharpenContrast = 1 + (adjustments.sharpen / 100);
      filters.push(`contrast(${sharpenContrast})`);
    }
    
    return filters.length > 0 ? filters.join(' ') : '';
  };

  // Generate current video filters
  const videoFilters = generateVideoFilters(displayVideo || {});

  // Define canvas dimensions
  const canvasWidth = projectSize.width;
  const canvasHeight = projectSize.height;

  // Calculate the scale to fit within container
  const calculateFitScale = () => {
    const { width: containerWidth, height: containerHeight } = containerSize;
    
    // Account for padding and action bar space (now positioned below)
    const horizontalPadding = 48;
    const verticalPadding = 100; // Account for action bar below
    
    const availableWidth = containerWidth - horizontalPadding;
    const availableHeight = containerHeight - verticalPadding;
    
    // Calculate scale factors
    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    
    // Use the smaller scale to ensure it fits completely
    const baseScale = Math.min(scaleX, scaleY);
    
    // Apply zoom as a multiplier, but keep it reasonable
    const finalScale = baseScale * (zoom / 100);
    
    // Ensure minimum scale of 10% and maximum of 200%
    return Math.max(0.1, Math.min(2.0, finalScale));
  };

  const scale = calculateFitScale();

  // Measure container size with improved debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const measureContainer = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    const debouncedMeasure = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(measureContainer, 100);
    };

    // Initial measurement
    measureContainer();
    
    // Set up resize observer for more accurate measurements
    const resizeObserver = new ResizeObserver(debouncedMeasure);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Fallback window resize listener
    window.addEventListener('resize', debouncedMeasure);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedMeasure);
    };
  }, []);

  // Handle video metadata loading
  useEffect(() => {
    if (videoRef.current && displayVideo?.url) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        onVideoReady(video.duration);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [displayVideo?.url, onVideoReady]);

  // Update video time - use scene time within the current scene
  useEffect(() => {
    if (videoRef.current && displayVideo?.url) {
      // Set the video to the correct time within the current scene
      const targetTime = Math.max(0, Math.min(sceneTime, videoRef.current.duration || sceneTime));
      if (Math.abs(videoRef.current.currentTime - targetTime) > 0.1) {
        videoRef.current.currentTime = targetTime;
      }
    }
  }, [sceneTime, displayVideo?.url]);

  // Handle play/pause
  useEffect(() => {
    if (videoRef.current && displayVideo?.url) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, displayVideo?.url]);

  // Handle video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current && displayVideo) {
      // Calculate the absolute time in the project timeline
      let accumulatedTime = 0;
      for (const video of timelineVideos) {
        if (video.id === displayVideo.id) {
          const absoluteTime = accumulatedTime + videoRef.current.currentTime;
          onTimeUpdate(absoluteTime);
          break;
        }
        accumulatedTime += getSceneDuration(video);
      }
    }
  };

  // Layer drag handlers
  const handleLayerMouseDown = (e: React.MouseEvent, layer: SceneLayer) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (onLayerSelect) {
      onLayerSelect(layer);
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const layerRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate offset from mouse to layer's top-left corner
    const offsetX = e.clientX - layerRect.left;
    const offsetY = e.clientY - layerRect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDraggingLayer(true);
    
    // Set initial position
    setLayerPosition({
      x: layer.x || 0,
      y: layer.y || 0
    });
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingLayer || !selectedLayer || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate new position relative to canvas, accounting for drag offset and scale
    const newX = (e.clientX - rect.left - dragOffset.x) / scale;
    const newY = (e.clientY - rect.top - dragOffset.y) / scale;
    
    setLayerPosition({ x: newX, y: newY });
  }, [isDraggingLayer, selectedLayer, dragOffset, scale]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isDraggingLayer && selectedLayer && onLayerUpdate && displayVideo) {
      // Only update if the selected layer belongs to the currently displayed scene
      const layerBelongsToCurrentScene = displayVideo.layers?.some(layer => layer.id === selectedLayer.id);
      if (layerBelongsToCurrentScene) {
        onLayerUpdate(selectedLayer.id, {
          x: layerPosition.x,
          y: layerPosition.y
        });
      }
    }
    setIsDraggingLayer(false);
  }, [isDraggingLayer, selectedLayer, layerPosition, onLayerUpdate, displayVideo]);

  // Text editing handlers
  const handleLayerDoubleClick = (layer: SceneLayer) => {
    if (layer.type === 'text') {
      setIsEditingText(true);
      setEditingLayerId(layer.id);
      
      const textProps = layer.properties as TextLayerProperties;
      setEditingText(textProps?.text || '');
    }
  };

  const handleTextEditComplete = () => {
    if (editingLayerId && onLayerUpdate && editingText.trim() && displayVideo) {
      // Only update if the layer belongs to the currently displayed scene
      const layerBelongsToCurrentScene = displayVideo.layers?.some(layer => layer.id === editingLayerId);
      if (layerBelongsToCurrentScene) {
        onLayerUpdate(editingLayerId, {
          properties: {
            ...selectedLayer?.properties,
            text: editingText
          } as TextLayerProperties
        });
      }
    }
    setIsEditingText(false);
    setEditingLayerId(null);
    setEditingText('');
  };

  const handleTextEditCancel = () => {
    setIsEditingText(false);
    setEditingLayerId(null);
    setEditingText('');
  };

  // Canvas click handler (deselect layers)
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas, not on a layer
    if (e.target === e.currentTarget && onLayerSelect) {
      onLayerSelect(null);
    }
  };

  // Render layer content based on type
  const renderLayerContent = (layer: SceneLayer) => {
    const isSelected = selectedLayer?.id === layer.id;
    const isBeingDragged = isDraggingLayer && isSelected;
    
    // Use dragging position if being dragged, otherwise use layer position
    const x = isBeingDragged ? layerPosition.x : (layer.x || 0);
    const y = isBeingDragged ? layerPosition.y : (layer.y || 0);

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: x,
      top: y,
      transform: `rotate(${layer.rotation || 0}deg) scale(${layer.scale || 1})`,
      opacity: layer.opacity || 1,
      cursor: isDraggingLayer ? 'grabbing' : 'grab',
      zIndex: isSelected ? 1000 : layer.zIndex || 1,
      pointerEvents: 'auto'
    };

    // Get animation styles - use scene time for current scene's layers
    const animationStyles = getVideoAnimationStyles(layer, sceneTime);

    switch (layer.type) {
      case 'text':
        const textProps = layer.properties as TextLayerProperties;
        const isEditing = isEditingText && editingLayerId === layer.id;
        
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              ...animationStyles,
              fontFamily: textProps?.fontFamily || 'Arial',
              fontSize: `${textProps?.fontSize || 24}px`,
              color: textProps?.color || '#000000',
              fontWeight: textProps?.fontWeight || 'normal',
              textAlign: (textProps?.textAlign as 'left' | 'center' | 'right') || 'left',
              border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
              padding: '4px',
              minWidth: '100px',
              minHeight: '30px',
              borderRadius: '4px'
            }}
            onMouseDown={(e) => !isEditing && handleLayerMouseDown(e, layer)}
            onDoubleClick={() => handleLayerDoubleClick(layer)}
          >
            {isEditing ? (
              <Input
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={handleTextEditComplete}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTextEditComplete();
                  if (e.key === 'Escape') handleTextEditCancel();
                }}
                autoFocus
                className="border-0 p-0 bg-transparent text-inherit"
                style={{ 
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  color: 'inherit',
                  fontWeight: 'inherit',
                  textAlign: 'inherit'
                }}
              />
            ) : (
              textProps?.text || 'Text Layer'
            )}
          </div>
        );

      case 'image':
        const imageProps = layer.properties as ImageLayerProperties;
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              ...animationStyles,
              width: imageProps?.width || 200,
              height: imageProps?.height || 200,
              border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer)}
          >
            <ImageWithFallback
              src={imageProps?.src || ''}
              alt={layer.name}
              className="w-full h-full object-cover"
            />
          </div>
        );

      case 'shape':
        const shapeProps = layer.properties as ShapeLayerProperties;
        const shapeType = shapeProps?.shapeType || 'rectangle';
        
        let shapeElement;
        
        if (shapeType === 'circle') {
          shapeElement = (
            <div
              className="w-full h-full rounded-full"
              style={{ 
                backgroundColor: shapeProps?.fillColor || '#3b82f6',
                border: shapeProps?.strokeWidth ? `${shapeProps.strokeWidth}px solid ${shapeProps.strokeColor || '#000000'}` : 'none'
              }}
            />
          );
        } else if (shapeType === 'triangle') {
          shapeElement = (
            <div
              className="w-0 h-0"
              style={{
                borderLeft: `${(shapeProps?.width || 100) / 2}px solid transparent`,
                borderRight: `${(shapeProps?.width || 100) / 2}px solid transparent`,
                borderBottom: `${shapeProps?.height || 100}px solid ${shapeProps?.fillColor || '#3b82f6'}`,
              }}
            />
          );
        } else {
          // Rectangle (default)
          shapeElement = (
            <div
              className="w-full h-full"
              style={{ 
                backgroundColor: shapeProps?.fillColor || '#3b82f6',
                border: shapeProps?.strokeWidth ? `${shapeProps.strokeWidth}px solid ${shapeProps.strokeColor || '#000000'}` : 'none',
                borderRadius: shapeProps?.borderRadius || 0
              }}
            />
          );
        }

        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              ...animationStyles,
              width: shapeProps?.width || 100,
              height: shapeProps?.height || 100,
              border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
              borderRadius: '4px'
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer)}
          >
            {shapeElement}
          </div>
        );

      case 'video':
        const videoProps = layer.properties as any; // Define video layer properties as needed
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              ...animationStyles,
              width: videoProps?.width || 320,
              height: videoProps?.height || 180,
              border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer)}
          >
            <video
              src={videoProps?.src || ''}
              className="w-full h-full object-cover"
              muted
              loop
            />
          </div>
        );

      default:
        return null;
    }
  };

  const scaledWidth = Math.round(canvasWidth * scale);
  const scaledHeight = Math.round(canvasHeight * scale);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-gray-100 w-full"
        style={{ minHeight: 0, minWidth: 0 }}
      >
        <div className="flex flex-col items-center">
          {/* Canvas with white background and shadow */}
          <div
            className="bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden"
            style={{
              width: scaledWidth,
              height: scaledHeight,
            }}
          >
            <div
              ref={canvasRef}
              className="relative overflow-hidden cursor-crosshair"
              style={{ 
                backgroundColor,
                width: scaledWidth,
                height: scaledHeight,
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onDrop={onCanvasDrop}
              onDragOver={onCanvasDragOver}
            >
              {/* Video Element (shows current scene based on playhead position) */}
              {displayVideo?.url ? (
                <div 
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                  style={{
                    transform: displayVideo.transform ? `
                      translate(${displayVideo.transform.x}px, ${displayVideo.transform.y}px) 
                      scale(${displayVideo.transform.scale}) 
                      rotate(${displayVideo.transform.rotation}deg)
                    ` : undefined,
                    opacity: displayVideo.transform?.opacity || 1
                  }}
                >
                  <video
                    ref={videoRef}
                    src={displayVideo.url}
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onError={(e) => {
                      console.error('❌ Video error for:', displayVideo.name, e.currentTarget.error);
                    }}
                    onLoadStart={() => {
                      console.log('📍 Video load started for:', displayVideo.name);
                    }}
                    onLoadedData={() => {
                      console.log('✅ Video loaded data for:', displayVideo.name);
                    }}
                    onCanPlay={() => {
                      console.log('▶️ Video can play:', displayVideo.name);
                    }}
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    style={{ 
                      pointerEvents: 'none',
                      filter: videoFilters
                    }}
                  />
                  
                  {/* Vignette Effect Overlay */}
                  {displayVideo?.adjustments?.vignette > 0 && (
                    <div 
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${(displayVideo.adjustments.vignette / 100) * 0.7}) 100%)`,
                        mixBlendMode: 'multiply'
                      }}
                    />
                  )}
                  
                  {/* Noise Effect Overlay */}
                  {displayVideo?.adjustments?.noise > 0 && (
                    <div 
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{
                        opacity: displayVideo.adjustments.noise / 100,
                        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'overlay'
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-500">
                    <div className="text-lg mb-2">🎬</div>
                    <div className="text-sm">
                      {displayVideo ? `No video URL for "${displayVideo.name}"` : 'Select a video from timeline'}
                    </div>
                    {displayVideo && (
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {displayVideo.id}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Render Layers from current scene with proper scaling */}
              <div 
                className="absolute inset-0"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left'
                }}
              >
                {displayVideo?.layers?.map((layer) => renderLayerContent(layer))}
              </div>
            </div>
          </div>

          {/* Action Bar - Positioned directly under the canvas */}
          <div className="mt-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 px-3 py-2 flex items-center space-x-4">
              {/* Project Size Selector - Compact version */}
              <ProjectSizeSelector
                currentSize={projectSize}
                onSizeChange={onProjectSizeChange}
                autoOpen={false}
                compact={true}
              />

              {/* Background Button */}
              <Button
                variant="ghost"
                className="h-8 px-2 bg-transparent hover:bg-gray-100 text-gray-900 border-0 shadow-none rounded-lg"
                onClick={() => {
                  if (onOpenColorPanel) {
                    onOpenColorPanel(backgroundColor, (color) => {
                      if (onBackgroundColorChange) {
                        onBackgroundColorChange(color);
                      }
                    });
                  }
                }}
              >
                <div className="flex items-center space-x-1.5">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: backgroundColor }}
                  />
                  <span className="text-xs font-medium">Background</span>
                </div>
              </Button>

              {/* Settings Button */}
              <DropdownMenu open={showSettingsMenu} onOpenChange={setShowSettingsMenu}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 bg-transparent hover:bg-gray-100 text-gray-900 border-0 shadow-none rounded-lg"
                  >
                    <div className="flex items-center space-x-1.5">
                      <Settings className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-medium">Settings</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" sideOffset={8}>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Project Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Zoom: {Math.round(scale * 100)}%
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onPlayPause}>
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}