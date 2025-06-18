
// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { EditorPanel } from '@/components/story-weaver/EditorPanel';
import { Toolbar } from '@/components/story-weaver/Toolbar';
import { ChapterManager } from '@/components/story-weaver/ChapterManager';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

export interface Chapter {
  id: string;
  name: string;
  story: string;
  notes: string;
}

const defaultChapter: Chapter = {
  id: crypto.randomUUID(),
  name: 'My First Chapter',
  story: '# Welcome to Story Weaver!\n\nStart writing your story here...\n\n**Tip:** Use Markdown for formatting!',
  notes: '*Notes for your story*\n\n- Character ideas\n- Plot points',
};

const defaultAppendixContent: string = '# Appendix\n\nGlobal notes, world-building, character backstories, etc.';

export default function StoryWeaverPage() {
  const { toast } = useToast();
  const [chapters, setChapters, chaptersInitialized] = useLocalStorage<Chapter[]>('storyweaver-chapters', [defaultChapter]);
  const [activeChapterId, setActiveChapterId, activeChapterIdInitialized] = useLocalStorage<string | null>(
    'storyweaver-activeChapterId',
    null
  );
  const [fontSize, setFontSize, fontSizeInitialized] = useLocalStorage<number>('storyweaver-fontSize', 16);
  const [appendixContent, setAppendixContent, appendixContentInitialized] = useLocalStorage<string>(
    'storyweaver-appendix',
    defaultAppendixContent
  );

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && chaptersInitialized && chapters.length > 0 && (!activeChapterId || !chapters.find(c => c.id === activeChapterId))) {
      setActiveChapterId(chapters[0].id);
    } else if (isClient && chaptersInitialized && chapters.length === 0) {
      // If all chapters are deleted, create a new default one
      const newDefaultChapter = { ...defaultChapter, id: crypto.randomUUID() };
      setChapters([newDefaultChapter]);
      setActiveChapterId(newDefaultChapter.id);
    }
  }, [isClient, chapters, activeChapterId, setChapters, setActiveChapterId, chaptersInitialized]);


  const handleAddChapter = (name: string) => {
    const newChapter: Chapter = { id: crypto.randomUUID(), name, story: `# ${name}\n\nStart writing...`, notes: `*Notes for ${name}*` };
    const updatedChapters = [...chapters, newChapter];
    setChapters(updatedChapters);
    setActiveChapterId(newChapter.id);
    toast({ title: "Chapter Added", description: `"${name}" has been created.` });
  };

  const handleDeleteChapter = (id: string) => {
    if (chapters.length <= 1) {
      toast({ title: "Cannot Delete", description: "You must have at least one chapter.", variant: "destructive" });
      return;
    }
    const chapterToDelete = chapters.find(c => c.id === id);
    const updatedChapters = chapters.filter((chapter) => chapter.id !== id);
    setChapters(updatedChapters);
    if (activeChapterId === id) {
      setActiveChapterId(updatedChapters.length > 0 ? updatedChapters[0].id : null);
    }
    if (chapterToDelete) {
      toast({ title: "Chapter Deleted", description: `"${chapterToDelete.name}" has been deleted.` });
    }
  };

  const handleRenameChapter = (id: string, newName: string) => {
    setChapters(
      chapters.map((chapter) => (chapter.id === id ? { ...chapter, name: newName } : chapter))
    );
    toast({ title: "Chapter Renamed", description: `Chapter updated to "${newName}".` });
  };

  const handleSelectChapter = (id: string) => {
    setActiveChapterId(id);
  };

  const updateChapterContent = (field: 'story' | 'notes', content: string) => {
    if (!activeChapterId) return;
    setChapters(
      chapters.map((chapter) =>
        chapter.id === activeChapterId ? { ...chapter, [field]: content } : chapter
      )
    );
  };

  const updateAppendixContent = (content: string) => {
    setAppendixContent(content);
  };

  const handleExport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: "Export Successful", description: `"${filename}" has been downloaded.` });
  };

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  if (!isClient || !chaptersInitialized || !activeChapterIdInitialized || !fontSizeInitialized || !appendixContentInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <BookOpen className="h-12 w-12 animate-pulse text-primary" />
        <p className="ml-4 text-xl font-semibold">Loading Story Weaver...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar side="left" collapsible="icon" className="border-r border-border min-w-[280px] group-data-[collapsible=icon]:min-w-[5rem]">
           {activeChapter && <ChapterManager
            chapters={chapters}
            activeChapterId={activeChapterId}
            onSelectChapter={handleSelectChapter}
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
            onRenameChapter={handleRenameChapter}
          />}
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-3 border-b border-border bg-card shadow-sm h-[60px]">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="p-1.5" />
              <h1 className="text-2xl font-bold font-headline text-primary">Story Weaver</h1>
            </div>
          </header>
          
          <div className="flex-grow flex flex-col p-4 gap-4 overflow-y-auto">
            {activeChapter && (
              <Toolbar
                onExportStory={() => handleExport(activeChapter.story, `${activeChapter.name}-story.txt`)}
                onExportNotes={() => handleExport(activeChapter.notes, `${activeChapter.name}-notes.txt`)}
                onExportAppendix={() => handleExport(appendixContent, 'Appendix.txt')}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow min-h-[calc(100vh-180px)]">
              {activeChapter ? (
                <>
                  <EditorPanel
                    title="Story"
                    content={activeChapter.story}
                    onContentChange={(content) => updateChapterContent('story', content)}
                    fontSize={fontSize}
                    placeholder="Once upon a time..."
                    className="min-h-[400px] lg:min-h-0"
                  />
                  <EditorPanel
                    title="Notes"
                    content={activeChapter.notes}
                    onContentChange={(content) => updateChapterContent('notes', content)}
                    fontSize={fontSize}
                    placeholder="My brilliant ideas for this chapter..."
                    className="min-h-[400px] lg:min-h-0"
                  />
                  <EditorPanel
                    title="Appendix"
                    content={appendixContent}
                    onContentChange={updateAppendixContent}
                    fontSize={fontSize}
                    placeholder="Global notes, world-building, character backstories..."
                    className="min-h-[400px] lg:min-h-0"
                  />
                </>
              ) : (
                <div className="lg:col-span-3 flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-lg shadow-md">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2 font-headline">No Chapter Selected</h2>
                  <p className="text-muted-foreground">
                    {chapters.length > 0 ? "Select a chapter from the sidebar to start writing or view its content." : "Create a new chapter to begin your story!"}
                  </p>
                  {chapters.length === 0 && (
                     <Button onClick={() => handleAddChapter("New Story")} className="mt-4">
                       Create First Chapter
                     </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
