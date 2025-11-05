import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

interface User {
  id: string;
  nom: string;
  post_nom: string;
  document_identite_url: string | null;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  onConversationCreated: (conversationId: string) => void;
}

const NewChatDialog = ({
  open,
  onOpenChange,
  currentUserId,
  onConversationCreated,
}: NewChatDialogProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.nom.toLowerCase().includes(query) ||
            user.post_nom.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nom, post_nom, document_identite_url")
        .neq("id", currentUserId)
        .order("nom");

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (otherUserId: string) => {
    setCreating(true);
    try {
      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", currentUserId);

      if (existingParticipants && existingParticipants.length > 0) {
        for (const participant of existingParticipants) {
          const { data: otherParticipants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", participant.conversation_id)
            .neq("user_id", currentUserId);

          if (
            otherParticipants &&
            otherParticipants.length === 1 &&
            otherParticipants[0].user_id === otherUserId
          ) {
            // Conversation already exists
            onConversationCreated(participant.conversation_id);
            onOpenChange(false);
            return;
          }
        }
      }

      // Create new conversation using secure function
      const { data: conversationId, error: conversationError } = await supabase
        .rpc("create_conversation_with_participants", {
          participant_user_ids: [currentUserId, otherUserId],
        });

      if (conversationError) throw conversationError;

      onConversationCreated(conversationId);
      onOpenChange(false);
      
      toast({
        title: "Conversation créée",
        description: "Vous pouvez maintenant commencer à discuter",
      });
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la conversation",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (nom: string, postNom: string) => {
    return `${nom.charAt(0)}${postNom.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun utilisateur trouvé
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => createConversation(user.id)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.document_identite_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.nom, user.post_nom)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="font-semibold">
                      {user.nom} {user.post_nom}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    disabled={creating}
                    onClick={(e) => {
                      e.stopPropagation();
                      createConversation(user.id);
                    }}
                  >
                    Discuter
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;
