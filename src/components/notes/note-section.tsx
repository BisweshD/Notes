'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, Pencil, X, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { updateNoteSectionAction, approveNoteSectionAction } from '@/actions/note.actions';

interface NoteSectionProps {
  section: {
    id: string;
    sectionKey: string;
    title: string;
    content: string;
    sortOrder: number;
    source: string;
    aiConfidence: number | null;
    isApproved: boolean;
  };
  isLocked: boolean;
  onApproved: (sectionId: string) => void;
  onUpdated: (sectionId: string, content: string) => void;
}

export function NoteSection({
  section,
  isLocked,
  onApproved,
  onUpdated,
}: NoteSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(section.content);
  const [isSaving, setIsSaving] = useState(false);

  const isAiGenerated = section.source === 'ai_generated' || section.source === 'ai_edited';

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await updateNoteSectionAction(section.id, editContent);
      if (result.success) {
        onUpdated(section.id, editContent);
        setIsEditing(false);
        toast.success('Section updated');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [section.id, editContent, onUpdated]);

  const handleApprove = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await approveNoteSectionAction(section.id);
      if (result.success) {
        onApproved(section.id);
        toast.success('Section approved');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to approve');
    } finally {
      setIsSaving(false);
    }
  }, [section.id, onApproved]);

  const handleCancel = useCallback(() => {
    setEditContent(section.content);
    setIsEditing(false);
  }, [section.content]);

  return (
    <Card
      className={cn(
        'transition-colors',
        section.isApproved && 'border-green-200 bg-green-50/30',
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
            {isAiGenerated && !section.isApproved && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                AI Draft
              </Badge>
            )}
            {section.isApproved && (
              <Badge
                variant="outline"
                className="gap-1 text-xs text-green-700 border-green-300"
              >
                <Check className="h-3 w-3" />
                Approved
              </Badge>
            )}
          </div>

          {!isLocked && !isEditing && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-7 px-2 text-xs"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {!section.isApproved && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleApprove}
                  disabled={isSaving}
                  className="h-7 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={Math.max(4, editContent.split('\n').length + 1)}
              className="font-mono text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {section.content || (
              <span className="text-muted-foreground italic">No content</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
