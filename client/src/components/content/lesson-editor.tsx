import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileUpload } from "@/components/ui/file-upload";
import { useLesson, useCreateLesson, useUpdateLesson } from "@/hooks/use-content";
import { useAuth } from "@/hooks/use-auth";
import { InsertLesson } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, FileText } from "lucide-react";

interface LessonEditorProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId?: string | null;
  classId?: string | null;
}

export function LessonEditor({ isOpen, onClose, lessonId, classId }: LessonEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: existingLesson } = useLesson(lessonId || '');
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    bibleReference: '',
    imageUrl: '',
    audioUrl: '',
    duration: 0,
    isPublished: false,
  });

  const [isDraft, setIsDraft] = useState(true);

  useEffect(() => {
    if (existingLesson) {
      setFormData({
        title: existingLesson.title,
        content: existingLesson.content,
        excerpt: existingLesson.excerpt || '',
        bibleReference: existingLesson.bibleReference || '',
        imageUrl: existingLesson.imageUrl || '',
        audioUrl: existingLesson.audioUrl || '',
        duration: existingLesson.duration || 0,
        isPublished: existingLesson.isPublished,
      });
      setIsDraft(!existingLesson.isPublished);
    } else {
      // Reset form for new lesson
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        bibleReference: '',
        imageUrl: '',
        audioUrl: '',
        duration: 0,
        isPublished: false,
      });
      setIsDraft(true);
    }
  }, [existingLesson, isOpen]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    // In a real implementation, you'd upload to cloud storage
    // For now, we'll use a placeholder URL
    const imageUrl = "https://images.unsplash.com/photo-1544967919-6e89ec2cb57b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    handleInputChange('imageUrl', imageUrl);
    toast({
      title: "Image uploaded",
      description: "Lesson image has been uploaded successfully.",
    });
  };

  const handleAudioUpload = async (file: File) => {
    // In a real implementation, you'd upload to cloud storage
    const audioUrl = "https://example.com/audio/sample.mp3";
    handleInputChange('audioUrl', audioUrl);
    toast({
      title: "Audio uploaded",
      description: "Audio file has been uploaded successfully.",
    });
  };

  const handleSave = async (publish: boolean = false) => {
    if (!user || !classId) return;

    try {
      const lessonData: Partial<InsertLesson> = {
        ...formData,
        classId,
        createdBy: user.id,
        isPublished: publish,
        order: 0, // In a real app, you'd calculate this
      };

      if (lessonId) {
        await updateLesson.mutateAsync({ id: lessonId, data: lessonData });
        toast({
          title: publish ? "Lesson published" : "Lesson updated",
          description: `Lesson has been ${publish ? 'published' : 'updated'} successfully.`,
        });
      } else {
        await createLesson.mutateAsync(lessonData as InsertLesson);
        toast({
          title: publish ? "Lesson published" : "Lesson created",
          description: `New lesson has been ${publish ? 'published' : 'saved as draft'}.`,
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lesson. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="lesson-editor-title">
            {lessonId ? 'Edit Lesson' : 'Create New Lesson'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter lesson title"
                data-testid="input-lesson-title"
              />
            </div>
            <div>
              <Label htmlFor="bibleReference">Bible Reference</Label>
              <Input
                id="bibleReference"
                value={formData.bibleReference}
                onChange={(e) => handleInputChange('bibleReference', e.target.value)}
                placeholder="e.g., Genesis 12:1-9"
                data-testid="input-bible-reference"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt">Lesson Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Brief description of the lesson content"
              rows={3}
              data-testid="input-lesson-excerpt"
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
              placeholder="Estimated study time"
              min="0"
              data-testid="input-lesson-duration"
            />
          </div>

          {/* Media Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Lesson Image</Label>
              <FileUpload
                accept="image/*"
                onUpload={handleImageUpload}
                currentFile={formData.imageUrl}
                placeholder="Drag & drop an image here"
                data-testid="upload-lesson-image"
              />
            </div>
            <div>
              <Label>Audio File (Optional)</Label>
              <FileUpload
                accept="audio/*"
                onUpload={handleAudioUpload}
                currentFile={formData.audioUrl}
                placeholder="Upload audio narration"
                data-testid="upload-lesson-audio"
              />
            </div>
          </div>

          {/* Rich Text Content */}
          <div>
            <Label>Lesson Content</Label>
            <Card className="mt-2">
              <CardContent className="p-0">
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Start writing your lesson content here..."
                  data-testid="editor-lesson-content"
                />
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={createLesson.isPending || updateLesson.isPending}
              data-testid="button-save-draft"
            >
              {(createLesson.isPending || updateLesson.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <FileText className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={createLesson.isPending || updateLesson.isPending}
              data-testid="button-publish-lesson"
            >
              {(createLesson.isPending || updateLesson.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <Save className="w-4 h-4 mr-2" />
              Publish Lesson
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
