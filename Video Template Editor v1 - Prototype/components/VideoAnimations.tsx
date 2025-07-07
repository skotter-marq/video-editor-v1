import { VideoAsset, AnimationType } from '../types/video';

// Generate CSS animation styles for video elements
export function getVideoAnimationStyles(video: VideoAsset | null) {
  if (!video?.animations) return {};

  const styles: any = {};
  const animations = video.animations;

  // Create animation keyframes and apply them
  const animationParts: string[] = [];

  if (animations.in) {
    const inAnimation = getAnimationCSS(animations.in.type, 'in', animations.in.duration);
    if (inAnimation) {
      animationParts.push(inAnimation);
    }
  }

  if (animations.out) {
    const outAnimation = getAnimationCSS(animations.out.type, 'out', animations.out.duration);
    if (outAnimation) {
      animationParts.push(outAnimation);
    }
  }

  if (animations.loop) {
    const loopAnimation = getAnimationCSS(animations.loop.type, 'loop', animations.loop.duration, animations.loop.iterations);
    if (loopAnimation) {
      animationParts.push(loopAnimation);
    }
  }

  if (animationParts.length > 0) {
    styles.animation = animationParts.join(', ');
  }

  return styles;
}

function getAnimationCSS(type: AnimationType, category: 'in' | 'out' | 'loop', duration: number, iterations?: number | 'infinite'): string | null {
  const iterationCount = category === 'loop' ? (iterations || 'infinite') : '1';
  const timing = category === 'loop' ? 'ease-in-out' : category === 'in' ? 'ease-out' : 'ease-in';
  
  switch (type) {
    case 'fade':
      return category === 'in' 
        ? `animate-fade-in ${duration}s ${timing} ${iterationCount}`
        : `animate-fade-out ${duration}s ${timing} ${iterationCount}`;
    
    case 'slide':
      return category === 'in'
        ? `animate-slide-in ${duration}s ${timing} ${iterationCount}`
        : `animate-slide-out ${duration}s ${timing} ${iterationCount}`;
    
    case 'zoom':
      return `animate-zoom-in ${duration}s ${timing} ${iterationCount}`;
    
    case 'zoom-out':
      return `animate-zoom-out ${duration}s ${timing} ${iterationCount}`;
    
    case 'bounce':
      return category === 'in'
        ? `animate-bounce-in ${duration}s ${timing} ${iterationCount}`
        : `animate-bounce ${duration}s ${timing} ${iterationCount}`;
    
    case 'spin':
      return `animate-spin ${duration}s linear ${iterationCount}`;
    
    case 'float':
    case 'gentle-float':
      return `animate-gentle-float ${duration}s ${timing} ${iterationCount}`;
    
    case 'pop':
      return `animate-pop ${duration}s ${timing} ${iterationCount}`;
    
    case 'wipe':
      return category === 'in'
        ? `animate-wipe-in ${duration}s ${timing} ${iterationCount}`
        : `animate-wipe-out ${duration}s ${timing} ${iterationCount}`;
    
    case 'drop':
      return `animate-drop ${duration}s ${timing} ${iterationCount}`;
    
    case 'ken-burns':
      return `animate-ken-burns ${duration}s linear ${iterationCount}`;
    
    case 'slide-bounce':
      return `animate-slide-bounce ${duration}s ${timing} ${iterationCount}`;
    
    default:
      return null;
  }
}

// Get animation class names for real-time preview
export function getAnimationClassName(type: AnimationType): string {
  switch (type) {
    case 'bounce':
      return 'animate-bounce-in';
    case 'spin':
      return 'animate-spin';
    case 'fade':
      return 'animate-fade-in';
    case 'float':
    case 'gentle-float':
      return 'animate-gentle-float';
    case 'slide':
      return 'animate-slide-in';
    case 'zoom':
      return 'animate-zoom-in';
    case 'zoom-out':
      return 'animate-zoom-out';
    case 'pop':
      return 'animate-pop';
    case 'wipe':
      return 'animate-wipe-in';
    case 'drop':
      return 'animate-drop';
    case 'ken-burns':
      return 'animate-ken-burns';
    case 'slide-bounce':
      return 'animate-slide-bounce';
    default:
      return '';
  }
}

// Create a unique animation key for triggering re-renders
export function getAnimationKey(video: VideoAsset | null): string {
  if (!video?.animations) return 'no-animation';
  
  const parts: string[] = [];
  
  if (video.animations.in) {
    parts.push(`in-${video.animations.in.type}-${video.animations.in.duration}`);
  }
  
  if (video.animations.out) {
    parts.push(`out-${video.animations.out.type}-${video.animations.out.duration}`);
  }
  
  if (video.animations.loop) {
    parts.push(`loop-${video.animations.loop.type}-${video.animations.loop.duration}`);
  }
  
  return parts.join('_') || 'no-animation';
}