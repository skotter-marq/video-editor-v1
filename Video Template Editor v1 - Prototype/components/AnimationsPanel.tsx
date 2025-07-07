import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Tabs, TabsList, TabsContent, TabsTrigger } from './ui/tabs';
import { VideoAsset, AnimationType, AnimationCategory } from '../types/video';

interface AnimationOption {
  id: string;
  name: string;
  type: AnimationType;
  categories: AnimationCategory[];
  icon: string;
}

const ANIMATION_OPTIONS: AnimationOption[] = [
  { id: 'none', name: 'None', type: 'none', categories: ['in', 'out'], icon: '🚫' },
  { id: 'fade', name: 'Fade', type: 'fade', categories: ['in', 'out'], icon: '◻️' },
  { id: 'slide', name: 'Slide', type: 'slide', categories: ['in', 'out'], icon: '➡️' },
  { id: 'zoom', name: 'Zoom In', type: 'zoom', categories: ['in', 'zoom'], icon: '🔍' },
  { id: 'zoom-out', name: 'Zoom Out', type: 'zoom-out', categories: ['out', 'zoom'], icon: '🔍' },
  { id: 'bounce', name: 'Bounce', type: 'bounce', categories: ['in', 'loop'], icon: '⬇️' },
  { id: 'spin', name: 'Spin', type: 'spin', categories: ['loop'], icon: '🔄' },
  { id: 'float', name: 'Float', type: 'float', categories: ['in', 'loop'], icon: '⬆️' },
  { id: 'pop', name: 'Pop', type: 'pop', categories: ['in'], icon: '💥' },
  { id: 'wipe', name: 'Wipe', type: 'wipe', categories: ['in', 'out'], icon: '➡️' },
  { id: 'drop', name: 'Drop', type: 'drop', categories: ['out'], icon: '⬇️' },
  { id: 'ken-burns', name: 'Ken Burns', type: 'ken-burns', categories: ['zoom'], icon: '📹' },
  { id: 'slide-bounce', name: 'Slide Bounce', type: 'slide-bounce', categories: ['in'], icon: '➡️⬇️' },
  { id: 'gentle-float', name: 'Gentle Float', type: 'gentle-float', categories: ['loop'], icon: '🎈' },
];

interface AnimationsPanelProps {
  selectedVideo: VideoAsset | null;
  onBack: () => void;
  onVideoUpdate: (updates: Partial<VideoAsset>) => void;
}

export function AnimationsPanel({
  selectedVideo,
  onBack,
  onVideoUpdate
}: AnimationsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<AnimationCategory>('in');
  const [previewAnimation, setPreviewAnimation] = useState<string | null>(null);
  const [durations, setDurations] = useState({
    in: 1.0,
    out: 1.0,
    loop: 2.0,
    zoom: 1.0
  });

  // Load existing animation settings
  useEffect(() => {
    if (selectedVideo?.animations) {
      setDurations({
        in: selectedVideo.animations.in?.duration || 1.0,
        out: selectedVideo.animations.out?.duration || 1.0,
        loop: selectedVideo.animations.loop?.duration || 2.0,
        zoom: selectedVideo.animations.in?.duration || selectedVideo.animations.out?.duration || 1.0
      });
    }
  }, [selectedVideo]);

  const getFilteredAnimations = (category: AnimationCategory) => {
    return ANIMATION_OPTIONS.filter(animation => 
      animation.categories.includes(category)
    );
  };

  const getCurrentAnimation = (category: AnimationCategory) => {
    if (!selectedVideo?.animations) return 'none';
    
    switch (category) {
      case 'in':
        return selectedVideo.animations.in?.type || 'none';
      case 'out':
        return selectedVideo.animations.out?.type || 'none';
      case 'loop':
        return selectedVideo.animations.loop?.type || 'none';
      case 'zoom':
        return selectedVideo.animations.in?.type || selectedVideo.animations.out?.type || 'none';
      default:
        return 'none';
    }
  };

  const handleAnimationSelect = (animationType: AnimationType, category: AnimationCategory) => {
    if (!selectedVideo) return;

    const currentAnimations = selectedVideo.animations || {};
    const duration = durations[category as keyof typeof durations] || 1.0;

    let updatedAnimations = { ...currentAnimations };

    if (animationType === 'none') {
      // Remove the animation for this category
      if (category === 'in') delete updatedAnimations.in;
      if (category === 'out') delete updatedAnimations.out;
      if (category === 'loop') delete updatedAnimations.loop;
      if (category === 'zoom') {
        delete updatedAnimations.in;
        delete updatedAnimations.out;
      }
    } else {
      // Add/update the animation for this category
      if (category === 'in' || (category === 'zoom' && ['zoom', 'ken-burns'].includes(animationType))) {
        updatedAnimations.in = {
          type: animationType,
          duration: duration,
          delay: 0
        };
      }
      if (category === 'out' || (category === 'zoom' && ['zoom-out', 'ken-burns'].includes(animationType))) {
        updatedAnimations.out = {
          type: animationType,
          duration: duration,
          delay: 0
        };
      }
      if (category === 'loop') {
        updatedAnimations.loop = {
          type: animationType,
          duration: duration,
          iterations: 'infinite'
        };
      }
    }

    onVideoUpdate({
      animations: updatedAnimations
    });

    // Trigger preview
    setPreviewAnimation(`${animationType}-${category}-${Date.now()}`);
  };

  const handleDurationChange = (category: AnimationCategory, value: number) => {
    setDurations(prev => ({
      ...prev,
      [category]: value
    }));

    // Update the video's animation duration
    if (selectedVideo?.animations) {
      const currentAnimations = { ...selectedVideo.animations };
      
      if (category === 'in' && currentAnimations.in) {
        currentAnimations.in.duration = value;
      }
      if (category === 'out' && currentAnimations.out) {
        currentAnimations.out.duration = value;
      }
      if (category === 'loop' && currentAnimations.loop) {
        currentAnimations.loop.duration = value;
      }
      if (category === 'zoom') {
        // Update both in and out for zoom category
        if (currentAnimations.in) {
          currentAnimations.in.duration = value;
        }
        if (currentAnimations.out) {
          currentAnimations.out.duration = value;
        }
      }

      onVideoUpdate({ animations: currentAnimations });
    }
  };

  const renderAnimationGrid = (category: AnimationCategory) => {
    const animations = getFilteredAnimations(category);
    const currentAnimation = getCurrentAnimation(category);

    return (
      <div className="space-y-4">
        {/* Animation Grid */}
        <div className="grid grid-cols-3 gap-3">
          {animations.map((animation) => (
            <div
              key={animation.id}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group cursor-pointer
                ${currentAnimation === animation.type 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              onClick={() => handleAnimationSelect(animation.type, category)}
            >
              {/* Animation Preview Icon */}
              <div className="w-full h-20 mb-3 bg-gray-100 rounded-md flex items-center justify-center relative overflow-hidden">
                <div 
                  className={`
                    w-8 h-8 bg-gray-600 rounded-sm transition-all duration-300
                    ${previewAnimation?.includes(animation.id) ? getAnimationClass(animation.type) : ''}
                  `}
                  style={{
                    animationDuration: `${durations[category as keyof typeof durations] || 1}s`
                  }}
                >
                  {animation.type === 'none' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-0.5 bg-blue-500 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Animation indicators */}
                {animation.type === 'bounce' && (
                  <div className="absolute top-2 left-2 text-xs">⬇️ ⬆️</div>
                )}
                {animation.type === 'spin' && (
                  <div className="absolute top-2 right-2 text-xs">🔄</div>
                )}
                {animation.type === 'slide-bounce' && (
                  <div className="absolute top-2 right-2 text-xs">➡️</div>
                )}
                {animation.type === 'gentle-float' && (
                  <div className="absolute bottom-2 right-2 text-xs">➡️</div>
                )}
                
                {/* Preview Button */}
                <button
                  className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white rounded border border-gray-300 hover:border-gray-400 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewAnimation(`${animation.id}-${Date.now()}`);
                  }}
                >
                  <Play className="w-3 h-3" />
                </button>
              </div>
              
              {/* Animation Name */}
              <div className="text-sm font-medium text-gray-700 text-center">
                {animation.name}
              </div>
            </div>
          ))}
        </div>

        {/* Inline Duration Sliders for Selected Animations */}
        <div className="space-y-3">
          {animations.map((animation) => {
            const isSelected = currentAnimation === animation.type;
            if (!isSelected || animation.type === 'none') return null;
            
            return (
              <div key={`${animation.id}-duration`} className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {animation.name} Duration
                  </span>
                  <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded min-w-[60px] text-center">
                    {(durations[category as keyof typeof durations] || 1.0).toFixed(1)}s
                  </span>
                </div>
                <Slider
                  value={[durations[category as keyof typeof durations] || 1.0]}
                  onValueChange={([value]) => handleDurationChange(category, value)}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getAnimationClass = (type: AnimationType): string => {
    switch (type) {
      case 'bounce':
        return 'animate-bounce-in';
      case 'spin':
        return 'animate-spin';
      case 'fade':
        return 'animate-fade-in';
      case 'float':
        return 'animate-gentle-float';
      case 'slide':
        return 'animate-slide-in';
      case 'zoom':
        return 'animate-zoom-in';
      case 'zoom-out':
        return 'animate-zoom-out';
      case 'pop':
        return 'animate-pop';
      case 'wipe':
        return 'animate-wipe-in';
      case 'drop':
        return 'animate-drop';
      case 'ken-burns':
        return 'animate-ken-burns';
      case 'slide-bounce':
        return 'animate-slide-bounce';
      case 'gentle-float':
        return 'animate-gentle-float';
      default:
        return '';
    }
  };

  if (!selectedVideo) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <p className="text-muted-foreground">No video selected</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-8 h-8 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold">Animations</h2>
      </div>

      {/* Animation Categories Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as AnimationCategory)}>
          <TabsList className="w-full grid grid-cols-4 m-4 mb-0">
            <TabsTrigger value="in" className="text-sm">In</TabsTrigger>
            <TabsTrigger value="out" className="text-sm">Out</TabsTrigger>
            <TabsTrigger value="loop" className="text-sm">Loop</TabsTrigger>
            <TabsTrigger value="zoom" className="text-sm">Zoom</TabsTrigger>
          </TabsList>

          <div className="p-4 overflow-y-auto h-full">
            <TabsContent value="in" className="mt-0">
              {renderAnimationGrid('in')}
            </TabsContent>
            
            <TabsContent value="out" className="mt-0">
              {renderAnimationGrid('out')}
            </TabsContent>
            
            <TabsContent value="loop" className="mt-0">
              {renderAnimationGrid('loop')}
            </TabsContent>
            
            <TabsContent value="zoom" className="mt-0">
              {renderAnimationGrid('zoom')}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}