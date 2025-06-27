import React, { useState, useEffect, useCallback } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { VideoCanvas } from './components/VideoCanvas';
import { VideoTimeline } from './components/VideoTimeline';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ExportModal } from './components/ExportModal';
import { VideoProject, VideoAsset, ProjectSize, PROJECT_SIZES } from './types/video';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import { Input } from './components/ui/input';
import { Toaster } from './components/ui/sonner';
import { Play, Pause, Save, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function App() {
  // Project State
  const [project, setProject] = useState<VideoProject>({
    id: 'project_1',
    name: 'Untitled Project',
    dimensions: PROJECT_SIZES[0],
    videos: [],
    settings: {
      autoPlay: false,
      quality: '1080p',
      exportFormat: 'mp4'
    }
  });

  // Video Library (separate from timeline)
  const [videoLibrary, setVideoLibrary] = useState<VideoAsset[]>([]);

  // Video Playback State
  const [currentVideo, setCurrentVideo] = useState<VideoAsset | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1); // Default to 100%

  // UI State
  const [isSaving, setIsSaving] = useState(false);

  // Undo/Redo State
  const [undoStack, setUndoStack] = useState<VideoProject[]>([]);
  const [redoStack, setRedoStack] = useState<VideoProject[]>([]);

  // Apply default transform to video (100% scale)
  const applyDefaultTransform = useCallback((video: VideoAsset) => {
    return {
      ...video,
      transform: {
        x: 0,
        y: 0,
        scale: 1, // Default to 100% scale (fill)
        rotation: 0,
        opacity: 1
      },
      effects: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0
      },
      audio: {
        volume: 1,
        speed: 1,
        muted: false
      }
    };
  }, []);

  // Auto-select first video when uploaded
  useEffect(() => {
    if (project.videos.length > 0 && !currentVideo) {
      setCurrentVideo(project.videos[0]);
    }
  }, [project.videos, currentVideo]);

  // Playback controls
  const handlePlayPause = useCallback(() => {
    // Only allow play/pause if there's a current video
    if (currentVideo) {
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, currentVideo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 's':
            e.preventDefault();
            handleSaveProject();
            break;
        }
      } else if (e.key === ' ') {
        // Spacebar for play/pause
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause]); // Include handlePlayPause in dependencies

  // Save current state to undo stack
  const saveToUndoStack = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-9), { ...project }]);
    setRedoStack([]);
  }, [project]);

  // Handle video upload - adds ONLY to library (not timeline)
  const handleVideoUpload = (video: VideoAsset) => {
    // Apply default transform to new video
    const transformedVideo = applyDefaultTransform(video);
    
    // Add ONLY to library, not to timeline
    setVideoLibrary(prev => [...prev, transformedVideo]);
  };

  // Handle video update
  const handleVideoUpdate = (updates: Partial<VideoAsset>) => {
    if (!currentVideo) return;
    
    saveToUndoStack();
    const updatedVideo = { ...currentVideo, ...updates };
    
    // Update in both library and timeline
    setVideoLibrary(prev => 
      prev.map(v => v.id === currentVideo.id ? updatedVideo : v)
    );
    
    setProject(prev => ({
      ...prev,
      videos: prev.videos.map(v => v.id === currentVideo.id ? updatedVideo : v)
    }));
    
    setCurrentVideo(updatedVideo);
  };

  // Handle video removal from timeline (keeps in library)
  const handleVideoRemoveFromTimeline = () => {
    if (!currentVideo) return;
    
    saveToUndoStack();
    
    // Remove from timeline but keep in library
    setProject(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== currentVideo.id)
    }));
    
    // Clear current selection
    setCurrentVideo(null);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Handle adding video from library to timeline
  const handleAddToTimeline = (video: VideoAsset) => {
    saveToUndoStack();
    
    // Check if already on timeline
    const isAlreadyOnTimeline = project.videos.some(v => v.id === video.id);
    if (isAlreadyOnTimeline) {
      setCurrentVideo(video);
      return;
    }
    
    // Add to timeline with default transform
    const timelineVideo = applyDefaultTransform(video);
    
    setProject(prev => ({
      ...prev,
      videos: [...prev.videos, timelineVideo]
    }));
    
    setCurrentVideo(timelineVideo);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Handle project size change
  const handleProjectSizeChange = (size: ProjectSize) => {
    saveToUndoStack();
    setProject(prev => ({
      ...prev,
      dimensions: size
    }));
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleVideoReady = (duration: number) => {
    if (currentVideo && currentVideo.duration !== duration) {
      handleVideoUpdate({ duration });
    }
  };

  // Undo/Redo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [project, ...prev]);
    setUndoStack(prev => prev.slice(0, -1));
    setProject(previousState);
    
    // Update current video reference
    if (currentVideo) {
      const newCurrentVideo = previousState.videos.find(v => v.id === currentVideo.id);
      setCurrentVideo(newCurrentVideo || null);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    setUndoStack(prev => [...prev, project]);
    setRedoStack(prev => prev.slice(1));
    setProject(nextState);
    
    // Update current video reference
    if (currentVideo) {
      const newCurrentVideo = nextState.videos.find(v => v.id === currentVideo.id);
      setCurrentVideo(newCurrentVideo || null);
    }
  };

  // Handle canvas drop
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const videoId = e.dataTransfer.getData('video-id');
    const video = videoLibrary.find(v => v.id === videoId);
    
    if (video) {
      handleAddToTimeline(video);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Timeline drag handlers with enhanced feedback
  const handleTimelineDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const videoId = e.dataTransfer.getData('video-id');
    const video = videoLibrary.find(v => v.id === videoId);
    
    if (video) {
      handleAddToTimeline(video);
    }
  };

  const handleTimelineDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTimelineDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTimelineDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Save project with toast notification
  const handleSaveProject = async () => {
    setIsSaving(true);
    
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success toast
      toast.success('Project saved successfully!', {
        description: `"${project.name}" has been saved to your workspace.`,
        action: {
          label: 'View',
          onClick: () => console.log('View project'),
        },
      });
    } catch (error) {
      toast.error('Failed to save project', {
        description: 'Please try again or check your connection.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Export with progress (no actual download)
  const handleExport = (settings: any) => {
    // The ExportModal handles the progress UI
    // We just show a completion toast when done
    toast.success('Video export completed!', {
      description: `${project.name}.${settings.format} is ready for download.`,
      duration: 5000,
    });
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1>Video Template Editor</h1>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center space-x-2">
            <Input
              value={project.name}
              onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="w-48"
              placeholder="Enter project name"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSaveProject}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <ExportModal project={project} onExport={handleExport} />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Top Section - Canvas with Sidebars */}
        <div className="flex-1 flex overflow-hidden min-h-0 gap-4 p-4">
          {/* Left Sidebar - Video Library */}
          <div className="w-72 shrink-0">
            <div className="h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <VideoUploader
                onVideoUpload={handleVideoUpload}
                uploadedVideos={videoLibrary}
                onAddToTimeline={handleAddToTimeline}
                timelineVideos={project.videos}
              />
            </div>
          </div>

          {/* Center - Canvas Area */}
          <div className="flex-1 overflow-hidden" 
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          >
            <VideoCanvas
              projectSize={project.dimensions}
              currentVideo={currentVideo}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              onVideoReady={handleVideoReady}
              onProjectSizeChange={handleProjectSizeChange}
            />
          </div>

          {/* Right Sidebar - Properties Panel */}
          <div className="w-72 shrink-0">
            <div className="h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <PropertiesPanel
                currentVideo={currentVideo}
                onVideoUpdate={handleVideoUpdate}
                onVideoRemove={handleVideoRemoveFromTimeline}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section - Full Width Timeline */}
        <div className="h-64 shrink-0 p-4 bg-background">
          <div className="h-full bg-card rounded-xl border border-border shadow-sm">
            <VideoTimeline
              currentVideo={currentVideo}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTimeUpdate={handleTimeUpdate}
              onPlayPause={handlePlayPause}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              onVideoUpdate={handleVideoUpdate}
              undoStack={undoStack}
              redoStack={redoStack}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onDrop={handleTimelineDrop}
              onDragOver={handleTimelineDragOver}
              onDragEnter={handleTimelineDragEnter}
              onDragLeave={handleTimelineDragLeave}
            />
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <Toaster />
    </div>
  );
}