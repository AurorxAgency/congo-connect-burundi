import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface DiscussionMessageProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    mentioned_post_id: string | null;
    profiles: {
      nom: string;
      post_nom: string;
      document_identite_url: string | null;
    };
  };
  mentionedPost?: {
    content: string;
    image_url: string | null;
  } | null;
}

const DiscussionMessage = ({ message, mentionedPost }: DiscussionMessageProps) => {
  const getInitials = () => {
    return `${message.profiles.nom.charAt(0)}${message.profiles.post_nom.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={message.profiles.document_identite_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">
              {message.profiles.nom} {message.profiles.post_nom}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { 
                addSuffix: true, 
                locale: fr 
              })}
            </span>
          </div>
          <p className="text-foreground">{message.content}</p>
          
          {mentionedPost && (
            <Card className="mt-2 p-3 bg-muted/50 border-l-4 border-l-primary">
              <p className="text-sm text-muted-foreground mb-1">Publication mentionnée:</p>
              <p className="text-sm">{mentionedPost.content}</p>
              {mentionedPost.image_url && (
                <img 
                  src={mentionedPost.image_url} 
                  alt="Post" 
                  className="mt-2 rounded-lg max-h-32 object-cover"
                />
              )}
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DiscussionMessage;
