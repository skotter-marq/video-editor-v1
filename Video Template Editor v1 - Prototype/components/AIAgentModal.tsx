import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sparkles, Send } from 'lucide-react';

interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
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

export function AIAgentModal({ isOpen, onClose }: AIAgentModalProps) {
  const [prompt, setPrompt] = useState('');

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleSubmit = () => {
    if (prompt.trim()) {
      // TODO: Implement AI agent processing
      console.log('AI Agent prompt:', prompt);
      // For now, just close the modal
      onClose();
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-0">
        <div className="p-6 space-y-6">
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span>AI Agent</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Tell me what you'd like to accomplish with your video, and I'll help you edit it!
            </DialogDescription>
          </DialogHeader>

          {/* Main Input Area */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What would you like to do with your video? (e.g., Add a filter, change aspect ratio, add music...)"
                  className="pr-12 h-12 text-base bg-gray-50 border-gray-200 focus:bg-white"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="absolute right-2 top-2 h-8 w-8 p-0 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Suggestions Button */}
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                  onClick={() => {
                    // Scroll to suggestions or highlight them
                    const suggestionsElement = document.getElementById('suggestions-grid');
                    suggestionsElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Suggestions
                </Button>
              </div>
            </div>
          </div>

          {/* Suggestions Grid */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div id="suggestions-grid" className="grid grid-cols-2 gap-3">
              {SUGGESTIONS.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="h-auto p-3 text-left justify-start bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-800 whitespace-normal"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Helper Text */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Describe what you'd like to accomplish, and I'll help you edit your video!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}