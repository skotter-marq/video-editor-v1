import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Star, Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(color);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [hexInput, setHexInput] = useState(color);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueBarRef = useRef<HTMLCanvasElement>(null);

  // Brand colors palette (expanded to match VerticalNavigation)
  const brandColors = [
    ['#000000', '#404040', '#606060', '#808080', '#a0a0a0', '#ffffff'],
    ['#e53e3e', '#f56565', '#fc8181', '#feb2b2', '#fed7d7', '#fff5f5'],
    ['#2b6cb0', '#3182ce', '#4299e1', '#63b3ed', '#90cdf4', '#bee3f8'],
    ['#38a169', '#48bb78', '#68d391', '#9ae6b4', '#c6f6d5', '#f0fff4'],
    ['#805ad5', '#9f7aea', '#b794f6', '#d6bcfa', '#e9d8fd', '#faf5ff'],
    ['#d69e2e', '#ecc94b', '#f6e05e', '#faf089', '#fefcbf', '#fffff0'],
  ];

  // Convert HSL to RGB
  const hslToRgb = useCallback((h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  }, []);

  // Convert RGB to Hex
  const rgbToHex = useCallback((r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }, []);

  // Update color from HSL values
  const updateColorFromHSL = useCallback(() => {
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    const hex = rgbToHex(r, g, b);
    setSelectedColor(hex);
    setHexInput(hex);
    onChange(hex);
  }, [hue, saturation, lightness, hslToRgb, rgbToHex, onChange]);

  // Draw color picker canvas
  const drawColorPicker = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create saturation gradient (left to right: white to pure hue)
    const saturationGradient = ctx.createLinearGradient(0, 0, width, 0);
    saturationGradient.addColorStop(0, '#ffffff');
    saturationGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);

    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, width, height);

    // Create lightness gradient (top to bottom: transparent to black)
    const lightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
    lightnessGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    lightnessGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = lightnessGradient;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  // Draw hue bar
  const drawHueBar = useCallback(() => {
    const canvas = hueBarRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create hue gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 360; i += 60) {
      gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSaturation = (x / canvas.width) * 100;
    const newLightness = 100 - (y / canvas.height) * 100;

    setSaturation(newSaturation);
    setLightness(newLightness);
  }, []);

  // Handle hue bar click
  const handleHueBarClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueBarRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newHue = (x / canvas.width) * 360;
    setHue(newHue);
  }, []);

  // Handle hex input change
  const handleHexChange = useCallback((value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setSelectedColor(value);
      onChange(value);
    }
  }, [onChange]);

  // Handle brand color selection
  const handleBrandColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    setHexInput(color);
    onChange(color);
  }, [onChange]);

  // Update canvas when hue changes
  useEffect(() => {
    drawColorPicker();
  }, [drawColorPicker]);

  // Draw hue bar on mount
  useEffect(() => {
    drawHueBar();
  }, [drawHueBar]);

  // Update color when HSL values change
  useEffect(() => {
    updateColorFromHSL();
  }, [updateColorFromHSL]);

  return (
    <div className="w-96 p-4 space-y-4">
      <Tabs defaultValue="color" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="color" className="text-xs">Color</TabsTrigger>
          <TabsTrigger value="image" className="text-xs">Image</TabsTrigger>
        </TabsList>
        
        <TabsContent value="color" className="space-y-4 mt-4">
          {/* Main picker area - horizontal layout */}
          <div className="flex space-x-3">
            {/* Color Picker Canvas */}
            <div className="relative flex-1">
              <canvas
                ref={canvasRef}
                width={200}
                height={120}
                className="w-full h-24 rounded cursor-crosshair border border-gray-200"
                onClick={handleCanvasClick}
              />
              {/* Color picker indicator */}
              <div
                className="absolute w-3 h-3 border-2 border-black rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - lightness}%`,
                  boxShadow: '0 0 0 1px white',
                }}
              />
            </div>

            {/* Right side controls */}
            <div className="flex flex-col space-y-2 w-24">
              {/* Current color preview */}
              <div 
                className="w-full h-8 rounded border border-gray-200"
                style={{ backgroundColor: selectedColor }}
              />
              
              {/* Hue Bar */}
              <div className="relative">
                <canvas
                  ref={hueBarRef}
                  width={96}
                  height={12}
                  className="w-full h-3 rounded cursor-pointer"
                  onClick={handleHueBarClick}
                />
                {/* Hue indicator */}
                <div
                  className="absolute w-2 h-4 bg-white border border-gray-400 rounded transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${(hue / 360) * 100}%`,
                    top: '50%',
                  }}
                />
              </div>

              {/* Hex Input - compact */}
              <div className="space-y-1">
                <Input
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="h-7 text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Brand Colors Section - larger swatches to match VerticalNavigation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Color Presets
            </Label>
            
            {/* Color Grid - larger swatches */}
            <div className="space-y-3">
              {brandColors.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-wrap gap-3">
                  {row.map((color) => (
                    <button
                      key={color}
                      className={`w-14 h-14 rounded-full border-2 transition-all hover:scale-105 ${
                        selectedColor === color 
                          ? 'border-blue-500 ring-1 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleBrandColorSelect(color)}
                      title={color}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4 mt-4">
          <div className="text-center py-8 text-gray-500">
            <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Image backgrounds coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}