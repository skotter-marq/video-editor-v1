import React, { useState } from 'react';
import { Square, Circle, Triangle, Star, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Heart, Plus, Grid3X3, LayoutGrid, Layers, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { SceneLayer } from '../types/video';

interface ElementsLibraryProps {
  onElementDragStart?: (elementData: any) => void;
  onElementAdd?: (elementData: any) => void;
  onGridSelect?: (gridData: any, replaceScene: boolean) => void;
}

// Shape definitions with properly centered SVG paths within 100x100 viewBox
const SHAPES = [
  // Basic Shapes - all centered
  { id: 'rectangle', name: 'Rectangle', category: 'basic', path: 'M20,35 L80,35 L80,65 L20,65 Z' },
  { id: 'rounded-rectangle', name: 'Rounded Rectangle', category: 'basic', path: 'M25,35 L75,35 Q80,35 80,40 L80,60 Q80,65 75,65 L25,65 Q20,65 20,60 L20,40 Q20,35 25,35 Z' },
  { id: 'circle', name: 'Circle', category: 'basic', path: 'M50,20 A30,30 0 1,1 49.9,20 Z' },
  { id: 'triangle', name: 'Triangle', category: 'basic', path: 'M50,25 L75,70 L25,70 Z' },
  { id: 'triangle-down', name: 'Triangle Down', category: 'basic', path: 'M25,30 L75,30 L50,75 Z' },
  
  // Polygons - all centered
  { id: 'diamond', name: 'Diamond', category: 'polygon', path: 'M50,20 L80,50 L50,80 L20,50 Z' },
  { id: 'pentagon', name: 'Pentagon', category: 'polygon', path: 'M50,20 L73,35 L65,65 L35,65 L27,35 Z' },
  { id: 'hexagon', name: 'Hexagon', category: 'polygon', path: 'M37.5,25 L62.5,25 L75,50 L62.5,75 L37.5,75 L25,50 Z' },
  { id: 'octagon', name: 'Octagon', category: 'polygon', path: 'M35,25 L65,25 L75,35 L75,65 L65,75 L35,75 L25,65 L25,35 Z' },
  
  // Stars - all centered
  { id: 'star-4', name: '4-Point Star', category: 'star', path: 'M50,20 L55,45 L80,50 L55,55 L50,80 L45,55 L20,50 L45,45 Z' },
  { id: 'star-5', name: '5-Point Star', category: 'star', path: 'M50,20 L57,42 L78,42 L62,55 L69,77 L50,65 L31,77 L38,55 L22,42 L43,42 Z' },
  { id: 'star-6', name: '6-Point Star', category: 'star', path: 'M50,20 L58,40 L78,40 L65,55 L78,70 L58,70 L50,90 L42,70 L22,70 L35,55 L22,40 L42,40 Z' },
  
  // Arrows - all centered
  { id: 'arrow-right', name: 'Arrow Right', category: 'arrow', path: 'M20,45 L60,45 L60,35 L80,50 L60,65 L60,55 L20,55 Z' },
  { id: 'arrow-left', name: 'Arrow Left', category: 'arrow', path: 'M80,45 L40,45 L40,35 L20,50 L40,65 L40,55 L80,55 Z' },
  { id: 'arrow-up', name: 'Arrow Up', category: 'arrow', path: 'M45,80 L45,40 L35,40 L50,20 L65,40 L55,40 L55,80 Z' },
  { id: 'arrow-down', name: 'Arrow Down', category: 'arrow', path: 'M45,20 L45,60 L35,60 L50,80 L65,60 L55,60 L55,20 Z' },
  
  // Symbols - all centered
  { id: 'heart', name: 'Heart', category: 'symbol', path: 'M50,75 C50,75 30,60 30,45 C30,35 37,27 50,35 C63,27 70,35 70,45 C70,60 50,75 50,75 Z' },
  { id: 'plus', name: 'Plus', category: 'symbol', path: 'M45,25 L55,25 L55,45 L75,45 L75,55 L55,55 L55,75 L45,75 L45,55 L25,55 L25,45 L45,45 Z' },
  { id: 'cross', name: 'Cross', category: 'symbol', path: 'M42,25 L58,25 L58,42 L75,42 L75,58 L58,58 L58,75 L42,75 L42,58 L25,58 L25,42 L42,42 Z' }
];

// Frame definitions
const FRAMES = [
  { id: 'frame-rectangle', name: 'Rectangle Frame', shape: 'rectangle', path: 'M15,25 L85,25 L85,75 L15,75 Z' },
  { id: 'frame-rounded', name: 'Rounded Frame', shape: 'rounded', path: 'M20,25 L80,25 Q85,25 85,30 L85,70 Q85,75 80,75 L20,75 Q15,75 15,70 L15,30 Q15,25 20,25 Z' },
  { id: 'frame-circle', name: 'Circle Frame', shape: 'circle', path: 'M50,20 A30,27.5 0 1,1 49.9,20 Z' },
  { id: 'frame-heart', name: 'Heart Frame', shape: 'heart', path: 'M50,75 C50,75 30,60 30,45 C30,35 37,27 50,35 C63,27 70,35 70,45 C70,60 50,75 50,75 Z' }
];

// Grid layouts
const GRIDS = [
  { id: 'grid-1x1', name: 'Single', columns: 1, rows: 1, slots: 1 },
  { id: 'grid-2x1', name: '2 Column', columns: 2, rows: 1, slots: 2 },
  { id: 'grid-1x2', name: '2 Row', columns: 1, rows: 2, slots: 2 },
  { id: 'grid-2x2', name: '2x2 Grid', columns: 2, rows: 2, slots: 4 },
  { id: 'grid-3x1', name: '3 Column', columns: 3, rows: 1, slots: 3 },
  { id: 'grid-1x3', name: '3 Row', columns: 1, rows: 3, slots: 3 },
  { id: 'grid-3x2', name: '3x2 Grid', columns: 3, rows: 2, slots: 6 },
  { id: 'grid-2x3', name: '2x3 Grid', columns: 2, rows: 3, slots: 6 }
];

export function ElementsLibrary({
  onElementDragStart,
  onElementAdd,
  onGridSelect
}: ElementsLibraryProps) {
  const [activeSection, setActiveSection] = useState<'shapes' | 'frames' | 'grids'>('shapes');
  const [draggedElement, setDraggedElement] = useState<any>(null);
  const [showGridOptions, setShowGridOptions] = useState<any>(null);

  const handleDragStart = (e: React.DragEvent, elementData: any) => {
    e.dataTransfer.setData('element-data', JSON.stringify(elementData));
    setDraggedElement(elementData);
    onElementDragStart?.(elementData);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
  };

  const handleElementClick = (elementData: any) => {
    if (elementData.type === 'grid') {
      setShowGridOptions(elementData);
    } else {
      onElementAdd?.(elementData);
    }
  };

  const handleGridOptionSelect = (replaceScene: boolean) => {
    if (showGridOptions && onGridSelect) {
      onGridSelect(showGridOptions, replaceScene);
    }
    setShowGridOptions(null);
  };

  const renderShapes = () => (
    <div className="p-6 pb-8">
      {['basic', 'polygon', 'star', 'arrow', 'symbol'].map((category, index) => (
        <div key={category} className={index === 4 ? "mb-0" : "mb-8"}>
          <h4 className="text-sm font-semibold mb-6 capitalize text-foreground tracking-wide">
            {category === 'basic' ? 'BASIC SHAPES' : 
             category === 'polygon' ? 'POLYGONS' :
             category === 'star' ? 'STARS' :
             category === 'arrow' ? 'ARROWS' : 'SYMBOLS'}
          </h4>
          <div className="flex flex-wrap gap-3 items-center">
            {SHAPES.filter(shape => shape.category === category).map((shape) => (
              <div
                key={shape.id}
                className={`group cursor-pointer transition-all duration-200 hover:scale-105 flex items-center justify-center rounded-lg hover:bg-muted/30 ${
                  draggedElement?.id === shape.id ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, { ...shape, type: 'shape' })}
                onDragEnd={handleDragEnd}
                onClick={() => handleElementClick({ ...shape, type: 'shape' })}
                title={shape.name}
                style={{ 
                  width: '56px',
                  height: '56px'
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-12 h-12 flex-shrink-0"
                  fill="#6b7280"
                  style={{
                    display: 'block',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <path d={shape.path} />
                </svg>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFrames = () => (
    <div className="p-6 pb-8">
      <h4 className="text-sm font-semibold mb-6 text-foreground tracking-wide">IMAGE FRAMES</h4>
      <div className="flex flex-wrap gap-4 items-center">
        {FRAMES.map((frame) => (
          <div
            key={frame.id}
            className={`group border border-border rounded-xl p-4 cursor-pointer transition-all hover:bg-muted/40 hover:border-primary/30 hover:shadow-sm flex items-center justify-center ${
              draggedElement?.id === frame.id ? 'opacity-50' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, { ...frame, type: 'frame' })}
            onDragEnd={handleDragEnd}
            onClick={() => handleElementClick({ ...frame, type: 'frame' })}
            title={frame.name}
            style={{ 
              width: '80px',
              height: '64px'
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-10 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4,2"
                style={{
                  display: 'block',
                  margin: 'auto'
                }}
              >
                <path d={frame.path} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] text-muted-foreground/60 text-center leading-tight">
                  Drop<br />Image
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGrids = () => (
    <div className="p-6 pb-8">
      <h4 className="text-sm font-semibold mb-6 text-foreground tracking-wide">LAYOUT GRIDS</h4>
      <div className="flex flex-wrap gap-4 items-center">
        {GRIDS.map((grid) => (
          <div
            key={grid.id}
            className={`group border border-border rounded-xl p-4 cursor-pointer transition-all hover:bg-muted/40 hover:border-primary/30 hover:shadow-sm flex flex-col items-center justify-center ${
              draggedElement?.id === grid.id ? 'opacity-50' : ''
            }`}
            onClick={() => handleElementClick({ ...grid, type: 'grid' })}
            title={grid.name}
            style={{ 
              width: '80px',
              height: '80px'
            }}
          >
            <div 
              className="w-8 h-6 grid gap-0.5 mb-2"
              style={{
                gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
                gridTemplateRows: `repeat(${grid.rows}, 1fr)`
              }}
            >
              {Array.from({ length: grid.slots }).map((_, index) => (
                <div
                  key={index}
                  className="bg-muted/30 border border-muted-foreground/20 rounded-sm flex items-center justify-center"
                >
                  <Plus className="w-1 h-1 text-muted-foreground/40" />
                </div>
              ))}
            </div>
            <div className="text-[8px] text-center text-muted-foreground">
              {grid.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center space-x-3">
          <Square className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Elements</h3>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="px-6 py-3 border-b border-border shrink-0">
        <div className="flex space-x-2">
          <Button
            variant={activeSection === 'shapes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('shapes')}
            className="h-9 px-4"
          >
            Shapes
          </Button>
          <Button
            variant={activeSection === 'frames' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('frames')}
            className="h-9 px-4"
          >
            Frames
          </Button>
          <Button
            variant={activeSection === 'grids' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('grids')}
            className="h-9 px-4"
          >
            <Grid3X3 className="w-3 h-3 mr-2" />
            Grids
          </Button>
        </div>
      </div>

      {/* Content with Enhanced Vertical Scrolling */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="min-h-0">
          {activeSection === 'shapes' && renderShapes()}
          {activeSection === 'frames' && renderFrames()}
          {activeSection === 'grids' && renderGrids()}
        </div>
      </ScrollArea>

      {/* Grid Options Modal */}
      {showGridOptions && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold mb-4">Apply Grid Layout</h3>
            <p className="text-sm text-muted-foreground mb-6">
              How would you like to apply the {showGridOptions.name} layout?
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => handleGridOptionSelect(true)}
              >
                <Layers className="w-4 h-4 mr-2" />
                Replace Current Scene
              </Button>
              <Button 
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleGridOptionSelect(false)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Scene
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full mt-4"
              onClick={() => setShowGridOptions(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Footer Hint */}
      <div className="px-6 py-3 border-t border-border shrink-0">
        <p className="text-xs text-muted-foreground text-center">
          Click to add • Drag to canvas
        </p>
      </div>
    </div>
  );
}