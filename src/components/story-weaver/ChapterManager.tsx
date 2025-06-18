// src/components/story-weaver/ChapterManager.tsx
"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit3, Save, XCircle, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import type { Chapter } from '@/app/page'; // Assuming Chapter type is defined in page.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ChapterManagerProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onAddChapter: (name: string) => void;
  onDeleteChapter: (id: string) => void;
  onRenameChapter: (id: string, newName: string) => void;
}

export const ChapterManager: FC<ChapterManagerProps> = ({
  chapters,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  onDeleteChapter,
  onRenameChapter,
}) => {
  const [newChapterName, setNewChapterName] = useState('');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddChapter = () => {
    if (newChapterName.trim()) {
      onAddChapter(newChapterName.trim());
      setNewChapterName('');
    }
  };

  const handleStartRename = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditingName(chapter.name);
  };

  const handleConfirmRename = () => {
    if (editingChapterId && editingName.trim()) {
      onRenameChapter(editingChapterId, editingName.trim());
    }
    setEditingChapterId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingChapterId(null);
    setEditingName('');
  };

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-headline flex items-center">
          <FileText className="mr-2 h-5 w-5 text-primary" /> Chapters
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newChapterName}
            onChange={(e) => setNewChapterName(e.target.value)}
            placeholder="New chapter name"
            onKeyPress={(e) => e.key === 'Enter' && handleAddChapter()}
            className="flex-grow"
            aria-label="New chapter name input"
          />
          <Button onClick={handleAddChapter} size="icon" variant="outline" aria-label="Add new chapter">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-grow border border-border rounded-md">
          <div className="p-2 space-y-1">
            {chapters.length === 0 && <p className="text-sm text-muted-foreground p-2">No chapters yet. Add one to get started!</p>}
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors hover:bg-accent/50
                  ${activeChapterId === chapter.id ? 'bg-primary/20 text-primary-foreground hover:bg-primary/30' : 'hover:bg-accent'}`}
                onClick={() => onSelectChapter(chapter.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectChapter(chapter.id)}
                aria-current={activeChapterId === chapter.id ? "page" : undefined}
              >
                {editingChapterId === chapter.id ? (
                  <div className="flex-grow flex items-center gap-1">
                    <Input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleConfirmRename()}
                      autoFocus
                      className="h-8 text-sm flex-grow"
                      aria-label={`Rename chapter ${chapter.name}`}
                    />
                    <Button onClick={handleConfirmRename} size="icon" variant="ghost" className="h-7 w-7" aria-label="Save new chapter name">
                      <Save className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button onClick={handleCancelRename} size="icon" variant="ghost" className="h-7 w-7" aria-label="Cancel renaming chapter">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className={`truncate text-sm ${activeChapterId === chapter.id ? 'font-semibold text-primary' : 'text-foreground'}`}>
                      {chapter.name}
                    </span>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleStartRename(chapter); }}
                        className="h-7 w-7"
                        aria-label={`Edit chapter name ${chapter.name}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 w-7 hover:text-destructive"
                            aria-label={`Delete chapter ${chapter.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the chapter "{chapter.name}" and all its content.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={(e) => { e.stopPropagation(); onDeleteChapter(chapter.id); }}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
