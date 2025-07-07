import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SidebarNavigation } from './components/SidebarNavigation';
import { ContentPanel } from './components/ContentPanel';
import { VideoCanvas } from './components/VideoCanvas';
import { VideoTimeline, VideoTimelineRef } from './components/VideoTimeline';
import { ColorPanel } from './components/ColorPanel';
import { ExportModal } from './components/ExportModal';
import { VideoPropertiesPanel } from './components/VideoPropertiesPanel';
import { VideoAdjustPanel } from './components/VideoAdjustPanel';
import { AnimationsPanel } from './components/AnimationsPanel';
import { VideoAsset, SceneLayer, ProjectSize } from './types/video';

const DEFAULT_PROJECT_SIZE: ProjectSize = {
  id: 'hd-16-9',
  name: 'HD 16:9',
  label: 'HD 16:9 (1920×1080)',
  width: 1920,
  height: 1080,
  aspectRatio: '16:9'
};

function App() {
  const [projectName, setProjectName] = useState('Untitled Project');
  const [videoLibrary, setVideoLibrary] = useState<VideoAsset[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoAsset | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoAsset | null>(null);
  const [timelineVideos, setTimelineVideos] = useState<VideoAsset[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<SceneLayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [projectSize, setProjectSize] = useState<ProjectSize>(DEFAULT_PROJECT_SIZE);
  const [zoom, setZoom] = useState(100);
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showVideoPropertiesPanel, setShowVideoPropertiesPanel] = useState(false);
  const [showVideoAdjustPanel, setShowVideoAdjustPanel] = useState(false);
  const [showAnimationsPanel, setShowAnimationsPanel] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('uploads');
  const [colorPanelProps, setColorPanelProps] = useState<{
    color: string;
    onChange: (color: string) => void;
  } | null>(null);

  const timelineRef = useRef<VideoTimelineRef>(null);

  // Handle video upload to library
  const handleVideoUpload = useCallback((video: VideoAsset) => {
    console.log('📁 Adding video to library:', video.name);
    setVideoLibrary(prev => [...prev, video]);
  }, []);

  // Handle adding video to timeline from library
  const handleAddToTimeline = useCallback((video: VideoAsset) => {
    console.log('🎬 Adding video to timeline:', video.name, 'URL:', video.url);
    
    // Create a copy for timeline with unique scene ID
    const timelineVideo: VideoAsset = {
      ...video,
      id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalVideoId: video.id, // Keep reference to original
      sceneNumber: timelineVideos.length + 1,
      layers: video.layers || []
    };
    
    console.log('📋 Timeline video created:', timelineVideo.name, 'URL:', timelineVideo.url, 'ID:', timelineVideo.id);
    
    setTimelineVideos(prev => [...prev, timelineVideo]);
    setCurrentVideo(timelineVideo);
    setCurrentTime(0);
    setSelectedLayer(null);
  }, [timelineVideos]);

  // Handle video selection from library (shows properties panel)
  const handleVideoSelect = useCallback((video: VideoAsset) => {
    console.log('🎯 Video selected from library:', video.name);
    setCurrentVideo(video);
    setSelectedVideo(video);
    setCurrentTime(0);
    setSelectedLayer(null);
    setShowVideoPropertiesPanel(true);
    
    // Add to timeline if not already there
    if (!timelineVideos.find(v => v.id === video.id)) {
      const newVideo = { ...video, sceneNumber: timelineVideos.length + 1 };
      setTimelineVideos(prev => [...prev, newVideo]);
    }
  }, [timelineVideos]);

  // Handle scene selection from timeline (shows properties panel)
  const handleTimelineSceneSelect = useCallback((video: VideoAsset) => {
    console.log('🎬 Scene selected from timeline:', video.name, 'ID:', video.id);
    setCurrentVideo(video);
    setSelectedVideo(video);
    setCurrentTime(0);
    setSelectedLayer(null);
    setShowVideoPropertiesPanel(true);
  }, []);

  const handleLayerAdd = useCallback((layer: SceneLayer) => {
    if (!currentVideo) {
      // Create a default video if none exists
      const defaultVideo: VideoAsset = {
        id: 'default',
        name: 'New Project',
        url: '',
        duration: 30,
        thumbnail: '',
        layers: [],
        backgroundColor: '#ffffff',
        sceneNumber: 1
      };
      setCurrentVideo({ ...defaultVideo, layers: [layer] });
      setTimelineVideos([{ ...defaultVideo, layers: [layer] }]);
    } else {
      const updatedVideo = {
        ...currentVideo,
        layers: [...currentVideo.layers, layer]
      };
      setCurrentVideo(updatedVideo);
      
      // Update in timeline videos
      setTimelineVideos(prev => 
        prev.map(v => v.id === currentVideo.id ? updatedVideo : v)
      );
    }
    setSelectedLayer(layer);
  }, [currentVideo]);

  const handleLayerSelect = useCallback((layer: SceneLayer | null) => {
    setSelectedLayer(layer);
  }, []);

  const handleLayerUpdate = useCallback((layerId: string, updates: Partial<SceneLayer>) => {
    if (!currentVideo) return;

    const updatedLayers = currentVideo.layers.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    );

    const updatedVideo = {
      ...currentVideo,
      layers: updatedLayers
    };

    setCurrentVideo(updatedVideo);
    
    // Update in timeline videos
    setTimelineVideos(prev => 
      prev.map(v => v.id === currentVideo.id ? updatedVideo : v)
    );

    // Update selected layer if it's the one being updated
    if (selectedLayer?.id === layerId) {
      setSelectedLayer({ ...selectedLayer, ...updates });
    }
  }, [currentVideo, selectedLayer]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleVideoReady = useCallback((videoDuration: number) => {
    setDuration(videoDuration);
  }, []);

  const handleTimelineSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleProjectSizeChange = useCallback((size: ProjectSize) => {
    setProjectSize(size);
  }, []);

  const handleOpenColorPanel = useCallback((color: string, onChange: (color: string) => void) => {
    setColorPanelProps({ color, onChange });
    setShowColorPanel(true);
  }, []);

  const handleBackgroundColorChange = useCallback((color: string) => {
    if (currentVideo) {
      const updatedVideo = {
        ...currentVideo,
        backgroundColor: color
      };
      setCurrentVideo(updatedVideo);
      
      // Update in timeline videos
      setTimelineVideos(prev => 
        prev.map(v => v.id === currentVideo.id ? updatedVideo : v)
      );
    }
  }, [currentVideo]);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Handle dropped files/elements
  }, []);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle brand kit color selection
  const handleBrandColorSelect = useCallback((color: string) => {
    if (selectedLayer) {
      // Apply color to selected layer based on layer type
      if (selectedLayer.type === 'text') {
        handleLayerUpdate(selectedLayer.id, {
          properties: {
            ...selectedLayer.properties,
            color: color
          }
        });
      } else if (selectedLayer.type === 'shape') {
        handleLayerUpdate(selectedLayer.id, {
          properties: {
            ...selectedLayer.properties,
            fillColor: color
          }
        });
      }
    } else {
      // Apply as background color if no layer selected
      handleBackgroundColorChange(color);
    }
  }, [selectedLayer, handleLayerUpdate, handleBackgroundColorChange]);

  const handleSectionChange = useCallback((section: string) => {
    if (section === 'ai-assistant') {
      setShowAIModal(true);
    } else {
      setActiveSection(section);
      // Automatically close video properties panels when switching sections
      if (showVideoPropertiesPanel || showVideoAdjustPanel || showAnimationsPanel) {
        setShowVideoPropertiesPanel(false);
        setShowVideoAdjustPanel(false);
        setShowAnimationsPanel(false);
        setSelectedVideo(null);
      }
    }
  }, [showVideoPropertiesPanel, showVideoAdjustPanel, showAnimationsPanel]);

  const handleVideoUpdate = useCallback((updates: Partial<VideoAsset>) => {
    if (!selectedVideo) return;
    
    const updatedVideo = { ...selectedVideo, ...updates };
    setSelectedVideo(updatedVideo);
    
    // Update current video if it's the same
    if (currentVideo && currentVideo.id === selectedVideo.id) {
      setCurrentVideo(updatedVideo);
    }
    
    // Update in timeline videos
    setTimelineVideos(prev => 
      prev.map(v => v.id === selectedVideo.id ? updatedVideo : v)
    );
  }, [selectedVideo, currentVideo]);

  const handleAddScene = useCallback(() => {
    const newScene: VideoAsset = {
      id: `scene-${Date.now()}`,
      name: `Scene ${timelineVideos.length + 1}`,
      url: '',
      duration: 10,
      thumbnail: '',
      layers: [],
      backgroundColor: '#ffffff',
      sceneNumber: timelineVideos.length + 1
    };
    
    setTimelineVideos(prev => [...prev, newScene]);
    setCurrentVideo(newScene);
  }, [timelineVideos]);

  // Video Properties Panel handlers
  const handleAnimateVideo = useCallback((videoId: string) => {
    console.log('🎬 Opening animations for video:', videoId);
    setShowAnimationsPanel(true);
    setShowVideoPropertiesPanel(false);
  }, []);

  const handleAdjustVideo = useCallback((videoId: string) => {
    console.log('🎨 Opening adjustments for video:', videoId);
    setShowVideoAdjustPanel(true);
    setShowVideoPropertiesPanel(false);
  }, []);

  const handleTrimVideo = useCallback((videoId: string) => {
    console.log('✂️ Opening trim tool for video:', videoId);
    // TODO: Implement trim functionality
  }, []);

  const handleSplitVideo = useCallback((videoId: string) => {
    console.log('📐 Opening split tool for video:', videoId);
    // TODO: Implement split functionality
  }, []);

  const handleDeleteVideo = useCallback((videoId: string) => {
    console.log('🗑️ Deleting video:', videoId);
    
    // Remove from timeline
    setTimelineVideos(prev => prev.filter(v => v.id !== videoId));
    
    // Clear current video if it's the one being deleted
    if (currentVideo?.id === videoId) {
      setCurrentVideo(null);
    }
    
    // Clear selected video if it's the one being deleted
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null);
    }
    
    // Close the properties panel
    setShowVideoPropertiesPanel(false);
  }, [currentVideo, selectedVideo]);

  const handleCloseVideoPropertiesPanel = useCallback(() => {
    setShowVideoPropertiesPanel(false);
    setSelectedVideo(null);
  }, []);

  const handleCloseVideoAdjustPanel = useCallback(() => {
    setShowVideoAdjustPanel(false);
    setShowVideoPropertiesPanel(true);
  }, []);

  const handleCloseAnimationsPanel = useCallback(() => {
    setShowAnimationsPanel(false);
    setShowVideoPropertiesPanel(true);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <Header
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onExport={() => setShowExportModal(true)}
        onShowAIAssistant={() => setShowAIModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Navigation - 80px overlay - always visible */}
        <SidebarNavigation
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {/* Content Panel - 384px sidebar with left margin for navigation */}
        {!showVideoPropertiesPanel && !showVideoAdjustPanel && !showAnimationsPanel && (
          <div className="ml-20 w-[384px] h-full bg-white border-r border-gray-100 flex flex-col shadow-sm">
            <ContentPanel
              activeSection={activeSection}
              videoLibrary={videoLibrary}
              timelineVideos={timelineVideos}
              onVideoUpload={handleVideoUpload}
              onVideoSelect={handleVideoSelect}
              onAddToTimeline={handleAddToTimeline}
              onLayerAdd={handleLayerAdd}
              onColorSelect={handleBrandColorSelect}
              showAIModal={showAIModal}
              onShowAIModal={setShowAIModal}
            />
          </div>
        )}

        {/* Video Properties Panel - 384px sidebar with left margin for navigation */}
        {showVideoPropertiesPanel && !showVideoAdjustPanel && !showAnimationsPanel && (
          <div className="ml-20 w-[384px] h-full bg-white border-r border-gray-100 flex flex-col shadow-lg">
            <VideoPropertiesPanel
              selectedVideo={selectedVideo}
              onVideoUpdate={handleVideoUpdate}
              onAnimateVideo={handleAnimateVideo}
              onAdjustVideo={handleAdjustVideo}
              onDeleteVideo={handleDeleteVideo}
              onTrimVideo={handleTrimVideo}
              onSplitVideo={handleSplitVideo}
            />
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleCloseVideoPropertiesPanel}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Video Adjust Panel - 384px sidebar with left margin for navigation */}
        {showVideoAdjustPanel && !showAnimationsPanel && (
          <div className="ml-20 w-[384px] h-full bg-white border-r border-gray-100 flex flex-col shadow-lg">
            <VideoAdjustPanel
              selectedVideo={selectedVideo}
              onVideoUpdate={handleVideoUpdate}
              onBack={handleCloseVideoAdjustPanel}
            />
          </div>
        )}

        {/* Animations Panel - 384px sidebar with left margin for navigation */}
        {showAnimationsPanel && (
          <div className="ml-20 w-[384px] h-full bg-white border-r border-gray-100 flex flex-col shadow-lg">
            <AnimationsPanel
              selectedVideo={selectedVideo}
              onVideoUpdate={handleVideoUpdate}
              onBack={handleCloseAnimationsPanel}
            />
          </div>
        )}

        {/* Main Canvas Area - extends to right edge */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <VideoCanvas
              projectSize={projectSize}
              currentVideo={currentVideo}
              timelineVideos={timelineVideos}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              onVideoReady={handleVideoReady}
              onProjectSizeChange={handleProjectSizeChange}
              selectedLayer={selectedLayer}
              onLayerSelect={handleLayerSelect}
              onLayerUpdate={handleLayerUpdate}
              onCanvasDrop={handleCanvasDrop}
              onCanvasDragOver={handleCanvasDragOver}
              zoom={zoom}
              onOpenColorPanel={handleOpenColorPanel}
              onBackgroundColorChange={handleBackgroundColorChange}
            />
          </div>
        </div>
      </div>

      {/* Timeline - Full width bottom */}
      <div className="h-72 border-t border-gray-200">
        <VideoTimeline
          ref={timelineRef}
          timelineVideos={timelineVideos}
          currentVideo={currentVideo}
          currentTime={currentTime}
          totalDuration={0} // Let VideoTimeline calculate total duration
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onTimeSeek={handleTimelineSeek}
          onVideoSelect={handleTimelineSceneSelect}
          onAddScene={handleAddScene}
          selectedLayer={selectedLayer}
          onLayerSelect={handleLayerSelect}
          onExportVideo={() => setShowExportModal(true)}
        />
      </div>

      {/* Color Panel Modal */}
      {showColorPanel && colorPanelProps && (
        <ColorPanel
          isOpen={showColorPanel}
          onClose={() => setShowColorPanel(false)}
          color={colorPanelProps.color}
          onChange={colorPanelProps.onChange}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        project={{
          name: projectName,
          width: projectSize.width,
          height: projectSize.height,
          duration: duration,
          layers: currentVideo?.layers || []
        }}
      />
    </div>
  );
}

export default App;