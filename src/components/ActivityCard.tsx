import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Info } from "lucide-react";
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
    image_url?: string;
    additional_info?: string;
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
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {activity.image_url && (
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${activity.image_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <Badge className="absolute top-4 right-4" variant="secondary">
            {activity.activity_type}
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{activity.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              {activity.profiles.nom} {activity.profiles.post_nom}
            </CardDescription>
          </div>
          {!activity.image_url && (
            <Badge variant="secondary">{activity.activity_type}</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{activity.description}</p>
        
        {activity.additional_info && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <p className="text-sm font-medium">{activity.additional_info}</p>
          </div>
        )}
        
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
