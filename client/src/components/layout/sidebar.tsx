import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MainWithClasses } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { ChevronRight, Plus, Edit, Trash2, Crown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mains: MainWithClasses[];
  selectedMainId: string | null;
  selectedClassId: string | null;
  onSelectMain: (id: string | null) => void;
  onSelectClass: (id: string | null) => void;
  userProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export function Sidebar({ 
  mains, 
  selectedMainId, 
  selectedClassId, 
  onSelectMain, 
  onSelectClass,
  userProgress 
}: SidebarProps) {
  const { user } = useAuth();
  const [expandedMains, setExpandedMains] = useState<Set<string>>(new Set());

  const toggleMainExpansion = (mainId: string) => {
    const newExpanded = new Set(expandedMains);
    if (newExpanded.has(mainId)) {
      newExpanded.delete(mainId);
    } else {
      newExpanded.add(mainId);
    }
    setExpandedMains(newExpanded);
  };

  const handleMainClick = (mainId: string) => {
    if (selectedMainId === mainId) {
      // If clicking the same main, collapse it
      onSelectMain(null);
      onSelectClass(null);
      setExpandedMains(prev => {
        const newSet = new Set(prev);
        newSet.delete(mainId);
        return newSet;
      });
    } else {
      // Select new main and expand it
      onSelectMain(mainId);
      onSelectClass(null);
      setExpandedMains(prev => new Set(prev).add(mainId));
    }
  };

  const handleClassClick = (classId: string) => {
    onSelectClass(classId);
  };

  return (
    <aside className="w-80 bg-card border-r overflow-y-auto custom-scrollbar">
      <div className="p-4">
        {/* Progress Overview */}
        {user && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base" data-testid="progress-title">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium" data-testid="progress-text">
                    {userProgress.completed}/{userProgress.total}
                  </span>
                </div>
                <Progress 
                  value={userProgress.percentage} 
                  className="h-2"
                  data-testid="progress-indicator"
                />
                <p className="text-sm text-muted-foreground">
                  {userProgress.completed} classes completed
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Controls */}
        {user?.isAdmin && (
          <Card className="mb-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Admin Panel
                </span>
              </div>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                  data-testid="button-add-main"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Main
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                  data-testid="button-manage-users"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tree */}
        <nav className="space-y-2">
          {mains.map((main) => {
            const isExpanded = expandedMains.has(main.id);
            const isSelected = selectedMainId === main.id;
            
            return (
              <div key={main.id} className="main-section">
                <div
                  className={cn(
                    "flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer group transition-colors",
                    isSelected && "bg-primary/10 text-primary"
                  )}
                  onClick={() => handleMainClick(main.id)}
                  data-testid={`main-${main.id}`}
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <ChevronRight 
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}
                    />
                    <i className={`${main.icon} text-primary text-sm`}></i>
                    <span className="font-medium text-foreground">{main.title}</span>
                  </div>
                  
                  {user?.isAdmin && (
                    <div className="hidden group-hover:flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit main
                        }}
                        data-testid={`button-edit-main-${main.id}`}
                        title="Edit"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete main
                        }}
                        data-testid={`button-delete-main-${main.id}`}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Classes under this main */}
                {isExpanded && (
                  <div className="ml-6 space-y-1 mt-1">
                    {main.classes.map((cls) => (
                      <div
                        key={cls.id}
                        className={cn(
                          "flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer group transition-colors",
                          selectedClassId === cls.id && "bg-primary/10 text-primary"
                        )}
                        onClick={() => handleClassClick(cls.id)}
                        data-testid={`class-${cls.id}`}
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          <span className="text-foreground">{cls.title}</span>
                          <Badge variant="secondary" className="text-xs" data-testid={`class-lesson-count-${cls.id}`}>
                            {cls.lessons.length} lessons
                          </Badge>
                        </div>
                        
                        {user?.isAdmin && (
                          <div className="hidden group-hover:flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-accent"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle add lesson
                              }}
                              data-testid={`button-add-lesson-${cls.id}`}
                              title="Add Lesson"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle edit class
                              }}
                              data-testid={`button-edit-class-${cls.id}`}
                              title="Edit"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add New Main Button */}
          {user?.isAdmin && (
            <Button
              variant="outline"
              className="w-full justify-start border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
              data-testid="button-add-new-main"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Main Topic
            </Button>
          )}
        </nav>
      </div>
    </aside>
  );
}
