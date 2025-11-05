import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MoreVertical, Forward, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiscussionMessageProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    mentioned_post_id: string | null;
    user_id: string;
    profiles: {
      nom: string;
      post_nom: string;
      document_identite_url: string | null;
    };
  };
  currentUserId?: string;
  mentionedPost?: {
    content: string;
    image_url: string | null;
  } | null;
  onForward?: (content: string) => void;
  onDelete?: () => void;
}

const DiscussionMessage = ({ message, currentUserId, mentionedPost, onForward, onDelete }: DiscussionMessageProps) => {
  const getInitials = () => {
    return `${message.profiles.nom.charAt(0)}${message.profiles.post_nom.charAt(0)}`.toUpperCase();
  };

  const isCurrentUser = message.user_id === currentUserId;

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('discussion_messages')
        .delete()
        .eq('id', message.id);

      if (error) throw error;

      toast.success("Message supprimé");
      onDelete?.();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleForward = () => {
    onForward?.(message.content);
  };

  return (
    <div className={`flex items-start gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.profiles.document_identite_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
            {message.profiles.nom} {message.profiles.post_nom}
          </span>
        )}
        
        <div className={`rounded-2xl px-4 py-2 ${
          isCurrentUser 
            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
            : 'bg-card border rounded-tl-sm'
        } group relative`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm break-words flex-1">{message.content}</p>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleForward}>
                  <Forward className="h-4 w-4 mr-2" />
                  Retransférer
                </DropdownMenuItem>
                {isCurrentUser && (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {mentionedPost && (
            <div className={`mt-2 p-2 rounded-lg border-l-2 ${
              isCurrentUser 
                ? 'bg-primary-foreground/10 border-l-primary-foreground/30' 
                : 'bg-muted/50 border-l-primary'
            }`}>
              <p className="text-xs opacity-70 mb-1">Publication mentionnée:</p>
              <p className="text-xs">{mentionedPost.content}</p>
              {mentionedPost.image_url && (
                <img 
                  src={mentionedPost.image_url} 
                  alt="Post" 
                  className="mt-1 rounded max-h-24 object-cover"
                />
              )}
            </div>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatDistanceToNow(new Date(message.created_at), { 
            addSuffix: true, 
            locale: fr 
          })}
        </span>
      </div>
      
      {isCurrentUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.profiles.document_identite_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default DiscussionMessage;
