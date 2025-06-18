// src/components/story-weaver/EditorPanel.tsx
"use client";

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { parseMarkdownToHtml } from '@/lib/markdown';

interface EditorPanelProps {
  title: string;
  content: string;
  onContentChange: (newContent: string) => void;
  fontSize: number;
  placeholder?: string;
  className?: string;
}

export const EditorPanel: FC<EditorPanelProps> = ({
  title,
  content,
  onContentChange,
  fontSize,
  placeholder,
  className,
}) => {
  const [htmlPreview, setHtmlPreview] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Ensure client-side execution for markdown parsing

    // Debounce markdown parsing for performance
    const timerId = setTimeout(() => {
      setHtmlPreview(parseMarkdownToHtml(content));
    }, 300); // 300ms debounce

    return () => clearTimeout(timerId);
  }, [content, isClient]);

  const editorStyle = { fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.5}px` };

  return (
    <Card className={className ? `${className} flex flex-col` : "flex flex-col h-full shadow-lg"}>
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow grid grid-rows-1 md:grid-cols-2 gap-4 overflow-hidden p-4 pt-0">
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={placeholder}
          className="h-full resize-none border-border focus:ring-primary focus:border-primary p-3"
          style={editorStyle}
          aria-label={`${title} input area`}
        />
        <ScrollArea className="h-full border border-border rounded-md bg-muted/30 p-0">
          <div
            className="markdown-preview p-3 break-words"
            style={editorStyle}
            dangerouslySetInnerHTML={{ __html: isClient ? htmlPreview : '<p>Loading preview...</p>' }}
            aria-live="polite"
            aria-label={`${title} preview area`}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
