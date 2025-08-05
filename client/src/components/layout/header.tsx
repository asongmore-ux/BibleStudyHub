import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useSearchLessons } from "@/hooks/use-content";
import { Sun, Moon, Search, User, LogOut, Settings } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface HeaderProps {
  onShowAuth: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

export function Header({ onShowAuth, onToggleTheme, theme }: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const { data: searchResults } = useSearchLessons(debouncedSearch);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-book-open text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-bold text-foreground hidden sm:block" data-testid="app-title">
            Bible Study Hub
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4 lg:mx-8 relative">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search lessons, verses, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
          
          {/* Search Results Dropdown */}
          {searchResults && searchResults.length > 0 && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.slice(0, 10).map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                  data-testid={`search-result-${lesson.id}`}
                >
                  <h4 className="font-medium text-foreground">{lesson.title}</h4>
                  <p className="text-sm text-muted-foreground">{lesson.excerpt}</p>
                  {lesson.bibleReference && (
                    <p className="text-xs text-primary mt-1">{lesson.bibleReference}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getUserInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block">{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem data-testid="menu-profile">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onShowAuth} data-testid="button-sign-in">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
