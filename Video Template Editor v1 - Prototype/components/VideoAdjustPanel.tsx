import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { VideoAsset } from '../types/video';

interface VideoAdjustPanelProps {
  selectedVideo: VideoAsset | null;
  onVideoUpdate: (updates: Partial<VideoAsset>) => void;
  onBack: () => void;
}

interface VideoAdjustments {
  brightness: number;
  contrast: number;
  exposure: number;
  hue: number;
  saturation: number;
  sharpen: number;
  noise: number;
  blur: number;
  vignette: number;
}

export function VideoAdjustPanel({
  selectedVideo,
  onVideoUpdate,
  onBack
}: VideoAdjustPanelProps) {
  const [adjustments, setAdjustments] = useState<VideoAdjustments>({
    brightness: 0,
    contrast: 0,
    exposure: 0,
    hue: 0,
    saturation: 0,
    sharpen: 0,
    noise: 0,
    blur: 0,
    vignette: 0
  });

  // Load existing adjustments when selectedVideo changes
  useEffect(() => {
    if (selectedVideo?.adjustments) {
      setAdjustments({
        brightness: selectedVideo.adjustments.brightness || 0,
        contrast: selectedVideo.adjustments.contrast || 0,
        exposure: selectedVideo.adjustments.exposure || 0,
        hue: selectedVideo.adjustments.hue || 0,
        saturation: selectedVideo.adjustments.saturation || 0,
        sharpen: selectedVideo.adjustments.sharpen || 0,
        noise: selectedVideo.adjustments.noise || 0,
        blur: selectedVideo.adjustments.blur || 0,
        vignette: selectedVideo.adjustments.vignette || 0
      });
    }
  }, [selectedVideo]);

  const handleAdjustmentChange = (key: keyof VideoAdjustments, value: number) => {
    const newAdjustments = { ...adjustments, [key]: value };
    setAdjustments(newAdjustments);
    
    // Update the video with new adjustments
    onVideoUpdate({
      adjustments: newAdjustments
    });
  };

  const getVideoName = () => {
    if (!selectedVideo) return 'video.mp4';
    return selectedVideo.name || selectedVideo.src?.split('/').pop() || 'video.mp4';
  };

  if (!selectedVideo) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-semibold text-lg">Adjust Video</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-muted-foreground">No video selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-semibold text-lg">Adjust Video</h2>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">{getVideoName()}</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          
          {/* Color Correction Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Color Correction</h3>
            
            <div className="p-4 bg-gray-50 rounded-lg space-y-6">
              {/* Brightness */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Brightness</span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded min-w-[40px] text-center">
                    {adjustments.brightness}
                  </span>
                </div>
                <Slider
                  value={[adjustments.brightness]}
                  onValueChange={([value]) => handleAdjustmentChange('brightness', value)}
                  max={100}
                  min={-100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Contrast</span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded min-w-[40px] text-center">
                    {adjustments.contrast}
                  </span>
                </div>
                <Slider
                  value={[adjustments.contrast]}
                  onValueChange={([value]) => handleAdjustmentChange('contrast', value)}
                  max={100}
                  min={-100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Exposure */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Exposure</span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded min-w-[40px] text-center">
                    {adjustments.exposure}
                  </span>
                </div>
                <Slider
                  value={[adjustments.exposure]}
                  onValueChange={([value]) => handleAdjustmentChange('exposure', value)}
                  max={100}
                  min={-100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Hue */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Hue</span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded min-w-[40px] text-center">
                    {adjustments.hue}
                  </span>
                </div>
                <Slider
                  value={[adjustments.hue]}
                  onValueChange={([value]) => handleAdjustmentChange('hue', value)}
                  max={180}
                  min={-180}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Saturation</span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded min-w-[40px] text-center">
                    {adjustments.saturation}
                  </span>
                </div>
                <Slider
                  value={[adjustments.saturation]}
                  onValueChange={([value]) => handleAdjustmentChange('saturation', value)}
                  max={100}
                  min={-100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Effects Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Effects</h3>
            
            <div className="p-4 bg-gray-50 rounded-lg space-y-6">
              {/* Sharpen */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sharpen</span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded min-w-[40px] text-center">
                    {adjustments.sharpen}
                  </span>
                </div>
                <Slider
                  value={[adjustments.sharpen]}
                  onValueChange={([value]) => handleAdjustmentChange('sharpen', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Noise */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Noise</span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded min-w-[40px] text-center">
                    {adjustments.noise}
                  </span>
                </div>
                <Slider
                  value={[adjustments.noise]}
                  onValueChange={([value]) => handleAdjustmentChange('noise', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Blur */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Blur</span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded min-w-[40px] text-center">
                    {adjustments.blur}
                  </span>
                </div>
                <Slider
                  value={[adjustments.blur]}
                  onValueChange={([value]) => handleAdjustmentChange('blur', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Vignette */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Vignette</span>
                  <span className="text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded min-w-[40px] text-center">
                    {adjustments.vignette}
                  </span>
                </div>
                <Slider
                  value={[adjustments.vignette]}
                  onValueChange={([value]) => handleAdjustmentChange('vignette', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                const resetAdjustments = {
                  brightness: 0,
                  contrast: 0,
                  exposure: 0,
                  hue: 0,
                  saturation: 0,
                  sharpen: 0,
                  noise: 0,
                  blur: 0,
                  vignette: 0
                };
                setAdjustments(resetAdjustments);
                onVideoUpdate({ adjustments: resetAdjustments });
              }}
            >
              Reset All Adjustments
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}