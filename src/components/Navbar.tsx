import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, MessageCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  user?: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const location = useLocation();
  const { toast } = useToast();

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
        <div className="flex items-center justify-between h-16">
          <Link to="/feed" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl hidden md:inline">Communauté</span>
          </Link>

          {user && (
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
                  <span className="hidden md:inline">Discussions</span>
                </Link>
              </Button>

              <ThemeToggle />

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Déconnexion</span>
              </Button>
            </div>
          )}

          {!user && (
            <div className="flex items-center space-x-2">
              <ThemeToggle />
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
