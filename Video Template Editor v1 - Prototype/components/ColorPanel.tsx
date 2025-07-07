import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Search, Plus, Edit, Palette } from 'lucide-react';
import exampleImage from 'figma:asset/804f0d4b75997f6d4af7870df1763a6cc9954279.png';

interface ColorPanelProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export function ColorPanel({ selectedColor, onColorChange, onClose }: ColorPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Document colors - including the color wheel and basic colors
  const documentColors = [
    { type: 'wheel', color: 'linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0088ff, #8800ff, #ff0088)' },
    { type: 'solid', color: '#000000' },
    { type: 'outline', color: '#ffffff', border: '#8b5cf6' },
  ];

  // Default solid colors organized by color families
  const defaultColors = [
    // Grays
    ['#000000', '#404040', '#606060', '#808080', '#a0a0a0', '#ffffff'],
    // Reds and Pinks
    ['#e53e3e', '#f56565', '#fc8181', '#feb2b2', '#fed7d7', '#fff5f5'],
    // Blues
    ['#2b6cb0', '#3182ce', '#4299e1', '#63b3ed', '#90cdf4', '#bee3f8'],
    // Greens and Yellows
    ['#38a169', '#48bb78', '#68d391', '#9ae6b4', '#c6f6d5', '#f0fff4'],
    // Purples
    ['#805ad5', '#9f7aea', '#b794f6', '#d6bcfa', '#e9d8fd', '#faf5ff'],
    // Additional colors
    ['#d69e2e', '#ecc94b', '#f6e05e', '#faf089', '#fefcbf', '#fffff0'],
  ];

  const handleColorSelect = (color: string) => {
    onColorChange(color);
  };

  const ColorCircle = ({ color, type = 'solid', border, onClick, isSelected = false }: {
    color: string;
    type?: 'solid' | 'wheel' | 'outline';
    border?: string;
    onClick: () => void;
    isSelected?: boolean;
  }) => {
    if (type === 'wheel') {
      return (
        <button
          onClick={onClick}
          className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-105 relative ${
            isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
          }`}
          style={{ background: color }}
        >
          <Plus className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
        </button>
      );
    }

    if (type === 'outline') {
      return (
        <button
          onClick={onClick}
          className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-105 ${
            isSelected ? 'border-blue-500 ring-2 ring-blue-200' : ''
          }`}
          style={{ 
            backgroundColor: color,
            borderColor: border || '#e5e7eb'
          }}
        />
      );
    }

    return (
      <button
        onClick={onClick}
        className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-105 ${
          isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
        }`}
        style={{ backgroundColor: color }}
      />
    );
  };

  const SmallColorCircle = ({ color, onClick, isSelected = false }: {
    color: string;
    onClick: () => void;
    isSelected?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full border transition-all hover:scale-105 ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200'
      }`}
      style={{ backgroundColor: color }}
    />
  );

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Color</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder='Try "blue" or "#00c4cc"'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Document Colors */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Document colors</h3>
          </div>
          <div className="flex space-x-3">
            {documentColors.map((item, index) => (
              <ColorCircle
                key={index}
                color={item.color}
                type={item.type as any}
                border={item.border}
                onClick={() => item.type === 'solid' && handleColorSelect(item.color)}
                isSelected={selectedColor === item.color}
              />
            ))}
          </div>
        </div>

        {/* Brand Kit */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
              <h3 className="font-medium text-gray-900">Brand Kit</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-sm text-gray-600 h-8">
              Edit
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <Button variant="ghost" className="w-full flex items-center justify-center space-x-2 text-gray-600">
              <Plus className="w-4 h-4" />
              <span>Add your brand colors</span>
            </Button>
          </div>
        </div>

        {/* Default Colors */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <h3 className="font-medium text-gray-900">Default colors</h3>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm text-gray-600">Solid colors</h4>
            <div className="space-y-2">
              {defaultColors.map((row, rowIndex) => (
                <div key={rowIndex} className="flex space-x-2">
                  {row.map((color) => (
                    <SmallColorCircle
                      key={color}
                      color={color}
                      onClick={() => handleColorSelect(color)}
                      isSelected={selectedColor === color}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}