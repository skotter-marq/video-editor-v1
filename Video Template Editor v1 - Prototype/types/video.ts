export interface VideoPosition {
  startTime: number;
  endTime: number;
}

export interface VideoAsset {
  id: string;
  name: string;
  url?: string;
  src?: string;
  file?: File;
  thumbnail?: string;
  duration: number;
  originalDuration?: number; // Store the original video duration
  trimStart?: number; // Trim start time in original video timeline
  trimEnd?: number; // Trim end time in original video timeline
  width?: number;
  height?: number;
  position?: VideoPosition;
  layers?: SceneLayer[];
  // Background color for the scene/clip
  backgroundColor?: string;
  // Audio properties
  volume?: number;
  speed?: number;
  fadeAudio?: boolean;
  audio?: {
    volume: number;
    speed: number;
    fadeInOut?: boolean;
  };
  // Video transform properties
  transform?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
  };
  // Video effects
  effects?: {
    roundCorners?: boolean;
    cornerRadius?: {
      topLeft: number;
      topRight: number;
      bottomLeft: number;
      bottomRight: number;
      linked: boolean;
    };
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
  };
  // Video adjustments
  adjustments?: {
    brightness: number;
    contrast: number;
    exposure: number;
    hue: number;
    saturation: number;
    sharpen: number;
    noise: number;
    blur: number;
    vignette: number;
  };

  // Animations
  animations?: {
    in?: {
      type: AnimationType;
      duration: number; // in seconds
      delay?: number;
    };
    out?: {
      type: AnimationType;
      duration: number;
      delay?: number;
    };
    loop?: {
      type: AnimationType;
      duration: number;
      iterations?: number | 'infinite';
    };
  };
}

export type LayerType = 'text' | 'image' | 'shape' | 'frame';

export interface LayerTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export interface LayerTiming {
  startTime: number;
  endTime: number;
  duration: number;
}

export interface LayerProperties {
  [key: string]: any;
}

export interface SceneLayer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  transform: LayerTransform;
  properties: LayerProperties;
  timing: LayerTiming;
  createdAt: number;
  updatedAt: number;
}

export interface VideoProject {
  id: string;
  name: string;
  videos: VideoAsset[];
  totalDuration: number;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectSize {
  id: string;
  name: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export const PROJECT_SIZES: ProjectSize[] = [
  {
    id: 'hd-landscape',
    name: 'HD Landscape',
    label: 'HD Landscape (1920×1080)',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9'
  },
  {
    id: 'hd-portrait',
    name: 'HD Portrait',
    label: 'HD Portrait (1080×1920)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16'
  },
  {
    id: 'square-hd',
    name: 'Square HD',
    label: 'Square HD (1080×1080)',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1'
  },
  {
    id: '4k-landscape',
    name: '4K Landscape',
    label: '4K Landscape (3840×2160)',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9'
  },
  {
    id: '4k-portrait',
    name: '4K Portrait',
    label: '4K Portrait (2160×3840)',
    width: 2160,
    height: 3840,
    aspectRatio: '9:16'
  },
  {
    id: 'standard-def',
    name: 'Standard Definition',
    label: 'Standard Definition (720×480)',
    width: 720,
    height: 480,
    aspectRatio: '4:3'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    label: 'Instagram Story (1080×1920)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16'
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    label: 'YouTube Thumbnail (1280×720)',
    width: 1280,
    height: 720,
    aspectRatio: '16:9'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    label: 'TikTok (1080×1920)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16'
  }
];

// Animation types
export type AnimationType = 
  | 'none'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'bounce'
  | 'spin'
  | 'float'
  | 'pop'
  | 'wipe'
  | 'drop'
  | 'zoom-out'
  | 'ken-burns'
  | 'slide-bounce'
  | 'gentle-float';

export type AnimationCategory = 'in' | 'out' | 'loop' | 'zoom';

export interface Animation {
  id: string;
  name: string;
  type: AnimationType;
  category: AnimationCategory[];
  description: string;
}

// Text Layer Specific Properties
export interface TextLayerProperties extends LayerProperties {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle?: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
  backgroundColor?: string;
  shadow?: boolean;
  outline?: boolean;
}

// Image Layer Specific Properties
export interface ImageLayerProperties extends LayerProperties {
  src: string;
  alt?: string;
  fit: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}

// Shape Layer Specific Properties
export interface ShapeLayerProperties extends LayerProperties {
  shape: string;
  path?: string;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
}

// Frame Layer Specific Properties
export interface FrameLayerProperties extends LayerProperties {
  shape: string;
  path?: string;
  frameColor: string;
  frameOpacity: number;
  imageFit?: 'cover' | 'contain' | 'fill';
}

// Frame Properties (for compatibility)
export interface FrameProperties extends FrameLayerProperties {
  imageUrl?: string;
}