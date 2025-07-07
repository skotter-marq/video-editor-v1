import React, { useState } from "react";
import {
  Wand2,
  Sliders,
  Volume2,
  BarChart3,
  Play,
  Trash2,
  Move,
  RotateCw,
  Scissors,
  Split,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { VideoAsset } from "../types/video";

interface VideoPropertiesPanelProps {
  selectedVideo: VideoAsset | null;
  onVideoUpdate: (updates: Partial<VideoAsset>) => void;
  onAnimateVideo?: (videoId: string) => void;
  onAdjustVideo?: (videoId: string) => void;
  onDeleteVideo?: (videoId: string) => void;
  onTrimVideo?: (videoId: string) => void;
  onSplitVideo?: (videoId: string) => void;
}

export function VideoPropertiesPanel({
  selectedVideo,
  onVideoUpdate,
  onAnimateVideo,
  onAdjustVideo,
  onDeleteVideo,
  onTrimVideo,
  onSplitVideo,
}: VideoPropertiesPanelProps) {
  const [volume, setVolume] = useState(
    selectedVideo?.volume || 100,
  );
  const [speed, setSpeed] = useState(selectedVideo?.speed || 1);
  const [customSpeed, setCustomSpeed] = useState("1");
  const [fadeAudio, setFadeAudio] = useState(
    selectedVideo?.fadeAudio || false,
  );

  // Transform states
  const [transform, setTransform] = useState({
    x: selectedVideo?.transform?.x || 0,
    y: selectedVideo?.transform?.y || 0,
    scale: selectedVideo?.transform?.scale || 1,
    rotation: selectedVideo?.transform?.rotation || 0,
    opacity: selectedVideo?.transform?.opacity || 1,
  });

  // Update transform state when selectedVideo changes
  React.useEffect(() => {
    if (selectedVideo) {
      setTransform({
        x: selectedVideo.transform?.x || 0,
        y: selectedVideo.transform?.y || 0,
        scale: selectedVideo.transform?.scale || 1,
        rotation: selectedVideo.transform?.rotation || 0,
        opacity: selectedVideo.transform?.opacity || 1,
      });
    }
  }, [selectedVideo]);

  if (!selectedVideo) {
    return null;
  }

  const speedOptions = [
    { label: "0.5x", value: 0.5 },
    { label: "1x", value: 1 },
    { label: "1.5x", value: 1.5 },
    { label: "2x", value: 2 },
  ];

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);

    // If video has been trimmed, recalculate duration
    const trimStart = selectedVideo.trimStart || 0;
    const trimEnd =
      selectedVideo.trimEnd ||
      selectedVideo.originalDuration ||
      selectedVideo.duration;
    const trimmedDuration = trimEnd - trimStart;
    const newDuration = trimmedDuration / newSpeed;

    onVideoUpdate({
      speed: newSpeed,
      duration: newDuration,
      // Update position end time if it exists
      position: selectedVideo.position
        ? {
            ...selectedVideo.position,
            endTime:
              (selectedVideo.position.startTime || 0) +
              newDuration,
          }
        : undefined,
    });
  };

  const handleCustomSpeedChange = (value: string) => {
    setCustomSpeed(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      setSpeed(numericValue);

      // If video has been trimmed, recalculate duration
      const trimStart = selectedVideo.trimStart || 0;
      const trimEnd =
        selectedVideo.trimEnd ||
        selectedVideo.originalDuration ||
        selectedVideo.duration;
      const trimmedDuration = trimEnd - trimStart;
      const newDuration = trimmedDuration / numericValue;

      onVideoUpdate({
        speed: numericValue,
        duration: newDuration,
        // Update position end time if it exists
        position: selectedVideo.position
          ? {
              ...selectedVideo.position,
              endTime:
                (selectedVideo.position.startTime || 0) +
                newDuration,
            }
          : undefined,
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    onVideoUpdate({ volume: volumeValue });
  };

  const handleFadeAudioToggle = (enabled: boolean) => {
    setFadeAudio(enabled);
    onVideoUpdate({ fadeAudio: enabled });
  };

  const getVideoName = () => {
    return (
      selectedVideo.name ||
      selectedVideo.src?.split("/").pop() ||
      "video.mp4"
    );
  };

  const handleDeleteVideo = () => {
    if (selectedVideo && onDeleteVideo) {
      onDeleteVideo(selectedVideo.id);
    }
  };

  // Transform handlers
  const handleTransformChange = (
    property: keyof typeof transform,
    value: number,
  ) => {
    const newTransform = { ...transform, [property]: value };
    setTransform(newTransform);
    onVideoUpdate({
      transform: newTransform,
    });
  };

  const handleTrimVideo = () => {
    if (selectedVideo && onTrimVideo) {
      onTrimVideo(selectedVideo.id);
    }
  };

  const handleSplitVideo = () => {
    if (selectedVideo && onSplitVideo) {
      onSplitVideo(selectedVideo.id);
    }
  };

  return (
    <div className="flex-1 flex-shrink-0 bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg">
              Edit Video
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {getVideoName()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteVideo}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
            title="Delete video clip"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Main Action Cards - More Compact */}
          <div className="space-y-3">
            {/* Top Row - Animations and Adjust */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-1 text-xs"
                onClick={() =>
                  onAnimateVideo?.(selectedVideo.id)
                }
              >
                <Play className="w-4 h-4" />
                <span>Animations</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-1 text-xs"
                onClick={() =>
                  onAdjustVideo?.(selectedVideo.id)
                }
              >
                <Sliders className="w-4 h-4" />
                <span>Adjust</span>
              </Button>
            </div>

            {/* Bottom Row - Trim and Split */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-12 flex items-center justify-center gap-2 text-xs"
                onClick={handleTrimVideo}
              >
                <Scissors className="w-4 h-4" />
                <span>Trim</span>
              </Button>

              <Button
                variant="outline"
                className="h-12 flex items-center justify-center gap-2 text-xs"
                onClick={handleSplitVideo}
              >
                <Split className="w-4 h-4" />
                <span>Split</span>
              </Button>
            </div>
          </div>

          {/* Transform Controls */}
          <div className="p-3 border border-border rounded-lg">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Move className="w-4 h-4" />
              Transform
            </h3>

            <div className="space-y-3">
              {/* Scale */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium">
                    Scale
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {(transform.scale * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[transform.scale]}
                  onValueChange={([value]) =>
                    handleTransformChange("scale", value)
                  }
                  max={3}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* X Position */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium">
                    X Position
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {transform.x.toFixed(0)}px
                  </span>
                </div>
                <Slider
                  value={[transform.x]}
                  onValueChange={([value]) =>
                    handleTransformChange("x", value)
                  }
                  max={500}
                  min={-500}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Y Position */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium">
                    Y Position
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {transform.y.toFixed(0)}px
                  </span>
                </div>
                <Slider
                  value={[transform.y]}
                  onValueChange={([value]) =>
                    handleTransformChange("y", value)
                  }
                  max={500}
                  min={-500}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <RotateCw className="w-3 h-3" />
                    Rotation
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {transform.rotation.toFixed(0)}°
                  </span>
                </div>
                <Slider
                  value={[transform.rotation]}
                  onValueChange={([value]) =>
                    handleTransformChange("rotation", value)
                  }
                  max={360}
                  min={-360}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium">
                    Opacity
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {(transform.opacity * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[transform.opacity]}
                  onValueChange={([value]) =>
                    handleTransformChange("opacity", value)
                  }
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Speed Section - More Compact */}
          <div className="p-3 border border-border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Speed</h3>
            <div className="flex gap-1 mb-2">
              {speedOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    speed === option.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() =>
                    handleSpeedChange(option.value)
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={customSpeed}
                onChange={(e) =>
                  handleCustomSpeedChange(e.target.value)
                }
                onBlur={() => setCustomSpeed(speed.toString())}
                className="w-full px-2 py-1 text-sm border border-input rounded text-center focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Custom"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                x
              </span>
            </div>
          </div>

          {/* Volume Section - More Compact */}
          <div className="p-3 border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-xs font-medium min-w-[35px] text-right">
                {volume}%
              </span>
            </div>
          </div>

          {/* Fade Audio Section - More Compact */}
          <div className="p-3 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Fade Audio
                </span>
              </div>
              <Switch
                checked={fadeAudio}
                onCheckedChange={handleFadeAudioToggle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}