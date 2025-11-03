import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, CreditCard, Calendar } from "lucide-react";

interface Profile {
  id: string;
  nom: string;
  post_nom: string;
  email: string;
  numero_carte_identite: string;
  document_identite_url: string | null;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchProfile(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!profile) return "?";
    return `${profile.nom.charAt(0)}${profile.post_nom.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-48 mt-4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ) : profile ? (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.document_identite_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {profile.nom} {profile.post_nom}
                  </CardTitle>
                  <p className="text-muted-foreground">Membre de la communauté</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-medium">{profile.nom} {profile.post_nom}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carte d'identité</p>
                    <p className="font-medium">{profile.numero_carte_identite}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Membre depuis</p>
                    <p className="font-medium">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Aucune information de profil disponible</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
