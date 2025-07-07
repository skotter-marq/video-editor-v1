import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, Download, Upload, Palette, Type, Layout, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

// Marq.com Brand Assets
const MARQ_BRAND = {
  name: 'Marq',
  colors: {
    primary: ['#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    secondary: ['#10B981', '#059669', '#047857', '#065F46'],
    accent: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
    neutral: ['#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#FFFFFF'],
    background: ['#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB']
  },
  fonts: [
    { name: 'Marq Heading', family: 'Inter', weight: '700', example: 'Create Stunning Designs' },
    { name: 'Marq Subheading', family: 'Inter', weight: '600', example: 'Professional Marketing Materials' },
    { name: 'Marq Body', family: 'Inter', weight: '400', example: 'Build beautiful marketing materials in minutes, not hours.' },
    { name: 'Marq Caption', family: 'Inter', weight: '500', example: 'Powered by AI • Design Made Simple' }
  ],
  logos: [
    { id: 'primary', name: 'Primary Logo', type: 'Dark', bg: '#FFFFFF' },
    { id: 'white', name: 'White Logo', type: 'Light', bg: '#2563EB' },
    { id: 'icon', name: 'Icon Only', type: 'Symbol', bg: '#F3F4F6' },
    { id: 'horizontal', name: 'Horizontal', type: 'Wide', bg: '#FFFFFF' }
  ],
  styles: [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, corporate design',
      colors: ['#2563EB', '#FFFFFF', '#F3F4F6'],
      font: 'Inter'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary and sleek',
      colors: ['#111827', '#10B981', '#FFFFFF'],
      font: 'Inter'
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      description: 'Bold and energetic',
      colors: ['#F59E0B', '#2563EB', '#10B981'],
      font: 'Inter'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and clean',
      colors: ['#FFFFFF', '#374151', '#F9FAFB'],
      font: 'Inter'
    }
  ],
  layouts: [
    { id: 'hero', name: 'Hero Section', category: 'Headers' },
    { id: 'feature', name: 'Feature Grid', category: 'Content' },
    { id: 'testimonial', name: 'Testimonials', category: 'Social Proof' },
    { id: 'cta', name: 'Call to Action', category: 'Conversion' }
  ]
};

interface BrandKitProps {
  onColorSelect?: (color: string) => void;
  onFontSelect?: (font: typeof MARQ_BRAND.fonts[0]) => void;
  onLogoSelect?: (logo: typeof MARQ_BRAND.logos[0]) => void;
}

export function BrandKit({ onColorSelect, onFontSelect, onLogoSelect }: BrandKitProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'logos' | 'colors' | 'fonts' | 'styles' | 'layouts'>('overview');

  const renderLogo = (logo: typeof MARQ_BRAND.logos[0], size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };

    return (
      <div 
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center border border-gray-200`}
        style={{ backgroundColor: logo.bg }}
      >
        <div className="font-bold text-blue-600" style={{ fontSize: size === 'sm' ? '10px' : size === 'md' ? '14px' : '18px' }}>
          marq
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
          <Upload className="w-5 h-5 text-gray-600" />
          <span className="text-sm">Upload Logo</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
          <Palette className="w-5 h-5 text-gray-600" />
          <span className="text-sm">Add Colors</span>
        </Button>
      </div>

      {/* Logos Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Logos</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveSection('logos')}
            className="text-blue-600 hover:text-blue-700"
          >
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MARQ_BRAND.logos.slice(0, 4).map((logo) => (
            <button
              key={logo.id}
              onClick={() => onLogoSelect?.(logo)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {renderLogo(logo, 'sm')}
            </button>
          ))}
        </div>
      </div>

      {/* Colors Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Colors</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveSection('colors')}
            className="text-blue-600 hover:text-blue-700"
          >
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="flex space-x-1">
          {MARQ_BRAND.colors.primary.concat(MARQ_BRAND.colors.secondary.slice(0, 2)).map((color, index) => (
            <button
              key={index}
              onClick={() => onColorSelect?.(color)}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Fonts Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Fonts</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveSection('fonts')}
            className="text-blue-600 hover:text-blue-700"
          >
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="space-y-2">
          {MARQ_BRAND.fonts.slice(0, 2).map((font) => (
            <button
              key={font.name}
              onClick={() => onFontSelect?.(font)}
              className="w-full p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="font-semibold text-gray-900 text-sm">{font.name}</div>
              <div 
                className="text-gray-600 text-sm mt-1 truncate"
                style={{ fontFamily: font.family, fontWeight: font.weight }}
              >
                {font.example}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLogos = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Logo Variations</h3>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {MARQ_BRAND.logos.map((logo) => (
          <button
            key={logo.id}
            onClick={() => onLogoSelect?.(logo)}
            className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex flex-col items-center space-y-3">
              {renderLogo(logo, 'lg')}
              <div className="text-center">
                <div className="font-medium text-gray-900 text-sm">{logo.name}</div>
                <div className="text-xs text-gray-500">{logo.type}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderColors = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Brand Colors</h3>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Color
        </Button>
      </div>

      {/* Primary Colors */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Primary</h4>
        <div className="grid grid-cols-4 gap-3">
          {MARQ_BRAND.colors.primary.map((color, index) => (
            <button
              key={index}
              onClick={() => onColorSelect?.(color)}
              className="group relative"
            >
              <div 
                className="w-full h-16 rounded-lg border border-gray-200 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
              />
              <div className="mt-2 text-xs text-gray-600 font-mono">{color}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Colors */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Secondary</h4>
        <div className="grid grid-cols-4 gap-3">
          {MARQ_BRAND.colors.secondary.map((color, index) => (
            <button
              key={index}
              onClick={() => onColorSelect?.(color)}
              className="group relative"
            >
              <div 
                className="w-full h-16 rounded-lg border border-gray-200 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
              />
              <div className="mt-2 text-xs text-gray-600 font-mono">{color}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Neutral Colors */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Neutral</h4>
        <div className="grid grid-cols-7 gap-2">
          {MARQ_BRAND.colors.neutral.map((color, index) => (
            <button
              key={index}
              onClick={() => onColorSelect?.(color)}
              className="group relative"
            >
              <div 
                className="w-full h-12 rounded-lg border border-gray-200 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
              />
              <div className="mt-1 text-xs text-gray-600 font-mono truncate">{color}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFonts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Typography</h3>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Font
        </Button>
      </div>

      <div className="space-y-3">
        {MARQ_BRAND.fonts.map((font) => (
          <button
            key={font.name}
            onClick={() => onFontSelect?.(font)}
            className="w-full p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900">{font.name}</div>
              <Badge variant="secondary">{font.family}</Badge>
            </div>
            <div 
              className="text-gray-700"
              style={{ 
                fontFamily: font.family, 
                fontWeight: font.weight,
                fontSize: font.name.includes('Heading') ? '18px' : font.name.includes('Subheading') ? '16px' : '14px'
              }}
            >
              {font.example}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStyles = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Design Styles</h3>
        <Button size="sm" variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          Create Style
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MARQ_BRAND.styles.map((style) => (
          <button
            key={style.id}
            className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">{style.name}</div>
                <div className="text-sm text-gray-600">{style.description}</div>
              </div>
              <div className="flex space-x-1">
                {style.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLayouts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Layout Templates</h3>
        <Button size="sm" variant="outline">
          <Layout className="w-4 h-4 mr-2" />
          Create Layout
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MARQ_BRAND.layouts.map((layout) => (
          <button
            key={layout.id}
            className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="w-full h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
              <Layout className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">{layout.name}</div>
            <div className="text-xs text-gray-500">{layout.category}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const sectionTabs = [
    { id: 'overview', name: 'Overview', icon: Sparkles },
    { id: 'logos', name: 'Logos', icon: Upload },
    { id: 'colors', name: 'Colors', icon: Palette },
    { id: 'fonts', name: 'Fonts', icon: Type },
    { id: 'styles', name: 'Styles', icon: Sparkles },
    { id: 'layouts', name: 'Layouts', icon: Layout }
  ] as const;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{MARQ_BRAND.name} Brand Kit</h2>
              <p className="text-sm text-gray-600">Professional design system</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search brand assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Section Tabs */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto">
          {sectionTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'logos' && renderLogos()}
        {activeSection === 'colors' && renderColors()}
        {activeSection === 'fonts' && renderFonts()}
        {activeSection === 'styles' && renderStyles()}
        {activeSection === 'layouts' && renderLayouts()}
      </ScrollArea>
    </div>
  );
}