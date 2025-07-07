import React from 'react';
import { 
  Upload, 
  Type, 
  Square, 
  Crown, 
  LayoutTemplate,
  Palette,
  Image
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
    { id: 'uploads', label: 'Video Library', icon: Upload },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'elements', label: 'Elements', icon: Square },
    { id: 'brand-kit', label: 'Brand Kit', icon: Crown },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate }
  ];

  return (
    <div className="absolute left-0 top-0 bottom-0 w-16 bg-white border-r border-gray-200 flex flex-col py-4 z-50">
      <TooltipProvider>
        <div className="flex flex-col space-y-2">
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
                    className={`w-12 h-12 mx-auto p-0 relative ${
                      isActive
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span>{item.label}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}