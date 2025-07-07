import React, { useState, useRef, useEffect } from 'react';
import { Check, Monitor, Smartphone, Square, Tv, ChevronDown, Search, Settings2 } from 'lucide-react';
import { ProjectSize, PROJECT_SIZES } from '../types/video';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ProjectSizeSelectorProps {
  currentSize: ProjectSize;
  onSizeChange: (size: ProjectSize) => void;
  autoOpen?: boolean;
  compact?: boolean;
}

// Social media platform presets with branding
const SOCIAL_MEDIA_PRESETS = [
  {
    id: 'original',
    name: 'Original',
    label: 'Original (16:9)',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    icon: '📺',
    color: '#6B7280'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    label: 'YouTube (16:9)',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    icon: '▶️',
    color: '#FF0000'
  },
  {
    id: 'youtube-short',
    name: 'YouTube Short',
    label: 'YouTube Short (9:16)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    icon: '🔴',
    color: '#FF0000'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    label: 'TikTok (9:16)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    icon: '🎵',
    color: '#000000'
  },
  {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    label: 'Instagram Reel (9:16)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    icon: '📱',
    color: '#E4405F'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    label: 'Instagram Story (9:16)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    icon: '📸',
    color: '#E4405F'
  }
];

export function ProjectSizeSelector({ currentSize, onSizeChange, autoOpen = false, compact = false }: ProjectSizeSelectorProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Provide default values if currentSize is undefined
  const safeCurrentSize = currentSize || SOCIAL_MEDIA_PRESETS[0];

  // Find current preset or default to Original
  const currentPreset = SOCIAL_MEDIA_PRESETS.find(preset => 
    preset.width === safeCurrentSize.width && preset.height === safeCurrentSize.height
  ) || SOCIAL_MEDIA_PRESETS[0];

  const handlePresetSelect = (preset: typeof SOCIAL_MEDIA_PRESETS[0]) => {
    const size: ProjectSize = {
      id: preset.id,
      name: preset.name,
      label: preset.label,
      width: preset.width,
      height: preset.height,
      aspectRatio: preset.aspectRatio
    };
    onSizeChange(size);
    setIsPopoverOpen(false);
  };

  // Filter presets based on search
  const filteredPresets = SOCIAL_MEDIA_PRESETS.filter(preset =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preset.aspectRatio.includes(searchQuery)
  );

  // Handle auto-open behavior
  const handleButtonClick = () => {
    if (autoOpen) {
      setIsPopoverOpen(true);
    }
  };

  // Auto-open effect for when autoOpen is enabled
  useEffect(() => {
    if (autoOpen && !isPopoverOpen) {
      const timer = setTimeout(() => {
        setIsPopoverOpen(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [autoOpen]);

  // Use compact styling when compact prop is true
  const buttonHeight = compact ? 'h-8' : 'h-10';
  const buttonPadding = compact ? 'px-2' : 'px-3';
  const textSize = compact ? 'text-xs' : 'text-sm';
  const iconSize = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const spacing = compact ? 'space-x-1.5' : 'space-x-2';

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          ref={buttonRef}
          variant="ghost"
          className={`${buttonHeight} ${buttonPadding} bg-transparent hover:bg-gray-100 text-gray-900 border-0 shadow-none rounded-lg`}
          onClick={handleButtonClick}
        >
          <div className={`flex items-center ${spacing}`}>
            <Monitor className={`${iconSize} text-gray-600`} />
            <span className={`${textSize} font-medium`}>{currentPreset.name}</span>
            <span className={`${textSize} text-gray-500`}>({currentPreset.aspectRatio})</span>
            <ChevronDown className={`${iconSize} text-gray-500 transition-transform duration-200 ${isPopoverOpen ? 'rotate-180' : ''}`} />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start" side="top" sideOffset={8}>
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Search Header */}
          <div className="p-4 pb-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-lg text-sm placeholder-gray-400"
              />
            </div>
          </div>

          {/* Preset Options */}
          <div className="py-2 max-h-80 overflow-y-auto">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-3"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: preset.color }}
                >
                  {preset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{preset.name}</div>
                  <div className="text-xs text-gray-500">({preset.aspectRatio})</div>
                </div>
                {currentPreset.id === preset.id && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4 pt-3">
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Settings2 className="w-4 h-4" />
              <span>Resize for social media</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}