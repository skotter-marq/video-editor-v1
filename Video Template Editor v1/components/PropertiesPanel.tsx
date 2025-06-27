import React, { useState } from 'react';
import { Trash2, Settings, Sliders, Crop, Palette, Volume2, Move, RotateCcw, Edit2 } from 'lucide-react';
import { VideoAsset } from '../types/video';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';

interface PropertiesPanelProps {
  currentVideo: VideoAsset | null;
  onVideoUpdate: (updates: Partial<VideoAsset>) => void;
  onVideoRemove: () => void;
}

export function PropertiesPanel({ 
  currentVideo, 
  onVideoUpdate, 
  onVideoRemove 
}: PropertiesPanelProps) {
  const [transformValues, setTransformValues] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1
  });

  // Default values for reset functionality
  const DEFAULT_VALUES = {
    // Transform
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
    speed: 1,
    // Effects
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    // Audio
    volume: 1,
    muted: false
  };

  // Check if value is different from default
  const isDifferentFromDefault = (key: keyof typeof DEFAULT_VALUES, value: number | boolean) => {
    return value !== DEFAULT_VALUES[key];
  };

  // Reset to default with feedback
  const resetToDefault = (updates: Partial<VideoAsset>) => {
    onVideoUpdate(updates);
    toast.success('Reset to default', {
      duration: 1500,
    });
  };

  // Calculate original duration from the video's base duration
  const getOriginalDuration = () => {
    if (!currentVideo) return 0;
    // The original duration is stored in the video's duration property
    return currentVideo.duration || (currentVideo.position.endTime - currentVideo.position.startTime);
  };

  // Handle speed change with duration adjustment
  const handleSpeedChange = (speed: number) => {
    if (!currentVideo) return;
    
    const originalDuration = getOriginalDuration();
    const newDuration = originalDuration / speed;
    
    // Update both speed and duration
    onVideoUpdate({
      audio: { 
        ...currentVideo.audio, 
        speed: speed 
      },
      position: {
        ...currentVideo.position,
        endTime: currentVideo.position.startTime + newDuration
      }
    });
  };

  // Reset speed to default with duration reset
  const resetSpeedToDefault = () => {
    if (!currentVideo) return;
    
    const originalDuration = getOriginalDuration();
    
    onVideoUpdate({
      audio: { 
        ...currentVideo.audio, 
        speed: DEFAULT_VALUES.speed 
      },
      position: {
        ...currentVideo.position,
        endTime: currentVideo.position.startTime + originalDuration
      }
    });
    
    toast.success('Speed reset to default', {
      duration: 1500,
    });
  };

  if (!currentVideo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Settings className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">No video selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Select a video to view its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-3 h-3 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Properties</h3>
              <p className="text-xs text-muted-foreground">{currentVideo.name}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onVideoRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Properties Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="transform" className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transform" className="flex items-center space-x-1">
                <Move className="w-3 h-3" />
                <span>Transform</span>
              </TabsTrigger>
              <TabsTrigger value="effects" className="flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Effects</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center space-x-1">
                <Volume2 className="w-3 h-3" />
                <span>Audio</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                {/* Transform Tab */}
                <TabsContent value="transform" className="space-y-4 mt-0">
                  {/* Position X */}
                  <div className="space-y-2">
                    <Label className="text-xs">Position X</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.transform?.x ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            transform: { ...currentVideo.transform, x: value }
                          })}
                          min={-500}
                          max={500}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round(currentVideo.transform?.x ?? 0)}
                        </span>
                        {isDifferentFromDefault('x', currentVideo.transform?.x ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              transform: { ...currentVideo.transform, x: DEFAULT_VALUES.x }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Position Y */}
                  <div className="space-y-2">
                    <Label className="text-xs">Position Y</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.transform?.y ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            transform: { ...currentVideo.transform, y: value }
                          })}
                          min={-500}
                          max={500}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round(currentVideo.transform?.y ?? 0)}
                        </span>
                        {isDifferentFromDefault('y', currentVideo.transform?.y ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              transform: { ...currentVideo.transform, y: DEFAULT_VALUES.y }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scale */}
                  <div className="space-y-2">
                    <Label className="text-xs">Scale</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.transform?.scale ?? 1]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            transform: { ...currentVideo.transform, scale: value }
                          })}
                          min={0.1}
                          max={3}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {Math.round((currentVideo.transform?.scale ?? 1) * 100)}%
                        </span>
                        {isDifferentFromDefault('scale', currentVideo.transform?.scale ?? 1) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              transform: { ...currentVideo.transform, scale: DEFAULT_VALUES.scale }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rotation */}
                  <div className="space-y-2">
                    <Label className="text-xs">Rotation</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.transform?.rotation ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            transform: { ...currentVideo.transform, rotation: value }
                          })}
                          min={-180}
                          max={180}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round(currentVideo.transform?.rotation ?? 0)}°
                        </span>
                        {isDifferentFromDefault('rotation', currentVideo.transform?.rotation ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              transform: { ...currentVideo.transform, rotation: DEFAULT_VALUES.rotation }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Opacity */}
                  <div className="space-y-2">
                    <Label className="text-xs">Opacity</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.transform?.opacity ?? 1]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            transform: { ...currentVideo.transform, opacity: value }
                          })}
                          min={0}
                          max={1}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {Math.round((currentVideo.transform?.opacity ?? 1) * 100)}%
                        </span>
                        {isDifferentFromDefault('opacity', currentVideo.transform?.opacity ?? 1) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              transform: { ...currentVideo.transform, opacity: DEFAULT_VALUES.opacity }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Speed - MOVED HERE FROM AUDIO */}
                  <div className="space-y-2">
                    <Label className="text-xs">Speed</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.audio?.speed ?? 1]}
                          onValueChange={([value]) => handleSpeedChange(value)}
                          min={0.25}
                          max={4}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-6 text-right">
                          {(currentVideo.audio?.speed ?? 1).toFixed(2)}x
                        </span>
                        {isDifferentFromDefault('speed', currentVideo.audio?.speed ?? 1) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetSpeedToDefault}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Duration: {Math.round((currentVideo.position.endTime - currentVideo.position.startTime))}s
                    </p>
                  </div>
                </TabsContent>

                {/* Effects Tab */}
                <TabsContent value="effects" className="space-y-4 mt-0">
                  {/* Brightness */}
                  <div className="space-y-2">
                    <Label className="text-xs">Brightness</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.effects?.brightness ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            effects: { ...currentVideo.effects, brightness: value }
                          })}
                          min={-0.5}
                          max={0.5}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round((currentVideo.effects?.brightness ?? 0) * 100)}
                        </span>
                        {isDifferentFromDefault('brightness', currentVideo.effects?.brightness ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              effects: { ...currentVideo.effects, brightness: DEFAULT_VALUES.brightness }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <Label className="text-xs">Contrast</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.effects?.contrast ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            effects: { ...currentVideo.effects, contrast: value }
                          })}
                          min={-0.5}
                          max={0.5}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round((currentVideo.effects?.contrast ?? 0) * 100)}
                        </span>
                        {isDifferentFromDefault('contrast', currentVideo.effects?.contrast ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              effects: { ...currentVideo.effects, contrast: DEFAULT_VALUES.contrast }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Saturation */}
                  <div className="space-y-2">
                    <Label className="text-xs">Saturation</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.effects?.saturation ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            effects: { ...currentVideo.effects, saturation: value }
                          })}
                          min={-1}
                          max={1}
                          step={0.02}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round((currentVideo.effects?.saturation ?? 0) * 100)}
                        </span>
                        {isDifferentFromDefault('saturation', currentVideo.effects?.saturation ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              effects: { ...currentVideo.effects, saturation: DEFAULT_VALUES.saturation }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hue */}
                  <div className="space-y-2">
                    <Label className="text-xs">Hue</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.effects?.hue ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            effects: { ...currentVideo.effects, hue: value }
                          })}
                          min={-180}
                          max={180}
                          step={2}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round(currentVideo.effects?.hue ?? 0)}°
                        </span>
                        {isDifferentFromDefault('hue', currentVideo.effects?.hue ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              effects: { ...currentVideo.effects, hue: DEFAULT_VALUES.hue }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Audio Tab */}
                <TabsContent value="audio" className="space-y-4 mt-0">
                  {/* Volume */}
                  <div className="space-y-2">
                    <Label className="text-xs">Volume</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.audio?.volume ?? 1]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            audio: { ...currentVideo.audio, volume: value }
                          })}
                          min={0}
                          max={2}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {Math.round((currentVideo.audio?.volume ?? 1) * 100)}%
                        </span>
                        {isDifferentFromDefault('volume', currentVideo.audio?.volume ?? 1) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              audio: { ...currentVideo.audio, volume: DEFAULT_VALUES.volume }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mute Toggle */}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Mute</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentVideo.audio?.muted ?? false}
                        onCheckedChange={(checked) => onVideoUpdate({ 
                          audio: { ...currentVideo.audio, muted: checked }
                        })}
                      />
                      {isDifferentFromDefault('muted', currentVideo.audio?.muted ?? false) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetToDefault({ 
                            audio: { ...currentVideo.audio, muted: DEFAULT_VALUES.muted }
                          })}
                          className="h-5 w-5 p-0"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
}