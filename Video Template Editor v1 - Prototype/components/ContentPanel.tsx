import React from 'react';
import { VideoUploader } from './VideoUploader';
import { TextLibrary } from './TextLibrary';
import { ElementsLibrary } from './ElementsLibrary';
import { BrandKit } from './BrandKit';
import { AIAgentModal } from './AIAgentModal';
import { VideoAsset, SceneLayer } from '../types/video';
import { LayoutTemplate, Plus, Sparkles } from 'lucide-react';
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

const sectionTitles = {
  'uploads': 'Media Library',
  'text': 'Text Elements',
  'elements': 'Design Elements',
  'brand-kit': 'Brand Assets',
  'templates': 'Templates',
  'ai-assistant': 'AI Assistant'
};

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
          <div className="flex-1 flex flex-col">
            <VideoUploader 
              videoLibrary={videoLibrary}
              timelineVideos={timelineVideos}
              onVideoUpload={onVideoUpload}
              onVideoSelect={onVideoSelect}
              onAddToTimeline={onAddToTimeline}
            />
          </div>
        );
      
      case 'text':
        return (
          <div className="flex-1 p-6">
            <TextLibrary onLayerAdd={onLayerAdd} />
          </div>
        );
      
      case 'elements':
        return (
          <div className="flex-1 p-6">
            <ElementsLibrary onLayerAdd={onLayerAdd} />
          </div>
        );
      
      case 'brand-kit':
        return (
          <div className="flex-1">
            <BrandKit 
              onColorSelect={onColorSelect}
              onFontSelect={(font) => {
                console.log('Font selected:', font);
              }}
              onLogoSelect={(logo) => {
                console.log('Logo selected:', logo);
              }}
            />
          </div>
        );
      
      case 'templates':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LayoutTemplate className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Templates Coming Soon</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Professional video templates to jumpstart your projects and maintain brand consistency.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Template
              </Button>
            </div>
          </div>
        );
      
      case 'ai-assistant':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Assistant</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Get intelligent help with your video editing projects and creative workflows.
              </p>
              <Button 
                onClick={() => onShowAIModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
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
    <div className="w-[384px] h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">
          {sectionTitles[activeSection as keyof typeof sectionTitles] || activeSection}
        </h2>
        {activeSection === 'uploads' && (
          <p className="text-sm text-gray-500 mt-1">Upload and manage your media files</p>
        )}
        {activeSection === 'text' && (
          <p className="text-sm text-gray-500 mt-1">Add text elements to your video</p>
        )}
        {activeSection === 'elements' && (
          <p className="text-sm text-gray-500 mt-1">Design elements and shapes</p>
        )}
        {activeSection === 'brand-kit' && (
          <p className="text-sm text-gray-500 mt-1">Your brand colors, fonts, and assets</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
      
      {/* AI Assistant Modal */}
      <AIAgentModal 
        isOpen={showAIModal}
        onClose={() => onShowAIModal(false)}
        onLayerAdd={onLayerAdd}
      />
    </div>
  );
}