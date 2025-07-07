import React from 'react';
import { VideoUploader } from './VideoUploader';
import { TextLibrary } from './TextLibrary';
import { ElementsLibrary } from './ElementsLibrary';
import { BrandKit } from './BrandKit';
import { AIAgentModal } from './AIAgentModal';
import { VideoAsset, SceneLayer } from '../types/video';
import { LayoutTemplate, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface ContentPanelProps {
  activeSection: string;
  videoLibrary?: VideoAsset[];
  timelineVideos?: VideoAsset[];
  onVideoUpload?: (video: VideoAsset) => void;
  onVideoSelect: (video: VideoAsset) => void;
  onAddToTimeline?: (video: VideoAsset) => void;
  onLayerAdd: (layer: SceneLayer) => void;
  onColorSelect?: (color: string) => void;
  showAIModal: boolean;
  onShowAIModal: (show: boolean) => void;
}

export function ContentPanel({ 
  activeSection, 
  videoLibrary = [],
  timelineVideos = [],
  onVideoUpload,
  onVideoSelect, 
  onAddToTimeline,
  onLayerAdd, 
  onColorSelect,
  showAIModal,
  onShowAIModal
}: ContentPanelProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'uploads':
        return (
          <VideoUploader 
            videoLibrary={videoLibrary}
            timelineVideos={timelineVideos}
            onVideoUpload={onVideoUpload}
            onVideoSelect={onVideoSelect}
            onAddToTimeline={onAddToTimeline}
          />
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
              console.log('Font selected:', font);
            }}
            onLogoSelect={(logo) => {
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
      
      case 'ai-assistant':
        return (
          <div className="p-4">
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">AI</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get help with your video editing projects
              </p>
              <Button 
                onClick={() => onShowAIModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Open AI Assistant
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!activeSection) return null;

  return (
    <div className="w-[364px] h-full bg-white border-r border-gray-200 flex flex-col">
      {renderContent()}
      
      {/* AI Assistant Modal */}
      <AIAgentModal 
        isOpen={showAIModal}
        onClose={() => onShowAIModal(false)}
        onLayerAdd={onLayerAdd}
      />
    </div>
  );
}