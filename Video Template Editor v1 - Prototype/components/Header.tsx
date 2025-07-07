import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, Wand2, Share2 } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onExport: () => void;
  onShowAIAssistant: () => void;
}

export function Header({ 
  projectName, 
  onProjectNameChange, 
  onExport, 
  onShowAIAssistant 
}: HeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  const handleNameSave = () => {
    onProjectNameChange(tempName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(projectName);
    setIsEditingName(false);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section - Project Name */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-8 w-48"
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') handleNameCancel();
                }}
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {projectName}
            </button>
          )}
        </div>
      </div>

      {/* Center Section - Empty for now */}
      <div className="flex-1" />

      {/* Right Section - Action Buttons */}
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowAIAssistant}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          AI Assistant
        </Button>
        
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        
        <Button 
          onClick={onExport}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </header>
  );
}