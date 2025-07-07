import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sparkles, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface AIAgentPopoverProps {
  children: React.ReactNode;
}

const QUICK_SUGGESTIONS = [
  "Make my video good for TikTok",
  "Change the aspect ratio to portrait",
  "Generate a demo for a beauty product",
  "Add background music",
  "Add subtitles",
  "Remove silences",
  "Add a transition",
  "Add a filter",
  "Add a special effect",
  "Upload a video"
];

const ALL_SUGGESTIONS = [
  // Social Media & Formats
  "Make my video good for TikTok",
  "Make my video good for Instagram Reels",
  "Make my video good for YouTube Shorts",
  "Change the aspect ratio to portrait",
  "Change the aspect ratio to square",
  "Change the aspect ratio to landscape",
  
  // Audio & Music
  "Add background music",
  "Add subtitles",
  "Remove background noise",
  "Add voice-over",
  "Sync music to video beats",
  "Remove silences",
  
  // Visual Effects & Filters
  "Add a filter",
  "Add a special effect",
  "Add a transition between scenes",
  "Add text overlay",
  "Add animated text",
  "Blur the background",
  "Add color correction",
  "Make video brighter",
  "Add vintage effect",
  
  // Content & Structure
  "Generate a demo for a beauty product",
  "Create a product showcase",
  "Add intro and outro",
  "Split video into scenes",
  "Trim video length",
  "Speed up video",
  "Slow down video",
  "Create slideshow from images",
  
  // Upload & Import
  "Upload a video",
  "Import from URL",
  "Add images to timeline",
  "Add logo watermark"
];

export function AIAgentPopover({ children }: AIAgentPopoverProps) {
  const [prompt, setPrompt] = useState('');
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleSubmit = () => {
    if (prompt.trim()) {
      // TODO: Implement AI agent processing
      console.log('AI Agent prompt:', prompt);
      // Close popover after submission
      setIsOpen(false);
      setPrompt('');
      setShowAllSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const toggleSuggestions = () => {
    setShowAllSuggestions(!showAllSuggestions);
  };

  const suggestionsToShow = showAllSuggestions ? ALL_SUGGESTIONS : QUICK_SUGGESTIONS;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[420px] p-0 border-0 shadow-xl" 
        align="end"
        sideOffset={8}
      >
        <div className="bg-gradient-to-br from-purple-400 via-blue-500 to-orange-400 p-4 rounded-lg">
          <div className="space-y-3">
            {/* Main Input */}
            <div className="relative">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Make my video good for TikTok..."
                className="pr-12 h-14 text-base bg-white border-0 shadow-sm rounded-xl placeholder:text-gray-500"
              />
              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim()}
                className="absolute right-3 top-3 h-8 w-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>

            {/* Helper Text */}
            <div className="text-center">
              <p className="text-white text-sm opacity-90">
                Tell me what you want to do with your video and I'll help make it happen!
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions Grid */}
        <div className="bg-white rounded-lg m-4 mt-0 p-4 shadow-sm">
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {suggestionsToShow.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleSuggestionClick(suggestion)}
                className="h-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 hover:text-gray-800 rounded-full text-sm whitespace-nowrap"
              >
                {suggestion}
              </Button>
            ))}
          </div>
          
          {!showAllSuggestions && (
            <div className="mt-3 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSuggestions}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                Show all {ALL_SUGGESTIONS.length} suggestions
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
          
          {showAllSuggestions && (
            <div className="mt-3 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSuggestions}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                Show fewer suggestions
                <ChevronUp className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}