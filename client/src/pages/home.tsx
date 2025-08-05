import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { LessonCard } from "@/components/content/lesson-card";
import { LessonEditor } from "@/components/content/lesson-editor";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/hooks/use-auth";
import { useMains, useClass, useLessons } from "@/hooks/use-content";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, BarChart3, Clock, Bookmark, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user } = useAuth();
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLessonEditor, setShowLessonEditor] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const { data: mains, isLoading: mainsLoading } = useMains();
  const { data: selectedClass } = useClass(selectedClassId || '');
  const { data: lessons } = useLessons(selectedClassId || '');

  // Theme management
  useEffect(() => {
    const stored = localStorage.getItem('bible-study-theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('bible-study-theme', newTheme);
  };

  // Calculate user progress
  const totalLessons = mains?.reduce((total, main) => 
    total + main.classes.reduce((classTotal, cls) => 
      classTotal + cls.lessons.length, 0), 0) || 0;
  
  const completedLessons = mains?.reduce((total, main) => 
    total + main.classes.reduce((classTotal, cls) => 
      classTotal + cls.lessons.filter((lesson: any) => lesson.progress?.completed).length, 0), 0) || 0;

  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleCreateLesson = () => {
    setEditingLessonId(null);
    setShowLessonEditor(true);
  };

  const handleEditLesson = (lessonId: string) => {
    setEditingLessonId(lessonId);
    setShowLessonEditor(true);
  };

  if (mainsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onShowAuth={() => setShowAuthModal(true)}
          onToggleTheme={toggleTheme}
          theme={theme}
        />
        <div className="flex h-screen pt-16">
          <div className="w-80 bg-card border-r p-4">
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onShowAuth={() => setShowAuthModal(true)}
        onToggleTheme={toggleTheme}
        theme={theme}
      />
      
      <div className="flex h-screen pt-16">
        <Sidebar
          mains={mains || []}
          selectedMainId={selectedMainId}
          selectedClassId={selectedClassId}
          onSelectMain={setSelectedMainId}
          onSelectClass={setSelectedClassId}
          userProgress={{
            completed: completedLessons,
            total: totalLessons,
            percentage: progressPercentage
          }}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Breadcrumb */}
          <div className="bg-card border-b px-6 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="#" 
                    onClick={() => {
                      setSelectedMainId(null);
                      setSelectedClassId(null);
                    }}
                    data-testid="breadcrumb-home"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {selectedMainId && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        href="#"
                        onClick={() => setSelectedClassId(null)}
                        data-testid="breadcrumb-main"
                      >
                        {mains?.find(m => m.id === selectedMainId)?.title}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                {selectedClassId && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage data-testid="breadcrumb-class">
                        {selectedClass?.title}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="p-6">
            {selectedClassId && selectedClass ? (
              <>
                {/* Class Header */}
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                          <i className="fas fa-users text-white text-2xl"></i>
                        </div>
                        <div>
                          <CardTitle className="text-2xl" data-testid="class-title">
                            {selectedClass.title}
                          </CardTitle>
                          <CardDescription data-testid="class-description">
                            {selectedClass.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      {user?.isAdmin && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" data-testid="button-edit-class">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Class
                          </Button>
                          <Button onClick={handleCreateLesson} size="sm" data-testid="button-add-lesson">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Lesson
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  {/* Class Stats */}
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary" data-testid="stat-total-lessons">
                          {selectedClass.lessons.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Lessons</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent" data-testid="stat-completed-lessons">
                          {selectedClass.lessons.filter((l: any) => l.progress?.completed).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary" data-testid="stat-study-time">
                          {Math.round(selectedClass.lessons.reduce((total: number, l: any) => total + (l.duration || 0), 0) / 60 * 10) / 10}h
                        </div>
                        <div className="text-sm text-muted-foreground">Study Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600" data-testid="stat-bookmarks">
                          {selectedClass.lessons.filter((l: any) => l.progress?.bookmarked).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Bookmarked</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessons?.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={user?.isAdmin ? () => handleEditLesson(lesson.id) : undefined}
                    />
                  ))}

                  {/* Add New Lesson Card */}
                  {user?.isAdmin && (
                    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer group" onClick={handleCreateLesson} data-testid="card-add-lesson">
                      <CardContent className="flex flex-col items-center justify-center h-80 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                          <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          Add New Lesson
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Create a new lesson for this class
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              /* Welcome/Overview Screen */
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-book-open text-white text-3xl"></i>
                  </div>
                  <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="welcome-title">
                    Welcome to Bible Study Hub
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Grow in faith through comprehensive Bible study
                  </p>
                </div>

                {user && (
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Your Progress</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-1 bg-secondary rounded-full h-3">
                          <div 
                            className="bg-accent h-3 rounded-full transition-all duration-500" 
                            data-testid="progress-bar"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium" data-testid="progress-percentage">
                          {progressPercentage}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-accent" data-testid="overview-completed">
                            {completedLessons}
                          </div>
                          <div className="text-sm text-muted-foreground">Completed</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary" data-testid="overview-total">
                            {totalLessons}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Lessons</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-secondary" data-testid="overview-remaining">
                            {totalLessons - completedLessons}
                          </div>
                          <div className="text-sm text-muted-foreground">Remaining</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Featured Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mains?.slice(0, 3).map((main) => (
                    <Card key={main.id} className="card-hover cursor-pointer" onClick={() => setSelectedMainId(main.id)} data-testid={`card-main-${main.id}`}>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <i className={`${main.icon} text-white text-lg`}></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{main.title}</CardTitle>
                            <CardDescription>
                              {main.classes.reduce((total, cls) => total + cls.lessons.length, 0)} lessons
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {main.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <LessonEditor
        isOpen={showLessonEditor}
        onClose={() => {
          setShowLessonEditor(false);
          setEditingLessonId(null);
        }}
        lessonId={editingLessonId}
        classId={selectedClassId}
      />
    </div>
  );
}
