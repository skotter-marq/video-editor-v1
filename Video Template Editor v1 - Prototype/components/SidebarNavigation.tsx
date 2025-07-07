import React from 'react';
import { 
  Upload, 
  Type, 
  Square, 
  Crown, 
  LayoutTemplate,
  Palette,
  Image,
  Layers
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function SidebarNavigation({
  activeSection,
  onSectionChange
}: SidebarNavigationProps) {
  const navigationItems = [
    { id: 'uploads', label: 'Media Library', icon: Upload },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'elements', label: 'Elements', icon: Square },
    { id: 'brand-kit', label: 'Brand Kit', icon: Crown },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate }
  ];

  return (
    <div className="absolute left-0 top-0 bottom-0 w-20 bg-white border-r border-gray-100 flex flex-col py-6 z-50 shadow-sm">
      <TooltipProvider>
        <div className="flex flex-col space-y-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSectionChange(item.id)}
                    className={`w-14 h-14 mx-auto p-0 relative rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 transform scale-105'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:scale-105'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-sm' : ''}`} />
                    {isActive && (
                      <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-full" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">
                  <span className="font-medium">{item.label}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-6 mx-4 h-px bg-gray-200" />

        {/* Additional Tools */}
        <div className="flex flex-col space-y-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-14 h-14 mx-auto p-0 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all duration-200"
              >
                <Layers className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">
              <span className="font-medium">Layers</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}