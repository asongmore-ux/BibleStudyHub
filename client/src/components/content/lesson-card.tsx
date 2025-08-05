import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LessonWithProgress } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProgress } from "@/hooks/use-content";
import { Clock, FileText, Volume2, Bookmark, BookmarkCheck, Edit, CheckCircle, Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  lesson: LessonWithProgress;
  onEdit?: () => void;
}

export function LessonCard({ lesson, onEdit }: LessonCardProps) {
  const { user } = useAuth();
  const updateProgress = useUpdateProgress();
  const [isBookmarked, setIsBookmarked] = useState(lesson.progress?.bookmarked || false);

  const isCompleted = lesson.progress?.completed || false;
  const isLocked = !isCompleted && !lesson.progress; // Simple lock logic - could be more sophisticated

  const handleBookmarkToggle = async () => {
    if (!user) return;
    
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    try {
      await updateProgress.mutateAsync({
        lessonId: lesson.id,
        bookmarked: newBookmarkState,
      });
    } catch (error) {
      // Revert on error
      setIsBookmarked(!newBookmarkState);
    }
  };

  const handleContinue = async () => {
    if (!user) return;
    
    try {
      await updateProgress.mutateAsync({
        lessonId: lesson.id,
        completed: true,
        studyTime: (lesson.progress?.studyTime || 0) + (lesson.duration || 0),
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge className="bg-accent text-accent-foreground" data-testid={`status-completed-${lesson.id}`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    
    if (lesson.progress && !isCompleted) {
      return (
        <Badge variant="secondary" data-testid={`status-progress-${lesson.id}`}>
          <Play className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }

    if (isLocked) {
      return (
        <Badge variant="outline" data-testid={`status-locked-${lesson.id}`}>
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </Badge>
      );
    }

    return null;
  };

  return (
    <Card className={cn(
      "group hover:shadow-md transition-shadow duration-200",
      isCompleted && "ring-1 ring-accent/20"
    )} data-testid={`lesson-card-${lesson.id}`}>
      <div className="relative">
        {/* Lesson Image */}
        {lesson.imageUrl && (
          <img
            src={lesson.imageUrl}
            alt={lesson.title}
            className="w-full h-48 object-cover rounded-t-lg"
            data-testid={`lesson-image-${lesson.id}`}
          />
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>
        
        {/* Audio Indicator */}
        {lesson.audioUrl && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-black/50 text-white border-0" data-testid={`audio-indicator-${lesson.id}`}>
              <Volume2 className="w-3 h-3 mr-1" />
              Audio
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 flex-1" data-testid={`lesson-title-${lesson.id}`}>
            {lesson.title}
          </h3>
          
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-amber-500 transition-colors ml-2"
              onClick={handleBookmarkToggle}
              data-testid={`button-bookmark-${lesson.id}`}
              title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {lesson.excerpt && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`lesson-excerpt-${lesson.id}`}>
            {lesson.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            {lesson.duration && (
              <div className="flex items-center space-x-1" data-testid={`lesson-duration-${lesson.id}`}>
                <Clock className="w-3 h-3" />
                <span>{lesson.duration} min</span>
              </div>
            )}
            
            {lesson.bibleReference && (
              <div className="flex items-center space-x-1" data-testid={`lesson-reference-${lesson.id}`}>
                <FileText className="w-3 h-3" />
                <span>{lesson.bibleReference}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onEdit}
                data-testid={`button-edit-lesson-${lesson.id}`}
                title="Edit lesson"
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={handleContinue}
              disabled={isLocked || updateProgress.isPending}
              className={cn(
                "text-xs px-3 py-1",
                isLocked && "bg-muted text-muted-foreground cursor-not-allowed",
                isCompleted && "bg-accent hover:bg-accent/90"
              )}
              data-testid={`button-continue-${lesson.id}`}
            >
              {isLocked 
                ? "Locked" 
                : isCompleted 
                  ? "Review" 
                  : lesson.progress 
                    ? "Continue" 
                    : "Start"
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
