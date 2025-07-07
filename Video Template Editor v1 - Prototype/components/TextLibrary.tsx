import React, { useState } from 'react';
import { Type, Sparkles, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { SceneLayer } from '../types/video';

interface TextLibraryProps {
  onTextSelect: (textStyle: any) => void;
  canvasSize: { width: number; height: number };
  onTextDragStart?: (textStyle: any) => void;
}

// Combined text styles - merging default styles and font combinations
const TEXT_STYLES = [
  // Basic styles
  {
    id: 'heading-large',
    name: 'Heading Large',
    preview: 'Heading Large',
    fontFamily: 'Inter',
    fontSize: 64,
    fontWeight: 'bold',
    color: '#000000',
    category: 'basic'
  },
  {
    id: 'heading-medium',
    name: 'Heading Medium',
    preview: 'Heading Medium',
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    category: 'basic'
  },
  {
    id: 'heading-small',
    name: 'Heading Small',
    preview: 'Heading Small',
    fontFamily: 'Inter',
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    category: 'basic'
  },
  {
    id: 'subheading',
    name: 'Subheading',
    preview: 'Subheading',
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: 'medium',
    color: '#666666',
    category: 'basic'
  },
  {
    id: 'body-large',
    name: 'Body Large',
    preview: 'Body Large',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 'normal',
    color: '#000000',
    category: 'basic'
  },
  {
    id: 'body-text',
    name: 'Body Text',
    preview: 'Body Text',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000000',
    category: 'basic'
  },
  {
    id: 'caption',
    name: 'Caption',
    preview: 'Caption text',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
    color: '#888888',
    category: 'basic'
  },

  // Professional combinations
  {
    id: 'modern-title',
    name: 'Modern Title',
    preview: 'Modern Title',
    fontFamily: 'Inter',
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1a1a1a',
    category: 'professional'
  },
  {
    id: 'elegant-heading',
    name: 'Elegant Heading',
    preview: 'Elegant Heading',
    fontFamily: 'Georgia',
    fontSize: 42,
    fontWeight: 'normal',
    color: '#2c2c2c',
    category: 'professional'
  },
  {
    id: 'clean-subtitle',
    name: 'Clean Subtitle',
    preview: 'Clean Subtitle',
    fontFamily: 'Helvetica',
    fontSize: 28,
    fontWeight: 'medium',
    color: '#555555',
    category: 'professional'
  },
  {
    id: 'minimalist-text',
    name: 'Minimalist Text',
    preview: 'Minimalist Text',
    fontFamily: 'Arial',
    fontSize: 18,
    fontWeight: 'normal',
    color: '#333333',
    category: 'professional'
  },

  // Creative combinations
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    preview: 'BOLD IMPACT',
    fontFamily: 'Inter',
    fontSize: 72,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    category: 'creative'
  },
  {
    id: 'stylish-quote',
    name: 'Stylish Quote',
    preview: 'Stylish Quote',
    fontFamily: 'Georgia',
    fontSize: 32,
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#444444',
    category: 'creative'
  },
  {
    id: 'playful-text',
    name: 'Playful Text',
    preview: 'Playful Text',
    fontFamily: 'Roboto',
    fontSize: 26,
    fontWeight: 'medium',
    color: '#6366f1',
    category: 'creative'
  },
  {
    id: 'accent-highlight',
    name: 'Accent Highlight',
    preview: 'Accent Highlight',
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dc2626',
    category: 'creative'
  },

  // Branded combinations
  {
    id: 'brand-headline',
    name: 'Brand Headline',
    preview: 'Brand Headline',
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1f2937',
    category: 'branded'
  },
  {
    id: 'corporate-title',
    name: 'Corporate Title',
    preview: 'Corporate Title',
    fontFamily: 'Helvetica',
    fontSize: 36,
    fontWeight: 'medium',
    color: '#374151',
    category: 'branded'
  },
  {
    id: 'premium-text',
    name: 'Premium Text',
    preview: 'Premium Text',
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: 'normal',
    color: '#111827',
    category: 'branded'
  },
  {
    id: 'signature-style',
    name: 'Signature Style',
    preview: 'Signature Style',
    fontFamily: 'Times New Roman',
    fontSize: 30,
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#4b5563',
    category: 'branded'
  }
];

export function TextLibrary({
  onTextSelect,
  canvasSize,
  onTextDragStart
}: TextLibraryProps) {
  const [draggedStyle, setDraggedStyle] = useState<any>(null);

  const handleDragStart = (e: React.DragEvent, textStyle: any) => {
    e.dataTransfer.setData('text-style', JSON.stringify(textStyle));
    setDraggedStyle(textStyle);
    onTextDragStart?.(textStyle);
  };

  const handleDragEnd = () => {
    setDraggedStyle(null);
  };

  const handleTextStyleClick = (textStyle: any) => {
    onTextSelect(textStyle);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Type className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Text Styles</h3>
        </div>
      </div>

      {/* Single Column of Text Options */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {TEXT_STYLES.map((style) => (
            <div
              key={style.id}
              className={`group relative p-5 border border-border rounded-xl cursor-pointer transition-all hover:bg-muted/40 hover:border-primary/30 hover:shadow-sm ${
                draggedStyle?.id === style.id ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, style)}
              onDragEnd={handleDragEnd}
              onClick={() => handleTextStyleClick(style)}
            >
              {/* Preview Text */}
              <div
                className="mb-3"
                style={{
                  fontFamily: style.fontFamily,
                  fontSize: `${Math.min(style.fontSize / 2.2, 22)}px`,
                  fontWeight: style.fontWeight,
                  fontStyle: style.fontStyle || 'normal',
                  color: style.color,
                  textTransform: style.textTransform || 'none',
                  lineHeight: '1.3'
                }}
              >
                {style.preview}
              </div>

              {/* Style Details */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {style.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {style.fontFamily} • {style.fontSize}px
                  </div>
                </div>

                {/* Category Badge */}
                <Badge 
                  variant="secondary" 
                  className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {style.category}
                </Badge>
              </div>

              {/* Drag Indicator */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Hint */}
      <div className="px-6 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Click to add • Drag to canvas
        </p>
      </div>
    </div>
  );
}