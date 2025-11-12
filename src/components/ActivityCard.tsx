import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ActivityCardProps {
  activity: {
    id: string;
    name: string;
    activity_type: string;
    contact_info: string;
    description: string;
    created_at: string;
    profiles: {
      nom: string;
      post_nom: string;
    };
  };
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const handleContact = () => {
    window.open(`https://wa.me/${activity.contact_info.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{activity.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              {activity.profiles.nom} {activity.profiles.post_nom}
            </CardDescription>
          </div>
          <Badge variant="secondary">{activity.activity_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{activity.description}</p>
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {format(new Date(activity.created_at), "d MMMM yyyy", { locale: fr })}
          </span>
          <Button onClick={handleContact} size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contacter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
