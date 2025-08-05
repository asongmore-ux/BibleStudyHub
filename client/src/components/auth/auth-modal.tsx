import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, X } from "lucide-react";
import { z } from "zod";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Please enter your full name"),
});

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = loginSchema.parse(loginForm);
      await login(validatedData.email, validatedData.password);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Sign in failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = registerSchema.parse(registerForm);
      await register(validatedData.email, validatedData.password, validatedData.fullName);
      
      toast({
        title: "Welcome to Bible Study Hub!",
        description: "Your account has been created successfully.",
      });
      
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Registration failed",
          description: "Please try again or contact support if the problem persists.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoginForm = (field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const updateRegisterForm = (field: string, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="auth-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-xl" data-testid="auth-modal-title">
                  Bible Study Hub
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Join thousands in spiritual growth
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-auth"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to continue your Bible study journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => updateLoginForm("email", e.target.value)}
                      placeholder="Enter your email"
                      required
                      data-testid="input-login-email"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive" data-testid="error-login-email">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => updateLoginForm("password", e.target.value)}
                      placeholder="Enter your password"
                      required
                      data-testid="input-login-password"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive" data-testid="error-login-password">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-submit-login"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Create an account</CardTitle>
                <CardDescription>
                  Start your Bible study journey today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      value={registerForm.fullName}
                      onChange={(e) => updateRegisterForm("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      required
                      data-testid="input-register-name"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive" data-testid="error-register-name">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => updateRegisterForm("email", e.target.value)}
                      placeholder="Enter your email"
                      required
                      data-testid="input-register-email"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive" data-testid="error-register-email">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => updateRegisterForm("password", e.target.value)}
                      placeholder="Create a password"
                      required
                      data-testid="input-register-password"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive" data-testid="error-register-password">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={isLoading}
                    data-testid="button-submit-register"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
