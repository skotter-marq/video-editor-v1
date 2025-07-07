import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Type, 
  Image, 
  Square, 
  Film,
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { VideoAsset, SceneLayer, LayerType } from '../types/video';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface SceneManagerProps {
  timelineVideos: VideoAsset[];
  currentVideo: VideoAsset | null;
  onVideoSelect: (video: VideoAsset) => void;
  selectedLayer: SceneLayer | null;
  onLayerSelect: (layer: SceneLayer | null) => void;
  onLayerUpdate: (layerId: string, updates: Partial<SceneLayer>) => void;
  onVideoUpdate: (updates: Partial<VideoAsset>) => void;
  onLayerCreate?: (layer: SceneLayer) => void; // Add this prop to use App.tsx's layer creation
  onVideoRemove: () => void; // Add video removal handler
}

export function SceneManager({ 
  timelineVideos = [], // Add default fallback
  currentVideo, 
  onVideoSelect,
  selectedLayer,
  onLayerSelect,
  onLayerUpdate,
  onVideoUpdate,
  onLayerCreate, // Add this to props
  onVideoRemove // Add video removal handler
}: SceneManagerProps) {
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure timelineVideos is always an array
  const safeTimelineVideos = Array.isArray(timelineVideos) ? timelineVideos : [];

  // Toggle scene expansion
  const toggleSceneExpansion = (sceneId: string) => {
    setExpandedScenes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sceneId)) {
        newSet.delete(sceneId);
      } else {
        newSet.add(sceneId);
      }
      return newSet;
    });
  };

  // Generate unique layer ID
  const generateLayerId = () => {
    return `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // FIXED: Create a new layer with FULL scene duration timing
  const createLayer = (type: LayerType, name: string): SceneLayer => {
    if (!currentVideo) throw new Error('No current video selected');

    // FIXED: Calculate full scene duration instead of partial duration
    const sceneDuration = currentVideo.duration || (currentVideo.position?.endTime - currentVideo.position?.startTime) || 10; // Fallback to 10s

    // FIXED: Use full scene duration for all new layers (0 to full duration)
    const startTime = 0;
    const endTime = sceneDuration; // CHANGED: Use full scene duration instead of defaultDuration
    const duration = sceneDuration; // CHANGED: Duration is now full scene duration

    // Get next z-index - ensure layers array exists
    const existingLayers = Array.isArray(currentVideo.layers) ? currentVideo.layers : [];
    const maxZIndex = existingLayers.length > 0 ? Math.max(...existingLayers.map(l => l.transform?.zIndex || 0)) : 0;

    const baseLayer: SceneLayer = {
      id: generateLayerId(),
      type,
      name,
      visible: true,
      locked: false,
      transform: {
        x: 100,
        y: 100,
        width: 300,
        height: 100,
        rotation: 0,
        opacity: 1,
        zIndex: maxZIndex + 1
      },
      timing: {
        startTime,
        endTime,
        duration // FIXED: Now uses full scene duration
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // DEBUGGING: Log the layer timing to confirm full duration
    console.log('SceneManager: Creating layer with FULL duration:', {
      layerName: name,
      sceneDuration,
      layerTiming: baseLayer.timing
    });

    // Add type-specific properties
    switch (type) {
      case 'text':
        return {
          ...baseLayer,
          properties: {
            text: 'Sample Text',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 'normal',
            color: '#000000',
            alignment: 'left',
            backgroundColor: 'transparent'
          }
        };
      case 'image':
        return {
          ...baseLayer,
          properties: {
            src: 'https://via.placeholder.com/300x200',
            alt: 'Sample Image',
            fit: 'cover'
          }
        };
      case 'shape':
        return {
          ...baseLayer,
          properties: {
            type: 'rectangle',
            fill: '#ff6b6b',
            stroke: '#ffffff',
            strokeWidth: 2
          }
        };
      case 'video':
        return {
          ...baseLayer,
          properties: {
            src: '',
            startTime: 0,
            endTime: sceneDuration,
            volume: 1,
            muted: false
          }
        };
      default:
        return baseLayer;
    }
  };

  // UPDATED: Add layer to current video - use App.tsx's handleLayerCreate if available
  const addLayer = (type: LayerType, name: string) => {
    // Check if we have the required functions and current video
    if (!currentVideo) {
      console.warn('No current video selected for adding layer');
      return;
    }

    try {
      const newLayer = createLayer(type, name);
      
      console.log('🎨 SceneManager: Adding layer:', {
        layerType: type,
        layerName: name,
        newLayerId: newLayer.id,
        currentVideoId: currentVideo.id,
        newLayerTiming: newLayer.timing, // Log the timing to verify full duration
        sceneDuration: currentVideo.duration
      });
      
      // UPDATED: Use App.tsx's layer creation if available (preferred method)
      if (onLayerCreate) {
        console.log('Using App.tsx handleLayerCreate for consistency');
        onLayerCreate(newLayer);
      } else {
        // Fallback to direct video update if onLayerCreate is not available
        console.log('Using direct video update as fallback');
        if (!onVideoUpdate || !onLayerSelect) {
          console.warn('Required callbacks not available for adding layer');
          return;
        }

        const existingLayers = Array.isArray(currentVideo.layers) ? currentVideo.layers : [];
        const updatedLayers = [...existingLayers, newLayer];
        
        // Update the video with the new layer
        onVideoUpdate({
          layers: updatedLayers
        });

        // Auto-select the new layer
        onLayerSelect(newLayer);
      }
      
      console.log('✅ SceneManager: Layer added successfully with full duration');
    } catch (error) {
      console.error('❌ SceneManager: Error adding layer:', error);
    }
  };

  // Delete layer
  const deleteLayer = (layerId: string) => {
    if (!currentVideo || !onVideoUpdate) return;

    try {
      const existingLayers = Array.isArray(currentVideo.layers) ? currentVideo.layers : [];
      const updatedLayers = existingLayers.filter(layer => layer.id !== layerId);
      onVideoUpdate({
        layers: updatedLayers
      });

      // Clear selection if deleted layer was selected
      if (selectedLayer?.id === layerId && onLayerSelect) {
        onLayerSelect(null);
      }
    } catch (error) {
      console.error('Error deleting layer:', error);
    }
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layerId: string) => {
    if (!currentVideo || !onLayerUpdate) return;
    
    try {
      const existingLayers = Array.isArray(currentVideo.layers) ? currentVideo.layers : [];
      const layer = existingLayers.find(l => l.id === layerId);
      if (layer) {
        onLayerUpdate(layerId, { 
          visible: !layer.visible,
          updatedAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Error toggling layer visibility:', error);
    }
  };

  // Toggle layer lock
  const toggleLayerLock = (layerId: string) => {
    if (!currentVideo || !onLayerUpdate) return;
    
    try {
      const existingLayers = Array.isArray(currentVideo.layers) ? currentVideo.layers : [];
      const layer = existingLayers.find(l => l.id === layerId);
      if (layer) {
        onLayerUpdate(layerId, { 
          locked: !layer.locked,
          updatedAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Error toggling layer lock:', error);
    }
  };

  // Get layer type icon
  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'text': return Type;
      case 'image': return Image;
      case 'shape': return Square;
      case 'video': return Film;
      default: return Square;
    }
  };

  // Get layer type color
  const getLayerTypeColor = (type: LayerType): string => {
    switch (type) {
      case 'text': return 'text-emerald-600';
      case 'image': return 'text-blue-600';
      case 'video': return 'text-red-600';
      case 'shape': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (!seconds || typeof seconds !== 'number' || isNaN(seconds)) {
      return '0.0s';
    }
    
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Scene Manager</h3>
          <Badge variant="secondary" className="text-xs">
            {safeTimelineVideos.length} scenes
          </Badge>
        </div>
        
        {currentVideo && (
          <div className="text-sm text-muted-foreground">
            Editing: {currentVideo.name || 'Untitled Scene'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {safeTimelineVideos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">
                  No scenes in timeline yet.
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Add videos from the Uploads tab.
                </div>
              </div>
            ) : (
              safeTimelineVideos.map((video, index) => {
                if (!video || !video.id) {
                  return null; // Skip invalid video objects
                }

                const isExpanded = expandedScenes.has(video.id);
                const isCurrentVideo = currentVideo?.id === video.id;
                const layers = Array.isArray(video.layers) ? video.layers : [];
                
                return (
                  <div key={video.id} className="space-y-2">
                    {/* Scene Header */}
                    <div 
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isCurrentVideo 
                          ? 'bg-primary/5 border-primary' 
                          : 'bg-muted/50 border-border hover:bg-muted'
                      }`}
                      onClick={() => onVideoSelect && onVideoSelect(video)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSceneExpansion(video.id);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <div className="w-12 h-8 bg-background rounded border border-border flex items-center justify-center">
                            <Film className="w-4 h-4 text-muted-foreground" />
                          </div>
                          
                          <div>
                            <div className="font-medium text-sm">
                              Scene {index + 1}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(video.duration)} • {layers.length} layers
                            </div>
                          </div>
                        </div>
                        
                        {isCurrentVideo && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Expanded Scene Content */}
                    {isExpanded && (
                      <div className="ml-6 space-y-2">
                        {/* Add Layer Buttons - Show even if not current video but with different styling */}
                        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                          {!isCurrentVideo && (
                            <div className="w-full text-xs text-muted-foreground mb-2 flex items-center gap-2">
                              <Film className="w-3 h-3" />
                              Select this scene first to add layers
                            </div>
                          )}
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addLayer('text', 'Text Layer')}
                                  className="h-8"
                                  disabled={!isCurrentVideo || !onVideoUpdate}
                                >
                                  <Type className="w-4 h-4 mr-1" />
                                  Text
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {isCurrentVideo 
                                    ? `Add text layer with ${currentVideo ? formatTime(currentVideo.duration) : 'full'} duration` // UPDATED: Show full duration
                                    : 'Select this scene first to add text layer'
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addLayer('image', 'Image Layer')}
                                  className="h-8"
                                  disabled={!isCurrentVideo || !onVideoUpdate}
                                >
                                  <Image className="w-4 h-4 mr-1" />
                                  Image
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {isCurrentVideo 
                                    ? `Add image layer with ${currentVideo ? formatTime(currentVideo.duration) : 'full'} duration` // UPDATED: Show full duration
                                    : 'Select this scene first to add image layer'
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addLayer('shape', 'Shape Layer')}
                                  className="h-8"
                                  disabled={!isCurrentVideo || !onVideoUpdate}
                                >
                                  <Square className="w-4 h-4 mr-1" />
                                  Shape
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {isCurrentVideo 
                                    ? `Add shape layer with ${currentVideo ? formatTime(currentVideo.duration) : 'full'} duration` // UPDATED: Show full duration
                                    : 'Select this scene first to add shape layer'
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Layers List */}
                        {layers.length > 0 ? (
                          <div className="space-y-1">
                            {layers
                              .filter(layer => layer && layer.id) // Filter out invalid layers
                              .sort((a, b) => (b.transform?.zIndex || 0) - (a.transform?.zIndex || 0))
                              .map((layer) => {
                                const LayerIcon = getLayerIcon(layer.type);
                                const isSelected = selectedLayer?.id === layer.id;
                                
                                return (
                                  <div
                                    key={layer.id}
                                    className={`group flex items-center space-x-2 p-2 rounded border cursor-pointer transition-all duration-200 ${
                                      isSelected 
                                        ? 'bg-primary/10 border-primary' 
                                        : 'bg-background border-border hover:bg-muted/50'
                                    }`}
                                    onClick={() => onLayerSelect && onLayerSelect(layer)}
                                  >
                                    <LayerIcon className={`w-4 h-4 ${getLayerTypeColor(layer.type)}`} />
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium truncate">
                                        {layer.name || 'Untitled Layer'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {layer.timing ? (
                                          <>
                                            {formatTime(layer.timing.startTime)} - {formatTime(layer.timing.endTime)} 
                                            <span className="ml-1">({formatTime(layer.timing.duration)})</span>
                                          </>
                                        ) : (
                                          'No timing set'
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLayerVisibility(layer.id);
                                              }}
                                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                              disabled={!onLayerUpdate}
                                            >
                                              {layer.visible ? (
                                                <Eye className="w-3 h-3" />
                                              ) : (
                                                <EyeOff className="w-3 h-3 opacity-50" />
                                              )}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{layer.visible ? 'Hide' : 'Show'} layer</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLayerLock(layer.id);
                                              }}
                                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                              disabled={!onLayerUpdate}
                                            >
                                              {layer.locked ? (
                                                <Lock className="w-3 h-3 opacity-50" />
                                              ) : (
                                                <Unlock className="w-3 h-3" />
                                              )}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{layer.locked ? 'Unlock' : 'Lock'} layer</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={!onVideoUpdate}
                                          >
                                            <MoreHorizontal className="w-3 h-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteLayer(layer.id);
                                            }}
                                            className="text-destructive"
                                            disabled={!onVideoUpdate}
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Layer
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            {isCurrentVideo 
                              ? 'No layers yet. Click buttons above to add layers.'
                              : 'No layers in this scene. Select it to add layers.'
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}