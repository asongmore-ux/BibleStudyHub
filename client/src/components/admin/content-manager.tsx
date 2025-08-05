import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useMains, useCreateMain, useUpdateMain, useDeleteMain, useCreateClass, useUpdateClass, useDeleteClass } from "@/hooks/use-content";
import { useToast } from "@/hooks/use-toast";
import { MainWithClasses, InsertMain, InsertClass } from "@shared/schema";
import { Plus, Edit, Trash2, Save, X, Users, BookOpen, Settings } from "lucide-react";

interface ContentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContentManager({ isOpen, onClose }: ContentManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: mains } = useMains();
  
  const createMain = useCreateMain();
  const updateMain = useUpdateMain();
  const deleteMain = useDeleteMain();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const [activeTab, setActiveTab] = useState("mains");
  const [editingMain, setEditingMain] = useState<MainWithClasses | null>(null);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [showMainForm, setShowMainForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);

  const [mainForm, setMainForm] = useState({
    title: "",
    description: "",
    icon: "fas fa-book",
    order: 0,
  });

  const [classForm, setClassForm] = useState({
    title: "",
    description: "",
    mainId: "",
    parentClassId: "",
    order: 0,
  });

  const iconOptions = [
    { value: "fas fa-book", label: "Book" },
    { value: "fas fa-users", label: "Users" },
    { value: "fas fa-mountain", label: "Mountain" },
    { value: "fas fa-heart", label: "Heart" },
    { value: "fas fa-star", label: "Star" },
    { value: "fas fa-cross", label: "Cross" },
    { value: "fas fa-dove", label: "Dove" },
    { value: "fas fa-church", label: "Church" },
  ];

  if (!user?.isAdmin) {
    return null;
  }

  const resetMainForm = () => {
    setMainForm({
      title: "",
      description: "",
      icon: "fas fa-book",
      order: 0,
    });
    setEditingMain(null);
  };

  const resetClassForm = () => {
    setClassForm({
      title: "",
      description: "",
      mainId: "",
      parentClassId: "",
      order: 0,
    });
    setEditingClass(null);
  };

  const handleCreateMain = () => {
    resetMainForm();
    setShowMainForm(true);
  };

  const handleEditMain = (main: MainWithClasses) => {
    setMainForm({
      title: main.title,
      description: main.description || "",
      icon: main.icon || "",
      order: main.order,
    });
    setEditingMain(main);
    setShowMainForm(true);
  };

  const handleCreateClass = (mainId?: string) => {
    resetClassForm();
    if (mainId) {
      setClassForm(prev => ({ ...prev, mainId }));
    }
    setShowClassForm(true);
  };

  const handleEditClass = (cls: any) => {
    setClassForm({
      title: cls.title,
      description: cls.description || "",
      mainId: cls.mainId,
      parentClassId: cls.parentClassId || "",
      order: cls.order,
    });
    setEditingClass(cls);
    setShowClassForm(true);
  };

  const handleSaveMain = async () => {
    if (!mainForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a title for the main topic.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingMain) {
        await updateMain.mutateAsync({
          id: editingMain.id,
          data: mainForm,
        });
        toast({
          title: "Main Topic Updated",
          description: "The main topic has been updated successfully.",
        });
      } else {
        await createMain.mutateAsync({
          ...mainForm,
          createdBy: user.id,
        } as InsertMain);
        toast({
          title: "Main Topic Created",
          description: "New main topic has been created successfully.",
        });
      }
      setShowMainForm(false);
      resetMainForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save main topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveClass = async () => {
    if (!classForm.title.trim() || !classForm.mainId) {
      toast({
        title: "Validation Error",
        description: "Please enter a title and select a main topic.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingClass) {
        await updateClass.mutateAsync({
          id: editingClass.id,
          data: { ...classForm, parentClassId: classForm.parentClassId || null },
        });
        toast({
          title: "Class Updated",
          description: "The class has been updated successfully.",
        });
      } else {
        await createClass.mutateAsync({
          title: classForm.title,
          description: classForm.description,
          mainId: classForm.mainId,
          parentClassId: classForm.parentClassId || null,
          order: classForm.order,
          createdBy: user.id,
        });
        toast({
          title: "Class Created",
          description: "New class has been created successfully.",
        });
      }
      setShowClassForm(false);
      resetClassForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMain = async (id: string) => {
    if (!confirm("Are you sure you want to delete this main topic? This will also delete all associated classes and lessons.")) {
      return;
    }

    try {
      await deleteMain.mutateAsync(id);
      toast({
        title: "Main Topic Deleted",
        description: "The main topic and all its content has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete main topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class? This will also delete all associated lessons.")) {
      return;
    }

    try {
      await deleteClass.mutateAsync(id);
      toast({
        title: "Class Deleted",
        description: "The class and all its lessons have been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl" data-testid="content-manager-title">
                Content Management
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-content-manager"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mains" data-testid="tab-mains">
              Main Topics
            </TabsTrigger>
            <TabsTrigger value="classes" data-testid="tab-classes">
              Classes
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mains" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Main Topics</h3>
              <Button onClick={handleCreateMain} data-testid="button-create-main">
                <Plus className="w-4 h-4 mr-2" />
                Add Main Topic
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mains?.map((main) => (
                <Card key={main.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <i className={`${main.icon} text-primary`}></i>
                        <CardTitle className="text-base">{main.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMain(main)}
                          data-testid={`button-edit-main-${main.id}`}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMain(main.id)}
                          data-testid={`button-delete-main-${main.id}`}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">
                      {main.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{main.classes.length} classes</span>
                      <span>Order: {main.order}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Form Dialog */}
            <Dialog open={showMainForm} onOpenChange={setShowMainForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMain ? "Edit Main Topic" : "Create Main Topic"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="main-title">Title</Label>
                    <Input
                      id="main-title"
                      value={mainForm.title}
                      onChange={(e) => setMainForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter main topic title"
                      data-testid="input-main-title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="main-description">Description</Label>
                    <Textarea
                      id="main-description"
                      value={mainForm.description}
                      onChange={(e) => setMainForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter description"
                      rows={3}
                      data-testid="input-main-description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="main-icon">Icon</Label>
                    <Select 
                      value={mainForm.icon} 
                      onValueChange={(value) => setMainForm(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger data-testid="select-main-icon">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <i className={option.value}></i>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="main-order">Order</Label>
                    <Input
                      id="main-order"
                      type="number"
                      value={mainForm.order}
                      onChange={(e) => setMainForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      min="0"
                      data-testid="input-main-order"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowMainForm(false)}
                      data-testid="button-cancel-main"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveMain}
                      disabled={createMain.isPending || updateMain.isPending}
                      data-testid="button-save-main"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingMain ? "Update" : "Create"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Classes</h3>
              <Button onClick={() => handleCreateClass()} data-testid="button-create-class">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </div>

            <div className="space-y-6">
              {mains?.map((main) => (
                <Card key={main.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <i className={`${main.icon} text-primary`}></i>
                        <CardTitle>{main.title}</CardTitle>
                        <Badge variant="secondary">{main.classes.length} classes</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateClass(main.id)}
                        data-testid={`button-add-class-${main.id}`}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Class
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {main.classes.map((cls) => (
                        <div
                          key={cls.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{cls.title}</h4>
                            <p className="text-sm text-muted-foreground">{cls.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                              <span>{cls.lessons.length} lessons</span>
                              <span>Order: {cls.order}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClass(cls)}
                              data-testid={`button-edit-class-${cls.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClass(cls.id)}
                              data-testid={`button-delete-class-${cls.id}`}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {main.classes.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No classes yet. Click "Add Class" to create the first one.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Class Form Dialog */}
            <Dialog open={showClassForm} onOpenChange={setShowClassForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingClass ? "Edit Class" : "Create Class"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="class-title">Title</Label>
                    <Input
                      id="class-title"
                      value={classForm.title}
                      onChange={(e) => setClassForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter class title"
                      data-testid="input-class-title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="class-description">Description</Label>
                    <Textarea
                      id="class-description"
                      value={classForm.description}
                      onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter description"
                      rows={3}
                      data-testid="input-class-description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="class-main">Main Topic</Label>
                    <Select 
                      value={classForm.mainId} 
                      onValueChange={(value) => setClassForm(prev => ({ ...prev, mainId: value }))}
                    >
                      <SelectTrigger data-testid="select-class-main">
                        <SelectValue placeholder="Select main topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {mains?.map((main) => (
                          <SelectItem key={main.id} value={main.id}>
                            <div className="flex items-center space-x-2">
                              <i className={main.icon || "fas fa-book"}></i>
                              <span>{main.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="class-order">Order</Label>
                    <Input
                      id="class-order"
                      type="number"
                      value={classForm.order}
                      onChange={(e) => setClassForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      min="0"
                      data-testid="input-class-order"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowClassForm(false)}
                      data-testid="button-cancel-class"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveClass}
                      disabled={createClass.isPending || updateClass.isPending}
                      data-testid="button-save-class"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingClass ? "Update" : "Create"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">User Management</h3>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">User Management</h4>
                    <p className="text-sm text-muted-foreground">
                      User management features will be available in a future update.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
