import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CreateActivity from "@/components/CreateActivity";
import ActivityCard from "@/components/ActivityCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Activities = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();
  }, [navigate]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          profiles:user_id (nom, post_nom)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Activités & Événements</h1>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="all">Toutes les activités</TabsTrigger>
            <TabsTrigger value="create">Créer une activité</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Chargement...
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Aucune activité pour le moment</p>
                <p className="text-sm mt-2">Soyez le premier à créer une activité !</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <CreateActivity onActivityCreated={fetchActivities} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Activities;
