import React, { useState } from 'react';
import { 
  Type, 
  Image, 
  Square, 
  Film,
  Palette,
  Eye,
  Move,
  RotateCw,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Settings,
  Volume2,
  Scissors,
  Info,
  Play,
  Paintbrush,
  PenTool
} from 'lucide-react';
import { SceneLayer, VideoAsset, TextLayerProperties, ImageLayerProperties, ShapeLayerProperties, VideoLayerProperties } from '../types/video';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
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

interface LayerPropertiesPanelProps {
  layer: SceneLayer;
  onLayerUpdate: (layerId: string, updates: Partial<SceneLayer>) => void;
  currentVideo?: VideoAsset | null;
  onVideoUpdate?: (updates: Partial<VideoAsset>) => void;
}

// Font families available in the system
const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Courier New',
  'Lucida Console'
];

// Preset colors for quick selection
const PRESET_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#808080', '#ffa500',
  '#800080', '#008000', '#800000', '#000080', '#808000'
];

// Mini reset button component for video properties
const MiniResetButton = ({ onClick, hasChanged }: { onClick: () => void; hasChanged: boolean }) => {
  if (!hasChanged) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
    >
      <RotateCw className="w-3 h-3" />
    </Button>
  );
};

export function LayerPropertiesPanel({ layer, onLayerUpdate, currentVideo, onVideoUpdate }: LayerPropertiesPanelProps) {
  const isVideoLayer = layer.id.startsWith('video_');

  // Collapsible sections state - different defaults based on layer type
  const getInitialSections = () => {
    if (isVideoLayer) {
      return {
        properties: false, // Properties section at bottom for video layers
        transform: true, // Open for video layers
        effects: true, // Open for video layers
        timing: false,
        audio: false,
        layerManagement: false
      };
    } else if (layer.type === 'text' || layer.type === 'shape') {
      return {
        properties: true, // Open for text and shape layers - this is the main Properties section
        transform: false, // Collapsed for text and shape layers
        effects: false,
        timing: false,
        audio: false,
        layerManagement: false
      };
    } else {
      // Image layers
      return {
        properties: false, // Collapsed for image layers
        transform: true, // Open for image layers
        effects: false,
        timing: false,
        audio: false,
        layerManagement: false
      };
    }
  };

  const [openSections, setOpenSections] = useState(getInitialSections());

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Update layer properties
  const updateLayerProperty = <T extends keyof SceneLayer>(
    property: T,
    value: SceneLayer[T]
  ) => {
    onLayerUpdate(layer.id, { [property]: value });
  };

  // Update nested properties (like transform, properties)
  const updateNestedProperty = <T extends Record<string, any>>(
    parent: keyof SceneLayer,
    property: keyof T,
    value: T[keyof T]
  ) => {
    const currentParent = layer[parent] as T;
    onLayerUpdate(layer.id, {
      [parent]: {
        ...currentParent,
        [property]: value
      }
    });
  };

  // Video properties helpers (for video layers)
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

  // Video properties reset functions
  const resetTiming = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        position: {
          startTime: 0,
          endTime: currentVideo.duration
        }
      });
    }
  };

  const resetPositionX = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        transform: {
          ...currentVideo.transform,
          x: 0
        }
      });
    }
  };

  const resetPositionY = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        transform: {
          ...currentVideo.transform,
          y: 0
        }
      });
    }
  };

  const resetScale = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        transform: {
          ...currentVideo.transform,
          scale: 1
        }
      });
    }
  };

  const resetRotation = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        transform: {
          ...currentVideo.transform,
          rotation: 0
        }
      });
    }
  };

  const resetOpacity = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        transform: {
          ...currentVideo.transform,
          opacity: 1
        }
      });
    }
  };

  const resetBrightness = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        effects: {
          ...currentVideo.effects,
          brightness: 0
        }
      });
    }
  };

  const resetContrast = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        effects: {
          ...currentVideo.effects,
          contrast: 0
        }
      });
    }
  };

  const resetSaturation = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        effects: {
          ...currentVideo.effects,
          saturation: 0
        }
      });
    }
  };

  const resetHue = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        effects: {
          ...currentVideo.effects,
          hue: 0
        }
      });
    }
  };

  const resetVolume = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        audio: {
          ...currentVideo.audio,
          volume: 1
        }
      });
    }
  };

  const resetSpeed = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        audio: {
          ...currentVideo.audio,
          speed: 1
        }
      });
    }
  };

  const resetMuted = () => {
    if (currentVideo && onVideoUpdate) {
      onVideoUpdate({
        audio: {
          ...currentVideo.audio,
          muted: false
        }
      });
    }
  };

  // Get layer icon and color
  const getLayerInfo = () => {
    switch (layer.type) {
      case 'text':
        return { icon: Type, color: 'bg-blue-100 text-blue-600', name: 'Text Layer' };
      case 'image':
        return { icon: Image, color: 'bg-green-100 text-green-600', name: 'Image Layer' };
      case 'shape':
        return { icon: Square, color: 'bg-purple-100 text-purple-600', name: 'Shape Layer' };
      case 'video':
        return { icon: Film, color: 'bg-red-100 text-red-600', name: 'Background Video' };
      default:
        return { icon: Square, color: 'bg-gray-100 text-gray-600', name: 'Layer' };
    }
  };

  const { icon: LayerIcon, color: layerColor, name: layerName } = getLayerInfo();

  // Render content properties based on layer type
  const renderContentProperties = () => {
    switch (layer.type) {
      case 'video':
        const videoProps = layer.properties as VideoLayerProperties;
        return (
          <div className="space-y-4">
            {/* Video Source */}
            <div className="space-y-2">
              <Label>Video Source</Label>
              <Input
                type="url"
                value={videoProps.src}
                onChange={(e) => updateNestedProperty('properties', 'src', e.target.value)}
                placeholder="Video URL"
                disabled={isVideoLayer} // Background video source shouldn't be edited
              />
            </div>

            {/* Timing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="number"
                  value={videoProps.startTime}
                  onChange={(e) => updateNestedProperty('properties', 'startTime', parseFloat(e.target.value) || 0)}
                  step={0.1}
                  min={0}
                  disabled={isVideoLayer}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="number"
                  value={videoProps.endTime}
                  onChange={(e) => updateNestedProperty('properties', 'endTime', parseFloat(e.target.value) || 0)}
                  step={0.1}
                  min={0}
                  disabled={isVideoLayer}
                />
              </div>
            </div>

            {/* Audio */}
            <div className="space-y-3">
              <Label>Audio</Label>
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label className="text-xs">Volume</Label>
                  <div className="flex items-center space-x-3">
                    <Slider
                      value={[videoProps.volume * 100]}
                      onValueChange={([value]) => updateNestedProperty('properties', 'volume', value / 100)}
                      min={0}
                      max={200}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={Math.round(videoProps.volume * 100)}
                      onChange={(e) => updateNestedProperty('properties', 'volume', (parseInt(e.target.value) || 0) / 100)}
                      className="w-16"
                      min={0}
                      max={200}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Muted</Label>
                  <Switch
                    checked={videoProps.muted}
                    onCheckedChange={(checked) => updateNestedProperty('properties', 'muted', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'text':
        const textProps = layer.properties as TextLayerProperties;
        return (
          <div className="space-y-4">
            {/* Text Content */}
            <div className="space-y-2">
              <Label>Text Content</Label>
              <Textarea
                value={textProps.text}
                onChange={(e) => updateNestedProperty('properties', 'text', e.target.value)}
                placeholder="Enter your text here..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Typography */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={textProps.fontFamily}
                  onValueChange={(value) => updateNestedProperty('properties', 'fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Select
                  value={textProps.fontWeight}
                  onValueChange={(value) => updateNestedProperty('properties', 'fontWeight', value as 'normal' | 'medium' | 'bold')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label>Font Size</Label>
              <div className="flex items-center space-x-3">
                <Slider
                  value={[textProps.fontSize]}
                  onValueChange={([value]) => updateNestedProperty('properties', 'fontSize', value)}
                  min={8}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={textProps.fontSize}
                  onChange={(e) => updateNestedProperty('properties', 'fontSize', parseInt(e.target.value) || 24)}
                  className="w-16"
                  min={8}
                  max={200}
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={textProps.color}
                  onChange={(e) => updateNestedProperty('properties', 'color', e.target.value)}
                  className="w-12 h-8 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={textProps.color}
                  onChange={(e) => updateNestedProperty('properties', 'color', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
              {/* Preset colors */}
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400"
                    style={{ backgroundColor: color }}
                    onClick={() => updateNestedProperty('properties', 'color', color)}
                  />
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <Select
                value={textProps.alignment}
                onValueChange={(value) => updateNestedProperty('properties', 'alignment', value as 'left' | 'center' | 'right')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={textProps.backgroundColor === 'transparent' ? '#000000' : textProps.backgroundColor || '#000000'}
                  onChange={(e) => updateNestedProperty('properties', 'backgroundColor', e.target.value)}
                  className="w-12 h-8 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={textProps.backgroundColor || 'transparent'}
                  onChange={(e) => updateNestedProperty('properties', 'backgroundColor', e.target.value)}
                  placeholder="transparent"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Text Effects */}
            <div className="space-y-2">
              <Label>Text Effects</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={textProps.shadow || false}
                    onCheckedChange={(checked) => updateNestedProperty('properties', 'shadow', checked)}
                  />
                  <Label className="text-sm">Shadow</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={textProps.outline || false}
                    onCheckedChange={(checked) => updateNestedProperty('properties', 'outline', checked)}
                  />
                  <Label className="text-sm">Outline</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'image':
        const imageProps = layer.properties as ImageLayerProperties;
        return (
          <div className="space-y-4">
            {/* Image Source */}
            <div className="space-y-2">
              <Label>Image Source</Label>
              <Input
                type="url"
                value={imageProps.src}
                onChange={(e) => updateNestedProperty('properties', 'src', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Alt Text */}
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                type="text"
                value={imageProps.alt}
                onChange={(e) => updateNestedProperty('properties', 'alt', e.target.value)}
                placeholder="Image description"
              />
            </div>

            {/* Fit Mode */}
            <div className="space-y-2">
              <Label>Fit Mode</Label>
              <Select
                value={imageProps.fit}
                onValueChange={(value) => updateNestedProperty('properties', 'fit', value as 'cover' | 'contain' | 'fill')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover (crop to fill)</SelectItem>
                  <SelectItem value="contain">Contain (fit within)</SelectItem>
                  <SelectItem value="fill">Fill (stretch)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'shape':
        const shapeProps = layer.properties as ShapeLayerProperties;
        return (
          <div className="space-y-4">
            {/* Shape Name Display */}
            <div className="space-y-2">
              <Label>Shape</Label>
              <div className="p-2 bg-muted/50 rounded border text-sm">
                {shapeProps.shape ? shapeProps.shape.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Custom Shape'}
              </div>
            </div>

            {/* Fill Color with Advanced Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Paintbrush className="w-4 h-4" />
                <Label>Fill Color</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={shapeProps.fillColor || '#3b82f6'}
                  onChange={(e) => updateNestedProperty('properties', 'fillColor', e.target.value)}
                  className="w-12 h-8 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={shapeProps.fillColor || '#3b82f6'}
                  onChange={(e) => updateNestedProperty('properties', 'fillColor', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
              {/* Color Presets */}
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => updateNestedProperty('properties', 'fillColor', color)}
                    title={color}
                  />
                ))}
              </div>
              {/* Fill Opacity */}
              <div className="space-y-2">
                <Label className="text-sm">Fill Opacity</Label>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[(shapeProps.fillOpacity || 1) * 100]}
                    onValueChange={([value]) => updateNestedProperty('properties', 'fillOpacity', value / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round((shapeProps.fillOpacity || 1) * 100)}
                    onChange={(e) => updateNestedProperty('properties', 'fillOpacity', (parseInt(e.target.value) || 100) / 100)}
                    className="w-16"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Stroke/Border with Advanced Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <PenTool className="w-4 h-4" />
                <Label>Stroke & Border</Label>
              </div>
              <div className="space-y-3">
                {/* Stroke Color */}
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={shapeProps.strokeColor === 'transparent' ? '#000000' : shapeProps.strokeColor || '#000000'}
                    onChange={(e) => updateNestedProperty('properties', 'strokeColor', e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={shapeProps.strokeColor || 'transparent'}
                    onChange={(e) => updateNestedProperty('properties', 'strokeColor', e.target.value)}
                    placeholder="transparent"
                    className="flex-1"
                  />
                </div>
                
                {/* Stroke Width */}
                <div className="space-y-2">
                  <Label className="text-sm">Stroke Width</Label>
                  <div className="flex items-center space-x-3">
                    <Slider
                      value={[shapeProps.strokeWidth || 0]}
                      onValueChange={([value]) => updateNestedProperty('properties', 'strokeWidth', value)}
                      min={0}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={shapeProps.strokeWidth || 0}
                      onChange={(e) => updateNestedProperty('properties', 'strokeWidth', parseInt(e.target.value) || 0)}
                      className="w-16"
                      min={0}
                      max={20}
                    />
                  </div>
                </div>

                {/* Stroke Opacity */}
                <div className="space-y-2">
                  <Label className="text-sm">Stroke Opacity</Label>
                  <div className="flex items-center space-x-3">
                    <Slider
                      value={[(shapeProps.strokeOpacity || 1) * 100]}
                      onValueChange={([value]) => updateNestedProperty('properties', 'strokeOpacity', value / 100)}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={Math.round((shapeProps.strokeOpacity || 1) * 100)}
                      onChange={(e) => updateNestedProperty('properties', 'strokeOpacity', (parseInt(e.target.value) || 100) / 100)}
                      className="w-16"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render sections based on layer type
  const renderSections = () => {
    if (isVideoLayer && currentVideo && onVideoUpdate) {
      // Video layer sections (unchanged)
      return (
        <>
          {/* Video Transform Section */}
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

          {/* Video Effects Section */}
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

          {/* Video Trimming Section */}
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
                  <RotateCw className="w-3 h-3 mr-1" />
                  Reset to Full Duration
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Video Audio Section */}
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
                    value={[currentVideo.audio?.volume || 1]}
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
                    step={1}
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
              <div className="flex items-center justify-between">
                <Label>Muted</Label>
                <div className="flex items-center space-x-2">
                  <MiniResetButton onClick={resetMuted} hasChanged={hasMutedChanged(currentVideo)} />
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
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Video Properties Section */}
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
                  placeholder="Enter scene name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={`${currentVideo.duration.toFixed(2)}s`}
                    disabled
                    className="text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Input
                    value="MP4"
                    disabled
                    className="text-muted-foreground"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>File Size</Label>
                <Input
                  value="~15.2 MB"
                  disabled
                  className="text-muted-foreground"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      );
    } else {
      // Regular layer sections - order: Properties (at top for text/shape), Transform, Layer Management (at bottom)
      return (
        <>
          {/* Properties Section - First for text and shape layers */}
          <Collapsible open={openSections.properties} onOpenChange={() => toggleSection('properties')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <LayerIcon className="w-4 h-4" />
                  <span className="font-medium">Properties</span>
                </div>
                {openSections.properties ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {renderContentProperties()}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Transform Section - Second */}
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
              {/* Position */}
              <div className="space-y-3">
                <Label>Position</Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">X Position</Label>
                    <div className="flex items-center space-x-3">
                      <Slider
                        value={[layer.transform.x]}
                        onValueChange={([value]) => updateNestedProperty('transform', 'x', value)}
                        min={-500}
                        max={500}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={layer.transform.x}
                        onChange={(e) => updateNestedProperty('transform', 'x', parseInt(e.target.value) || 0)}
                        className="w-16"
                        min={-500}
                        max={500}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Y Position</Label>
                    <div className="flex items-center space-x-3">
                      <Slider
                        value={[layer.transform.y]}
                        onValueChange={([value]) => updateNestedProperty('transform', 'y', value)}
                        min={-500}
                        max={500}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={layer.transform.y}
                        onChange={(e) => updateNestedProperty('transform', 'y', parseInt(e.target.value) || 0)}
                        className="w-16"
                        min={-500}
                        max={500}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-3">
                <Label>Size</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Width</Label>
                    <Input
                      type="number"
                      value={layer.transform.width}
                      onChange={(e) => updateNestedProperty('transform', 'width', parseInt(e.target.value) || 100)}
                      min={1}
                      max={2000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Height</Label>
                    <Input
                      type="number"
                      value={layer.transform.height}
                      onChange={(e) => updateNestedProperty('transform', 'height', parseInt(e.target.value) || 100)}
                      min={1}
                      max={2000}
                    />
                  </div>
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <Label>Rotation</Label>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[layer.transform.rotation]}
                    onValueChange={([value]) => updateNestedProperty('transform', 'rotation', value)}
                    min={-180}
                    max={180}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={layer.transform.rotation}
                    onChange={(e) => updateNestedProperty('transform', 'rotation', parseInt(e.target.value) || 0)}
                    className="w-16"
                    min={-180}
                    max={180}
                  />
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <Label>Opacity</Label>
                <div className="flex items-center space-x-3">
                  <Slider
                    value={[layer.transform.opacity * 100]}
                    onValueChange={([value]) => updateNestedProperty('transform', 'opacity', value / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round(layer.transform.opacity * 100)}
                    onChange={(e) => updateNestedProperty('transform', 'opacity', (parseInt(e.target.value) || 100) / 100)}
                    className="w-16"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Layer Management Section - Last */}
          <Collapsible open={openSections.layerManagement} onOpenChange={() => toggleSection('layerManagement')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center space-x-2">
                  <Move className="w-4 h-4" />
                  <span className="font-medium">Layer Management</span>
                </div>
                {openSections.layerManagement ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Layer Name */}
              <div className="space-y-2">
                <Label>Layer Name</Label>
                <Input
                  value={layer.name}
                  onChange={(e) => updateLayerProperty('name', e.target.value)}
                  placeholder="Layer name"
                />
              </div>

              {/* Visibility and Lock */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={layer.visible}
                    onCheckedChange={(checked) => updateLayerProperty('visible', checked)}
                  />
                  <Label>Visible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={layer.locked}
                    onCheckedChange={(checked) => updateLayerProperty('locked', checked)}
                  />
                  <Label>Locked</Label>
                </div>
              </div>

              {/* Z-Index */}
              <div className="space-y-2">
                <Label>Layer Order (Z-Index)</Label>
                <Input
                  type="number"
                  value={layer.transform.zIndex}
                  onChange={(e) => updateNestedProperty('transform', 'zIndex', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="w-3 h-3 mr-1" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg ${layerColor} flex items-center justify-center`}>
            <LayerIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{layer.name}</h3>
            <p className="text-xs text-muted-foreground">{layerName}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {isVideoLayer ? 'Scene' : 'Layer'}
          </Badge>
        </div>

        {/* Quick Actions - only for non-video layers */}
        {!isVideoLayer && (
          <div className="flex items-center space-x-1 mt-3">
            <Button variant="outline" size="sm" className="flex-1">
              <Play className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Properties Sections */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {renderSections()}
        </div>
      </ScrollArea>
    </div>
  );
}