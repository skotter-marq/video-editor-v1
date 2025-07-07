import React, { useState, useEffect } from 'react';
import { Download, Settings, Film, CheckCircle, AlertCircle, Upload, Plus } from 'lucide-react';
import { VideoProject } from '../types/video';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
}

interface ExportSettings {
  quality: '720p' | '1080p' | '4K';
  format: 'mp4' | 'mov' | 'webm';
  framerate: number;
  compression: 'high' | 'medium' | 'low';
}

export function ExportModal({ isOpen, onClose, project }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState('');
  
  const [settings, setSettings] = useState<ExportSettings>({
    quality: '1080p',
    format: 'mp4',
    framerate: 30,
    compression: 'medium'
  });

  const qualityOptions = [
    { value: '720p', label: '720p HD', description: '1280 x 720', size: '~50MB' },
    { value: '1080p', label: '1080p Full HD', description: '1920 x 1080', size: '~100MB' },
    { value: '4K', label: '4K Ultra HD', description: '3840 x 2160', size: '~400MB' }
  ];

  const formatOptions = [
    { value: 'mp4', label: 'MP4', description: 'Best compatibility' },
    { value: 'mov', label: 'MOV', description: 'High quality' },
    { value: 'webm', label: 'WebM', description: 'Web optimized' }
  ];

  const compressionOptions = [
    { value: 'high', label: 'High Quality', description: 'Larger file size' },
    { value: 'medium', label: 'Balanced', description: 'Good quality, reasonable size' },
    { value: 'low', label: 'Compressed', description: 'Smaller file size' }
  ];

  const hasVideos = project?.layers?.length > 0;

  const resetExportState = () => {
    setIsExporting(false);
    setExportProgress(0);
    setExportComplete(false);
    setExportError(null);
    setCurrentStage('');
  };

  const handleExport = async () => {
    if (!hasVideos) return;
    
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);

    try {
      // Simulate export process with realistic stages
      const stages = [
        'Preparing video timeline...',
        'Processing video clips...',
        'Applying effects and filters...',
        'Encoding to ' + settings.format.toUpperCase() + '...',
        'Optimizing file size...',
        'Finalizing export...'
      ];

      for (let i = 0; i < stages.length; i++) {
        setCurrentStage(stages[i]);
        
        // Variable timing for different stages
        const stageDelay = i === 3 ? 1500 : i === 1 ? 1200 : 800; // Encoding takes longer
        await new Promise(resolve => setTimeout(resolve, stageDelay));
        
        setExportProgress(((i + 1) / stages.length) * 100);
      }

      // Simulate potential error (3% chance)
      if (Math.random() < 0.03) {
        throw new Error('Export failed: Insufficient memory or corrupted video data');
      }

      setExportComplete(true);
      setIsExporting(false);
      setCurrentStage('Export completed successfully!');
      
      // Extended auto-close after successful export - 6 seconds
      setTimeout(() => {
        onClose();
        resetExportState();
      }, 6000);

    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
      setIsExporting(false);
      setCurrentStage('');
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
      resetExportState();
    }
  };

  const handleManualClose = () => {
    onClose();
    resetExportState();
  };

  const getEstimatedSize = () => {
    if (!hasVideos) return 0;
    
    const baseSizes = { '720p': 50, '1080p': 100, '4K': 400 };
    const compressionMultipliers = { high: 1.5, medium: 1, low: 0.6 };
    
    const baseSize = baseSizes[settings.quality];
    const multiplier = compressionMultipliers[settings.compression];
    const totalDuration = project.duration || 10;
    
    return Math.round(baseSize * multiplier * (totalDuration / 60));
  };

  const getEstimatedTime = () => {
    if (!hasVideos) return 0;
    
    const totalDuration = project.duration || 10;
    const processingRates = { '720p': 4, '1080p': 2, '4K': 0.5 };
    const rate = processingRates[settings.quality];
    
    return Math.ceil(totalDuration / rate);
  };

  const getTotalDuration = () => {
    return project.duration || 0;
  };

  // Provide default values in case project is undefined
  const projectName = project?.name || 'Untitled Project';
  const projectWidth = project?.width || 1920;
  const projectHeight = project?.height || 1080;
  const layerCount = project?.layers?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Film className="w-5 h-5" />
            <span>Export Video Template</span>
          </DialogTitle>
          <DialogDescription>
            {hasVideos 
              ? 'Configure your export settings and prepare your video template for download.'
              : 'Add content to your project to start exporting.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* No Content State */}
        {!hasVideos && !isExporting && !exportComplete && !exportError && (
          <div className="space-y-6 text-center py-8">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h4>No Content in Project</h4>
              <p className="text-sm text-muted-foreground">
                Your project doesn't have any content yet. Add videos, text, or other elements to get started with exporting.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-muted/50 p-4 rounded-lg text-left">
                <h5 className="text-sm mb-2">How to add content:</h5>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Upload content using the left sidebar</li>
                  <li>Add text, images, or shapes to your project</li>
                  <li>Return here to configure export settings</li>
                </ol>
              </div>
              
              <Button onClick={handleManualClose} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Content to Project
              </Button>
            </div>
          </div>
        )}

        {/* Settings Screen - Only show when content exists */}
        {hasVideos && !isExporting && !exportComplete && !exportError && (
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="mb-2">{projectName}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Dimensions: {projectWidth} x {projectHeight}</div>
                <div>Layers: {layerCount}</div>
                <div>Total Duration: {Math.floor(getTotalDuration() / 60)}:{Math.floor(getTotalDuration() % 60).toString().padStart(2, '0')}</div>
              </div>
            </div>

            {/* Quality Settings */}
            <div className="space-y-3">
              <Label>Video Quality</Label>
              <RadioGroup
                value={settings.quality}
                onValueChange={(quality: '720p' | '1080p' | '4K') =>
                  setSettings({ ...settings, quality })
                }
              >
                {qualityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <div>{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{option.size}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Format Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(format: 'mp4' | 'mov' | 'webm') =>
                    setSettings({ ...settings, format })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div>{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Frame Rate</Label>
                <Select
                  value={settings.framerate.toString()}
                  onValueChange={(framerate) =>
                    setSettings({ ...settings, framerate: parseInt(framerate) })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Compression Settings */}
            <div className="space-y-3">
              <Label>Compression</Label>
              <RadioGroup
                value={settings.compression}
                onValueChange={(compression: 'high' | 'medium' | 'low') =>
                  setSettings({ ...settings, compression })
                }
              >
                {compressionOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`compression-${option.value}`} />
                    <Label htmlFor={`compression-${option.value}`} className="cursor-pointer">
                      <div>
                        <div>{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Export Summary */}
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="mb-2">Export Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Estimated File Size:</span>
                  <span>~{getEstimatedSize()}MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span>~{getEstimatedTime()}min</span>
                </div>
                <div className="flex justify-between">
                  <span>Output Format:</span>
                  <span>{settings.format.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Start Export
            </Button>
          </div>
        )}

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 animate-spin text-primary" />
            </div>
            
            <div className="space-y-3">
              <h4>Exporting Video Template</h4>
              <Progress value={exportProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {exportProgress < 100 ? `${Math.round(exportProgress)}% complete` : 'Finalizing...'}
              </p>
              {currentStage && (
                <p className="text-xs text-muted-foreground">
                  {currentStage}
                </p>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              This may take a few minutes depending on video length and quality settings.
            </p>
          </div>
        )}

        {/* Export Complete */}
        {exportComplete && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h4 className="text-lg">Export Complete!</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Your video template has been processed successfully.
              </p>
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>File:</strong> {projectName}.{settings.format}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Size:</strong> ~{getEstimatedSize()}MB
                </p>
                <p className="text-sm text-green-800">
                  <strong>Quality:</strong> {settings.quality} @ {settings.framerate}fps
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button onClick={handleManualClose} className="w-full" size="lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Done
              </Button>
              <p className="text-xs text-muted-foreground">
                Modal will close automatically in a few seconds...
              </p>
            </div>
          </div>
        )}

        {/* Export Error */}
        {exportError && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <div>
              <h4>Export Failed</h4>
              <p className="text-sm text-muted-foreground mt-2">
                {exportError}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleClose()} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => {
                setExportError(null);
                handleExport();
              }} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}