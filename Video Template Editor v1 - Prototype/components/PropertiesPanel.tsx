import React, { useState } from 'react';
import { VideoAsset, SceneLayer } from '../types/video';
import { LayerPropertiesPanel } from './LayerPropertiesPanel';
import { ProjectSizeSelector } from './ProjectSizeSelector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { 
  Film, 
  Volume2, 
  Eye, 
  Trash2, 
  Settings,
  ChevronDown,
  ChevronRight,
  Play,
  Scissors,
  Info,
  RotateCcw
} from 'lucide-react';

interface PropertiesPanelProps {
  currentVideo: VideoAsset | null;
  onVideoUpdate: (updates: Partial<VideoAsset>) => void;
  onVideoRemove: () => void;
  selectedLayer: SceneLayer | null;
  onLayerUpdate: (layerId: string, updates: Partial<SceneLayer>) => void;
}

// Mini reset button component
const MiniResetButton = ({ onClick, hasChanged }: { onClick: () => void; hasChanged: boolean }) => {
  if (!hasChanged) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
    >
      <RotateCcw className="w-3 h-3" />
    </Button>
  );
};

export function PropertiesPanel({ 
  currentVideo, 
  onVideoUpdate, 
  onVideoRemove, 
  selectedLayer, 
  onLayerUpdate 
}: PropertiesPanelProps) {
  // Collapsible sections state - Transform and Effects open by default for video layers
  const [openSections, setOpenSections] = useState({
    timing: false,
    transform: true, // Open by default for video layers
    effects: true,   // Open by default for video layers
    audio: false,
    properties: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // If a layer is selected, show the layer properties panel
  if (selectedLayer) {
    return (
      <LayerPropertiesPanel
        layer={selectedLayer}
        onLayerUpdate={onLayerUpdate}
        currentVideo={currentVideo}
        onVideoUpdate={onVideoUpdate}
      />
    );
  }

  // If no video is selected, show empty state
  if (!currentVideo) {
    return (
      <div className="h-full flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-3 h-3 text-primary" />
            </div>
            <h3 className="font-medium">Properties</h3>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">No scene selected</p>
              <p className="text-xs text-muted-foreground mt-1">Select a scene from the timeline to edit its properties</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions to check if values have changed from defaults
  const hasTimingChanges = (video: VideoAsset) => {
    return (video.position?.startTime || 0) !== 0 || 
           (video.position?.endTime || video.duration) !== video.duration;
  };

  const hasPositionXChanged = (video: VideoAsset) => video.transform.x !== 0;
  const hasPositionYChanged = (video: VideoAsset) => video.transform.y !== 0;
  const hasScaleChanged = (video: VideoAsset) => video.transform.scale !== 1;
  const hasRotationChanged = (video: VideoAsset) => video.transform.rotation !== 0;
  const hasOpacityChanged = (video: VideoAsset) => video.transform.opacity !== 1;
  const hasBrightnessChanged = (video: VideoAsset) => (video.effects?.brightness || 0) !== 0;
  const hasContrastChanged = (video: VideoAsset) => (video.effects?.contrast || 0) !== 0;
  const hasSaturationChanged = (video: VideoAsset) => (video.effects?.saturation || 0) !== 0;
  const hasHueChanged = (video: VideoAsset) => (video.effects?.hue || 0) !== 0;
  const hasVolumeChanged = (video: VideoAsset) => (video.audio?.volume || 1) !== 1;
  const hasSpeedChanged = (video: VideoAsset) => (video.audio?.speed || 1) !== 1;
  const hasMutedChanged = (video: VideoAsset) => (video.audio?.muted || false) !== false;

  // Reset functions
  const resetTiming = () => {
    onVideoUpdate({
      position: {
        startTime: 0,
        endTime: currentVideo.duration
      }
    });
  };

  const resetPositionX = () => {
    onVideoUpdate({
      transform: {
        ...currentVideo.transform,
        x: 0
      }
    });
  };

  const resetPositionY = () => {
    onVideoUpdate({
      transform: {
        ...currentVideo.transform,
        y: 0
      }
    });
  };

  const resetScale = () => {
    onVideoUpdate({
      transform: {
        ...currentVideo.transform,
        scale: 1
      }
    });
  };

  const resetRotation = () => {
    onVideoUpdate({
      transform: {
        ...currentVideo.transform,
        rotation: 0
      }
    });
  };

  const resetOpacity = () => {
    onVideoUpdate({
      transform: {
        ...currentVideo.transform,
        opacity: 1
      }
    });
  };

  const resetBrightness = () => {
    onVideoUpdate({
      effects: {
        ...currentVideo.effects,
        brightness: 0
      }
    });
  };

  const resetContrast = () => {
    onVideoUpdate({
      effects: {
        ...currentVideo.effects,
        contrast: 0
      }
    });
  };

  const resetSaturation = () => {
    onVideoUpdate({
      effects: {
        ...currentVideo.effects,
        saturation: 0
      }
    });
  };

  const resetHue = () => {
    onVideoUpdate({
      effects: {
        ...currentVideo.effects,
        hue: 0
      }
    });
  };

  const resetVolume = () => {
    onVideoUpdate({
      audio: {
        ...currentVideo.audio,
        volume: 1
      }
    });
  };

  const resetSpeed = () => {
    onVideoUpdate({
      audio: {
        ...currentVideo.audio,
        speed: 1
      }
    });
  };

  const resetMuted = () => {
    onVideoUpdate({
      audio: {
        ...currentVideo.audio,
        muted: false
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{currentVideo.name}</h3>
            <p className="text-xs text-muted-foreground">Background Video</p>
          </div>
          <Badge variant="outline" className="text-xs">
            Scene
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-1 mt-3">
          <Button variant="outline" size="sm" className="flex-1">
            <Play className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={onVideoRemove}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Properties Sections */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Transform Section */}
          <Collapsible open={openSections.transform} onOpenChange={() => toggleSection('transform')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Transform</span>
                </div>
                {openSections.transform ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Position with Sliders */}
              <div className="space-y-3">
                <Label>Position</Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">X Position</Label>
                      <MiniResetButton onClick={resetPositionX} hasChanged={hasPositionXChanged(currentVideo)} />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Slider
                        value={[currentVideo.transform.x]}
                        onValueChange={([value]) => onVideoUpdate({
                          transform: {
                            ...currentVideo.transform,
                            x: value
                          }
                        })}
                        min={-500}
                        max={500}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={currentVideo.transform.x}
                        onChange={(e) => onVideoUpdate({
                          transform: {
                            ...currentVideo.transform,
                            x: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-16"
                        min={-500}
                        max={500}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Y Position</Label>
                      <MiniResetButton onClick={resetPositionY} hasChanged={hasPositionYChanged(currentVideo)} />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Slider
                        value={[currentVideo.transform.y]}
                        onValueChange={([value]) => onVideoUpdate({
                          transform: {
                            ...currentVideo.transform,
                            y: value
                          }
                        })}
                        min={-500}
                        max={500}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={currentVideo.transform.y}
                        onChange={(e) => onVideoUpdate({
                          transform: {
                            ...currentVideo.transform,
                            y: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-16"
                        min={-500}
                        max={500}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scale */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Scale</Label>
                  <MiniResetButton onClick={resetScale} hasChanged={hasScaleChanged(currentVideo)} />
                </div>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[currentVideo.transform.scale * 100]}
                    onValueChange={([value]) => onVideoUpdate({
                      transform: {
                        ...currentVideo.transform,
                        scale: value / 100
                      }
                    })}
                    min={10}
                    max={500}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round(currentVideo.transform.scale * 100)}
                    onChange={(e) => onVideoUpdate({
                      transform: {
                        ...currentVideo.transform,
                        scale: (parseInt(e.target.value) || 100) / 100
                      }
                    })}
                    className="w-16"
                    min={10}
                    max={500}
                  />
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Rotation</Label>
                  <MiniResetButton onClick={resetRotation} hasChanged={hasRotationChanged(currentVideo)} />
                </div>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[currentVideo.transform.rotation]}
                    onValueChange={([value]) => onVideoUpdate({
                      transform: {
                        ...currentVideo.transform,
                        rotation: value
                      }
                    })}
                    min={-180}
                    max={180}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentVideo.transform.rotation}
                    onChange={(e) => onVideoUpdate({
                      transform: {
                        ...currentVideo.transform,
                        rotation: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-16"
                    min={-180}
                    max={180}
                  />
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Opacity</Label>
                  <MiniResetButton onClick={resetOpacity} hasChanged={hasOpacityChanged(currentVideo)} />
                </div>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[currentVideo.transform.opacity * 100]}
                    onValueChange={([value]) => onVideoUpdate({
                      transform: {
                        ...currentVideo.transform,
                        opacity: value / 100
                      }
                    })}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round(currentVideo.transform.opacity * 100)}
                    onChange={(e) => onVideoUpdate({
                      transform: {
                        ...currentVideo.transform,
                        opacity: (parseInt(e.target.value) || 100) / 100
                      }
                    })}
                    className="w-16"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Effects Section */}
          <Collapsible open={openSections.effects} onOpenChange={() => toggleSection('effects')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Effects</span>
                </div>
                {openSections.effects ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Brightness</Label>
                  <MiniResetButton onClick={resetBrightness} hasChanged={hasBrightnessChanged(currentVideo)} />
                </div>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[currentVideo.effects?.brightness || 0]}
                    onValueChange={([value]) => onVideoUpdate({
                      effects: {
                        ...currentVideo.effects,
                        brightness: value
                      }
                    })}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentVideo.effects?.brightness || 0}
                    onChange={(e) => onVideoUpdate({
                      effects: {
                        ...currentVideo.effects,
                        brightness: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-16"
                    min={-100}
                    max={100}
                  />
                </div>
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Contrast</Label>
                  <MiniResetButton onClick={resetContrast} hasChanged={hasContrastChanged(currentVideo)} />
                </div>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[currentVideo.effects?.contrast || 0]}
                    onValueChange={([value]) => onVideoUpdate({
                      effects: {
                        ...currentVideo.effects,
                        contrast: value
                      }
                    })}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentVideo.effects?.contrast || 0}
                    onChange={(e) => onVideoUpdate({
                      effects: {
                        ...currentVideo.effects,
                        contrast: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-16"
                    min={-100}
                    max={100}
                  />
                </div>
              </div>

              {/* Saturation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Saturation</Label>
                  <MiniResetButton onClick={resetSaturation} hasChanged={hasSaturationChanged(currentVideo)} />
                </div>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[currentVideo.effects?.saturation || 0]}
                    onValueChange={([value]) => onVideoUpdate({
                      effects: {
                        ...currentVideo.effects,
                        saturation: value
                      }
                    })}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentVideo.effects?.saturation || 0}
                    onChange={(e) => onVideoUpdate({
                      effects: {
                        ...currentVideo.effects,
                        saturation: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-16"
                    min={-100}
                    max={100}
                  />
                </div>
              </div>

              {/* Hue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Hue</Label>
                  <MiniResetButton onClick={resetHue} hasChanged={hasHueChanged(currentVideo)} />
                </div>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[currentVideo.effects?.hue || 0]}
                    onValueChange={([value]) => onVideoUpdate({
                      effects: {
                        ...currentVideo.effects,
                        hue: value
                      }
                    })}
                    min={-180}
                    max={180}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentVideo.effects?.hue || 0}
                    onChange={(e) => onVideoUpdate({
                      effects: {
                        ...currentVideo.effects,
                        hue: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-16"
                    min={-180}
                    max={180}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Trimming Section */}
          <Collapsible open={openSections.timing} onOpenChange={() => toggleSection('timing')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <Scissors className="w-4 h-4" />
                  <span className="font-medium">Clip Trimming</span>
                  {hasTimingChanges(currentVideo) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                {openSections.timing ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Start Time</Label>
                    <MiniResetButton 
                      onClick={() => onVideoUpdate({ position: { ...currentVideo.position, startTime: 0, endTime: currentVideo.position?.endTime || currentVideo.duration } })}
                      hasChanged={(currentVideo.position?.startTime || 0) !== 0}
                    />
                  </div>
                  <Input
                    type="number"
                    value={(currentVideo.position?.startTime || 0).toFixed(2)}
                    onChange={(e) => {
                      const startTime = Math.max(0, parseFloat(e.target.value) || 0);
                      const currentEndTime = currentVideo.position?.endTime || currentVideo.duration;
                      const maxStartTime = Math.min(startTime, currentEndTime - 0.1);
                      
                      onVideoUpdate({
                        position: {
                          startTime: maxStartTime,
                          endTime: currentEndTime
                        }
                      });
                    }}
                    step={0.1}
                    min={0}
                    max={Math.max(0, (currentVideo.position?.endTime || currentVideo.duration) - 0.1)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>End Time</Label>
                    <MiniResetButton 
                      onClick={() => onVideoUpdate({ position: { ...currentVideo.position, startTime: currentVideo.position?.startTime || 0, endTime: currentVideo.duration } })}
                      hasChanged={(currentVideo.position?.endTime || currentVideo.duration) !== currentVideo.duration}
                    />
                  </div>
                  <Input
                    type="number"
                    value={(currentVideo.position?.endTime || currentVideo.duration).toFixed(2)}
                    onChange={(e) => {
                      const endTime = Math.min(currentVideo.duration, parseFloat(e.target.value) || currentVideo.duration);
                      const currentStartTime = currentVideo.position?.startTime || 0;
                      const minEndTime = Math.max(endTime, currentStartTime + 0.1);
                      
                      onVideoUpdate({
                        position: {
                          startTime: currentStartTime,
                          endTime: Math.min(minEndTime, currentVideo.duration)
                        }
                      });
                    }}
                    step={0.1}
                    min={Math.min(currentVideo.duration, (currentVideo.position?.startTime || 0) + 0.1)}
                    max={currentVideo.duration}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Duration: {((currentVideo.position?.endTime || currentVideo.duration) - (currentVideo.position?.startTime || 0)).toFixed(2)}s of {currentVideo.duration.toFixed(2)}s
              </div>
              
              {hasTimingChanges(currentVideo) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={resetTiming}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset to Full Length
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Audio Section */}
          <Collapsible open={openSections.audio} onOpenChange={() => toggleSection('audio')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <span className="font-medium">Audio</span>
                </div>
                {openSections.audio ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Volume</Label>
                  <MiniResetButton onClick={resetVolume} hasChanged={hasVolumeChanged(currentVideo)} />
                </div>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[(currentVideo.audio?.volume || 1) * 100]}
                    onValueChange={([value]) => onVideoUpdate({
                      audio: {
                        ...currentVideo.audio,
                        volume: value / 100
                      }
                    })}
                    min={0}
                    max={200}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round((currentVideo.audio?.volume || 1) * 100)}
                    onChange={(e) => onVideoUpdate({
                      audio: {
                        ...currentVideo.audio,
                        volume: (parseInt(e.target.value) || 100) / 100
                      }
                    })}
                    className="w-16"
                    min={0}
                    max={200}
                  />
                </div>
              </div>

              {/* Speed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Speed</Label>
                  <MiniResetButton onClick={resetSpeed} hasChanged={hasSpeedChanged(currentVideo)} />
                </div>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[(currentVideo.audio?.speed || 1) * 100]}
                    onValueChange={([value]) => onVideoUpdate({
                      audio: {
                        ...currentVideo.audio,
                        speed: value / 100
                      }
                    })}
                    min={25}
                    max={400}
                    step={5}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round((currentVideo.audio?.speed || 1) * 100)}
                    onChange={(e) => onVideoUpdate({
                      audio: {
                        ...currentVideo.audio,
                        speed: (parseInt(e.target.value) || 100) / 100
                      }
                    })}
                    className="w-16"
                    min={25}
                    max={400}
                  />
                </div>
              </div>

              {/* Muted */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Muted</Label>
                  <MiniResetButton onClick={resetMuted} hasChanged={hasMutedChanged(currentVideo)} />
                </div>
                <Switch
                  checked={currentVideo.audio?.muted || false}
                  onCheckedChange={(checked) => onVideoUpdate({
                    audio: {
                      ...currentVideo.audio,
                      muted: checked
                    }
                  })}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Properties Section (moved from Video section) */}
          <Collapsible open={openSections.properties} onOpenChange={() => toggleSection('properties')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">Properties</span>
                </div>
                {openSections.properties ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label>Scene Name</Label>
                <Input
                  value={currentVideo.name}
                  onChange={(e) => onVideoUpdate({ name: e.target.value })}
                  placeholder="Scene name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Clip Duration</Label>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    {((currentVideo.position?.endTime || currentVideo.duration) - (currentVideo.position?.startTime || 0)).toFixed(2)}s
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <div className="text-sm bg-muted p-2 rounded">
                    {currentVideo.format || 'MP4'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>File Size</Label>
                <div className="text-sm bg-muted p-2 rounded">
                  {(currentVideo.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Add some padding at the bottom for better scrolling experience */}
          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  );
}