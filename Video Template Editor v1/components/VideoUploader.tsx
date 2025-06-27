import React, { useCallback, useState } from 'react';
import { Upload, Film, Clock, Plus, Check } from 'lucide-react';
import { VideoAsset } from '../types/video';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VideoUploaderProps {
  onVideoUpload: (video: VideoAsset) => void;
  uploadedVideos: VideoAsset[];
  onAddToTimeline?: (video: VideoAsset) => void;
  timelineVideos: VideoAsset[];
}

export function VideoUploader({ 
  onVideoUpload, 
  uploadedVideos, 
  onAddToTimeline, 
  timelineVideos 
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Check if video is already on timeline
  const isOnTimeline = (videoId: string) => {
    return timelineVideos.some(v => v.id === videoId);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the component entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  // Generate actual thumbnail from video file
  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        // Set canvas dimensions to match video aspect ratio
        canvas.width = 400;
        canvas.height = Math.round((400 * video.videoHeight) / video.videoWidth);
        
        // Seek to 1 second or 10% of video duration, whichever is smaller
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      };
      
      video.onseeked = () => {
        try {
          // Draw the video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          
          // Clean up
          video.remove();
          canvas.remove();
          
          resolve(thumbnail);
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = (error) => {
        video.remove();
        canvas.remove();
        reject(error);
      };
      
      // Create object URL and load video
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      video.load();
    });
  };

  // Get video duration
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        video.remove();
        resolve(duration);
      };
      
      video.onerror = (error) => {
        video.remove();
        reject(error);
      };
      
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      video.load();
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));

    for (const file of videoFiles) {
      await simulateUpload(file);
      
      try {
        // Generate actual thumbnail and get real duration
        const [thumbnail, duration] = await Promise.all([
          generateVideoThumbnail(file),
          getVideoDuration(file)
        ]);
        
        // Create video object with real thumbnail and duration
        const video: VideoAsset = {
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          duration: duration,
          size: file.size,
          thumbnail: thumbnail, // Real thumbnail from video
          url: URL.createObjectURL(file),
          position: {
            startTime: 0,
            endTime: duration,
          },
          transform: {
            x: 0,
            y: 0,
            scale: 1,
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

        onVideoUpload(video);
      } catch (error) {
        console.error('Failed to process video:', error);
        
        // Fallback to placeholder if thumbnail generation fails
        const video: VideoAsset = {
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          duration: 60, // Default duration
          size: file.size,
          thumbnail: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop&crop=center',
          url: URL.createObjectURL(file),
          position: {
            startTime: 0,
            endTime: 60,
          },
          transform: {
            x: 0,
            y: 0,
            scale: 1,
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

        onVideoUpload(video);
      }
    }
  }, [onVideoUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));

    for (const file of videoFiles) {
      await simulateUpload(file);
      
      try {
        // Generate actual thumbnail and get real duration
        const [thumbnail, duration] = await Promise.all([
          generateVideoThumbnail(file),
          getVideoDuration(file)
        ]);
        
        // Create video object with real thumbnail and duration
        const video: VideoAsset = {
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          duration: duration,
          size: file.size,
          thumbnail: thumbnail, // Real thumbnail from video
          url: URL.createObjectURL(file),
          position: {
            startTime: 0,
            endTime: duration,
          },
          transform: {
            x: 0,
            y: 0,
            scale: 1,
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

        onVideoUpload(video);
      } catch (error) {
        console.error('Failed to process video:', error);
        
        // Fallback to placeholder if thumbnail generation fails
        const video: VideoAsset = {
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          duration: 60, // Default duration
          size: file.size,
          thumbnail: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop&crop=center',
          url: URL.createObjectURL(file),
          position: {
            startTime: 0,
            endTime: 60,
          },
          transform: {
            x: 0,
            y: 0,
            scale: 1,
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

        onVideoUpload(video);
      }
    }
    
    // Reset the input
    e.target.value = '';
  }, [onVideoUpload]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleVideoItemDragStart = (e: React.DragEvent, video: VideoAsset) => {
    e.dataTransfer.setData('video-id', video.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Film className="w-3 h-3 text-primary" />
          </div>
          <h3 className="font-medium">Video Library</h3>
        </div>
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-3">
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}
        
        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragging ? 'Drop videos here' : 'Upload videos'}
              </p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="flex-1 overflow-hidden">
        {uploadedVideos.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Film className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No videos uploaded yet</p>
              <p className="text-xs text-muted-foreground">Upload videos to get started</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {uploadedVideos.map((video) => (
                <div
                  key={video.id}
                  className="group rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-colors cursor-move"
                  draggable
                  onDragStart={(e) => handleVideoItemDragStart(e, video)}
                >
                  <div className="flex items-center p-2 min-w-0">
                    {/* Compact Thumbnail - DOUBLED HEIGHT with ImageWithFallback */}
                    <div className="relative w-12 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                      <ImageWithFallback
                        src={video.thumbnail}
                        alt={video.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-3 h-3 bg-white/90 rounded-full flex items-center justify-center">
                          <Film className="w-2 h-2 text-black" />
                        </div>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-0 right-0">
                        <Badge variant="secondary" className="text-xs px-0.5 py-0 bg-black/80 text-white border-0 h-3 text-xs leading-none">
                          {formatDuration(video.duration)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Content - Ultra compact */}
                    <div className="ml-2 flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between">
                        {/* Title - Very strict width */}
                        <div className="flex-1 min-w-0 max-w-[140px]">
                          <h4 className="text-xs font-medium truncate" title={video.name}>
                            {video.name}
                          </h4>
                        </div>
                        
                        {/* Timeline Status & Actions */}
                        <div className="ml-1 flex-shrink-0">
                          {isOnTimeline(video.id) ? (
                            <Badge variant="secondary" className="text-xs px-1 py-0 h-3.5 whitespace-nowrap">
                              <Check className="w-2 h-2" />
                            </Badge>
                          ) : (
                            onAddToTimeline && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onAddToTimeline(video)}
                                className="h-3.5 w-3.5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Plus className="w-2 h-2" />
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                      
                      {/* Metadata - Single line */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center flex-shrink-0">
                          <Clock className="w-2 h-2 mr-0.5" />
                          <span className="text-xs">{formatDuration(video.duration)}</span>
                        </span>
                        <span className="truncate ml-1 text-xs max-w-[50px]">{formatFileSize(video.size)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}