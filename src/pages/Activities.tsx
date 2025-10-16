import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const Activities = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Activités & Événements</h1>
        <div className="text-center py-12 text-muted-foreground">
          <p>Les activités arrivent bientôt !</p>
          <p className="text-sm mt-2">Cette fonctionnalité sera disponible prochainement.</p>
        </div>
      </div>
    </div>
  );
};

export default Activities;
