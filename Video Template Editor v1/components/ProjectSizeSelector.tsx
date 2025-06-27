import React, { useState } from 'react';
import { Check, Monitor, Smartphone, Square, Tv, ChevronDown } from 'lucide-react';
import { ProjectSize, PROJECT_SIZES } from '../types/video';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ProjectSizeSelectorProps {
  currentSize: ProjectSize;
  onSizeChange: (size: ProjectSize) => void;
}

export function ProjectSizeSelector({ currentSize, onSizeChange }: ProjectSizeSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');

  const getIcon = (aspectRatio: string, isMainButton = false) => {
    const iconClass = isMainButton ? "w-3.5 h-3.5 text-foreground" : "w-4 h-4";
    switch (aspectRatio) {
      case '16:9':
        return <Monitor className={iconClass} />;
      case '9:16':
        return <Smartphone className={iconClass} />;
      case '1:1':
        return <Square className={iconClass} />;
      case '4:3':
        return <Tv className={iconClass} />;
      default:
        return <Monitor className={iconClass} />;
    }
  };

  const handlePresetSelect = (size: ProjectSize) => {
    onSizeChange(size);
    setIsDialogOpen(false);
  };

  const handleCustomSize = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width > 0 && height > 0) {
      const aspectRatio = `${width}:${height}`;
      const customSize: ProjectSize = {
        id: 'custom',
        name: 'Custom',
        label: 'Custom Size',
        width,
        height,
        aspectRatio
      };
      onSizeChange(customSize);
      setIsDialogOpen(false);
      setCustomWidth('');
      setCustomHeight('');
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="relative w-full h-10 bg-card border-border hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 group"
        >
          {/* Content */}
          <div className="flex items-center justify-between w-full px-2.5">
            <div className="flex items-center space-x-2">
              {/* Icon */}
              <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                {getIcon(currentSize.aspectRatio, true)}
              </div>
              
              {/* Text Content */}
              <div className="text-left">
                <div className="font-medium text-foreground text-sm">
                  {currentSize.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentSize.width} × {currentSize.height}
                </div>
              </div>
            </div>
            
            {/* Chevron */}
            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
              <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:translate-y-0.5 transition-transform duration-200" />
            </div>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Canvas Size</DialogTitle>
          <DialogDescription>
            Choose a preset size or create a custom canvas dimension.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset Sizes */}
          <div className="space-y-2">
            <Label>Preset Sizes</Label>
            <div className="grid gap-2">
              {PROJECT_SIZES.map((size) => (
                <Button
                  key={`preset-${size.id}`}
                  variant={currentSize.id === size.id ? "default" : "ghost"}
                  className="justify-start h-12"
                  onClick={() => handlePresetSelect(size)}
                >
                  <div className="flex items-center space-x-3">
                    <div key={`icon-${size.id}`}>
                      {getIcon(size.aspectRatio, false)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{size.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {size.width} × {size.height}px ({size.aspectRatio})
                      </div>
                    </div>
                  </div>
                  {currentSize.id === size.id && (
                    <Check key={`check-${size.id}`} className="w-4 h-4 ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Size */}
          <div className="space-y-2">
            <Label>Custom Size</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Width"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                />
              </div>
              <div className="flex items-center text-muted-foreground px-2">×</div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Height"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleCustomSize}
              disabled={!customWidth || !customHeight}
              className="w-full"
            >
              Apply Custom Size
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}