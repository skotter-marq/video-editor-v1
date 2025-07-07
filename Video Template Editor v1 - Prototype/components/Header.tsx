import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, Wand2, Share2, ChevronDown, Crown } from 'lucide-react';

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
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      {/* Left Section - Brand & Project */}
      <div className="flex items-center space-x-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">VideoEditor</span>
            <span className="text-xs text-gray-500">Pro</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />
        
        {/* Project Name */}
        <div className="flex items-center space-x-2">
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-9 w-56 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
              className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              {projectName}
            </button>
          )}
        </div>
      </div>

      {/* Center Section - Navigation/Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700">Auto-saved</span>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-3">
        {/* Upgrade CTA */}
        <Button
          variant="outline"
          size="sm"
          className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade
        </Button>

        {/* AI Assistant */}
        <Button
          variant="outline"
          size="sm"
          onClick={onShowAIAssistant}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          AI Assistant
        </Button>
        
        {/* Share */}
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
        
        {/* Export */}
        <Button 
          onClick={onExport}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </header>
  );
}