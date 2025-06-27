export interface ProjectSize {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface VideoPosition {
  startTime: number;
  endTime: number;
}

export interface VideoTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export interface VideoEffects {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
}

export interface VideoAudio {
  volume?: number;
  speed?: number;
  muted?: boolean;
}

export interface VideoAsset {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  duration: number;
  size: number;
  format: string;
  aspectRatio: number;
  position: VideoPosition;
  transform: VideoTransform;
  effects?: VideoEffects;
  audio?: VideoAudio;
}

export interface VideoProject {
  id: string;
  name: string;
  dimensions: ProjectSize;
  videos: VideoAsset[];
  settings: {
    autoPlay: boolean;
    quality: string;
    exportFormat: string;
  };
}

export const PROJECT_SIZES: ProjectSize[] = [
  { name: '16:9 (1920×1080)', width: 1920, height: 1080, aspectRatio: '16:9' },
  { name: '9:16 (1080×1920)', width: 1080, height: 1920, aspectRatio: '9:16' },
  { name: '1:1 (1080×1080)', width: 1080, height: 1080, aspectRatio: '1:1' },
  { name: '4:3 (1440×1080)', width: 1440, height: 1080, aspectRatio: '4:3' },
  { name: '21:9 (2560×1080)', width: 2560, height: 1080, aspectRatio: '21:9' },
  { name: '5:4 (1350×1080)', width: 1350, height: 1080, aspectRatio: '5:4' },
];