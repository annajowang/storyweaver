// src/components/story-weaver/Toolbar.tsx
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, TextCursorInputIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ToolbarProps {
  onExportStory: () => void;
  onExportNotes: () => void;
  fontSize: number;
  onFontSizeChange: (newSize: number) => void;
}

export const Toolbar: FC<ToolbarProps> = ({
  onExportStory,
  onExportNotes,
  fontSize,
  onFontSizeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-3 border-b border-border bg-card rounded-t-lg shadow">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onExportStory} aria-label="Export story">
              <Download className="mr-2 h-4 w-4" /> Story
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export Story as .txt</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onExportNotes} aria-label="Export notes">
              <Download className="mr-2 h-4 w-4" /> Notes
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export Notes as .txt</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="flex items-center gap-2 ml-auto">
        <TextCursorInputIcon className="h-5 w-5 text-muted-foreground" />
        <Label htmlFor="fontSizeSlider" className="text-sm text-muted-foreground whitespace-nowrap">
          Font Size: {fontSize}px
        </Label>
        <Slider
          id="fontSizeSlider"
          min={10}
          max={32}
          step={1}
          value={[fontSize]}
          onValueChange={(value) => onFontSizeChange(value[0])}
          className="w-[100px] sm:w-[150px]"
          aria-label="Adjust font size"
        />
      </div>
    </div>
  );
};
