import React, { useCallback, useState } from 'react';
import { Upload, Film, Clock, Plus, Check, Search, Video, Music, Image, MoreHorizontal } from 'lucide-react';
import { VideoAsset } from '../types/video';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VideoUploaderProps {
  onVideoUpload?: (video: VideoAsset) => void;
  videoLibrary?: VideoAsset[];
  onAddToTimeline?: (video: VideoAsset) => void;
  timelineVideos?: VideoAsset[];
  onVideoSelect?: (video: VideoAsset) => void;
}

export function VideoUploader({ 
  onVideoUpload, 
  videoLibrary = [], 
  onAddToTimeline, 
  timelineVideos = [],
  onVideoSelect
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('videos');

  // Check if video is already on timeline - updated for new scene ID system
  const isOnTimeline = (videoId: string) => {
    return timelineVideos.some(v => 
      v.originalVideoId === videoId || v.id === videoId
    );
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

        onVideoUpload?.(video);
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

        onVideoUpload?.(video);
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

        onVideoUpload?.(video);
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

        onVideoUpload?.(video);
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
    // Set both the video ID and full video data for timeline drops
    e.dataTransfer.setData('video-id', video.id);
    e.dataTransfer.setData('video-data', JSON.stringify(video));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Filter videos based on search query
  const filteredVideos = videoLibrary.filter(video =>
    video.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sample stock videos for demonstration - using actual video URLs
  const stockVideos: VideoAsset[] = [
    {
      id: 'stock-1',
      name: 'Big Buck Bunny',
      duration: 12,
      size: 15728640, // ~15MB
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      position: {
        startTime: 0,
        endTime: 12,
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
    },
    {
      id: 'stock-2',
      name: 'Elephants Dream',
      duration: 16,
      size: 20971520, // ~20MB
      thumbnail: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      position: {
        startTime: 0,
        endTime: 16,
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
    },
    {
      id: 'stock-3',
      name: 'Demo Video',
      duration: 11,
      size: 12582912, // ~12MB
      thumbnail: 'https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=400&h=300&fit=crop',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      position: {
        startTime: 0,
        endTime: 11,
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
    },
    {
      id: 'stock-4',
      name: 'Sintel',
      duration: 23,
      size: 31457280, // ~30MB
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
      url: 'https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4',
      position: {
        startTime: 0,
        endTime: 23,
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
    },
    {
      id: 'stock-5',
      name: 'Tears of Steel',
      duration: 23,
      size: 28311552, // ~27MB
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      url: 'https://download.blender.org/mango/trailer_720p.mov',
      position: {
        startTime: 0,
        endTime: 23,
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
    },
    {
      id: 'stock-6',
      name: 'Sample MP4',
      duration: 19,
      size: 25165824, // ~24MB
      thumbnail: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&h=300&fit=crop',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      position: {
        startTime: 0,
        endTime: 19,
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
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search images by keyword, tags, color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        {/* Upload and Record Buttons */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload files
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <Button 
            variant="outline"
            className="px-3 py-3 border-gray-300 hover:bg-gray-50"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>


      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="px-4 mb-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="images" 
              className="text-gray-600 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none pb-2"
            >
              Images
            </TabsTrigger>
            <TabsTrigger 
              value="videos"
              className="text-gray-600 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none pb-2"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="audio"
              className="text-gray-600 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none pb-2"
            >
              Audio
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="videos" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 grid grid-cols-2 gap-3">
                {/* User uploaded videos */}
                {filteredVideos.map((video, index) => (
                  <div
                    key={`user-video-${video.id}-${index}`}
                    className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    draggable
                    onDragStart={(e) => handleVideoItemDragStart(e, video)}
                    onClick={() => onVideoSelect?.(video)}
                  >
                    <ImageWithFallback
                      src={video.thumbnail}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-gray-900/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}s
                      </Badge>
                    </div>

                    {/* Add to Timeline Button */}
                    {!isOnTimeline(video.id) && onAddToTimeline && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToTimeline(video);
                          }}
                          className="h-6 w-6 p-0 bg-white hover:bg-gray-100 text-gray-700 rounded-full"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {/* Timeline Status */}
                    {isOnTimeline(video.id) && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600 text-white h-6 w-6 p-0 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}

                {/* Stock videos */}
                {stockVideos.map((video, index) => (
                  <div
                    key={`stock-video-${video.id}-${index}`}
                    className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    draggable
                    onDragStart={(e) => handleVideoItemDragStart(e, video)}
                    onClick={() => onVideoSelect?.(video)}
                  >
                    <ImageWithFallback
                      src={video.thumbnail}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-gray-900/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}s
                      </Badge>
                    </div>

                    {/* Add to Timeline Button */}
                    {!isOnTimeline(video.id) && onAddToTimeline && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToTimeline(video);
                          }}
                          className="h-6 w-6 p-0 bg-white hover:bg-gray-100 text-gray-700 rounded-full"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {/* Timeline Status */}
                    {isOnTimeline(video.id) && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600 text-white h-6 w-6 p-0 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}


              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="images" className="h-full m-0">
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Image className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Images coming soon</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="h-full m-0">
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Music className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Audio coming soon</p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}