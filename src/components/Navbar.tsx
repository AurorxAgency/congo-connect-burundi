import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Users, Calendar, MessageCircle, LogOut, UserCircle, Mail, MoreVertical, Moon, Sun, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  user?: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/feed" className="flex items-center space-x-2 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl hidden lg:inline">Communauté</span>
          </Link>

          {user && (
            <>
              <div className="relative flex-1 max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 bg-muted/50 border-muted"
                />
              </div>

              <div className="flex items-center space-x-1 md:space-x-2">
              <Button
                variant={isActive("/feed") ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/feed">
                  <Home className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Actualités</span>
                </Link>
              </Button>

              <Button
                variant={isActive("/activities") ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/activities">
                  <Calendar className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Activités</span>
                </Link>
              </Button>

              <Button
                variant={isActive("/discussions") ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/discussions">
                  <MessageCircle className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Salon</span>
                </Link>
              </Button>

              <Button
                variant={isActive("/chats") ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/chats">
                  <Mail className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Messages</span>
                </Link>
              </Button>

              <Button
                variant={isActive("/profile") ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/profile">
                  <UserCircle className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Profil</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Mode clair
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Mode sombre
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            </>
          )}

          {!user && (
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Mode clair
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Mode sombre
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Connexion</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth?mode=signup">S'inscrire</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
