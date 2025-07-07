import React, { useState } from 'react';
import { 
  Upload, 
  Type, 
  Square, 
  Image, 
  Play, 
  Layers, 
  Palette, 
  Wand2, 
  Download,
  Search,
  Plus,
  Crown,
  Sparkles,
  LayoutTemplate
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { VideoUploader } from './VideoUploader';
import { TextLibrary } from './TextLibrary';
import { ElementsLibrary } from './ElementsLibrary';
import { AIAgentModal } from './AIAgentModal';
import { BrandKit } from './BrandKit';
import { VideoAsset, SceneLayer } from '../types/video';

interface VerticalNavigationProps {
  onVideoSelect: (video: VideoAsset) => void;
  onLayerAdd: (layer: SceneLayer) => void;
  onColorSelect?: (color: string) => void;
}

type NavigationSection = 
  | 'uploads' 
  | 'text' 
  | 'elements' 
  | 'brand-kit'
  | 'templates' 
  | 'ai-assistant';

interface NavigationItem {
  id: NavigationSection;
  label: string;
  icon: React.ElementType;
  isPro?: boolean;
}

const navigationItems: NavigationItem[] = [
  { id: 'uploads', label: 'Uploads', icon: Upload },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'elements', label: 'Elements', icon: Square },
  { id: 'brand-kit', label: 'Brand Kit', icon: Crown, isPro: true },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Wand2, isPro: true }
];

export function VerticalNavigation({ onVideoSelect, onLayerAdd, onColorSelect }: VerticalNavigationProps) {
  const [activeSection, setActiveSection] = useState<NavigationSection>('uploads');
  const [showAIModal, setShowAIModal] = useState(false);

  const handleNavigation = (sectionId: NavigationSection) => {
    if (sectionId === 'ai-assistant') {
      setShowAIModal(true);
    } else {
      setActiveSection(sectionId);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'uploads':
        return (
          <div className="p-4">
            <VideoUploader onVideoSelect={onVideoSelect} />
          </div>
        );
      
      case 'text':
        return (
          <div className="p-4">
            <TextLibrary onLayerAdd={onLayerAdd} />
          </div>
        );
      
      case 'elements':
        return (
          <div className="p-4">
            <ElementsLibrary onLayerAdd={onLayerAdd} />
          </div>
        );
      
      case 'brand-kit':
        return (
          <BrandKit 
            onColorSelect={onColorSelect}
            onFontSelect={(font) => {
              // Handle font selection - could integrate with text layers
              console.log('Font selected:', font);
            }}
            onLogoSelect={(logo) => {
              // Handle logo selection - could add as image layer
              console.log('Logo selected:', logo);
            }}
          />
        );
      
      case 'templates':
        return (
          <div className="p-4">
            <div className="text-center py-12">
              <LayoutTemplate className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Templates Coming Soon</h3>
              <p className="text-sm text-gray-600 mb-4">
                Professional video templates to jumpstart your projects
              </p>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Request Template
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-4">
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Select a Section</h3>
              <p className="text-sm text-gray-600">
                Choose from the navigation items to get started
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Navigation Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-1">Design Tools</h2>
        <p className="text-sm text-gray-600">Add elements to your video</p>
      </div>

      {/* Navigation Items */}
      <div className="px-2 py-3 border-b border-gray-200">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
                {item.isPro && (
                  <div className="ml-auto">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      PRO
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderSectionContent()}
      </div>

      {/* AI Assistant Modal */}
      <AIAgentModal 
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onLayerAdd={onLayerAdd}
      />
    </div>
  );
}