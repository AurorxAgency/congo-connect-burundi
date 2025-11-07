import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquarePlus } from "lucide-react";

interface Conversation {
  id: string;
  last_message_at: string;
  other_user: {
    id: string;
    nom: string;
    post_nom: string;
    document_identite_url: string | null;
  };
  last_message?: {
    content: string;
    sender_id: string;
  };
}

interface ConversationListProps {
  userId: string;
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  onNewChat: () => void;
  refreshTrigger?: number;
}

const ConversationList = ({
  userId,
  onSelectConversation,
  selectedConversationId,
  onNewChat,
  refreshTrigger,
}: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    // Subscribe to new messages to update conversation list
    const channel = supabase
      .channel("private_messages_list")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshTrigger]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Get all conversations where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId);

      if (participantError) {
        console.error("Error fetching participant data:", participantError);
        throw participantError;
      }

      console.log("Participant data:", participantData);

      const conversationIds = participantData?.map((p) => p.conversation_id) || [];

      if (conversationIds.length === 0) {
        console.log("No conversations found for user");
        setConversations([]);
        setLoading(false);
        return;
      }

      console.log("Conversation IDs:", conversationIds);

      // Get conversation details
      const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .select("id, last_message_at")
        .in("id", conversationIds)
        .order("last_message_at", { ascending: false });

      if (conversationError) {
        console.error("Error fetching conversations:", conversationError);
        throw conversationError;
      }

      console.log("Conversation data:", conversationData);

      // For each conversation, get the other participant
      const conversationsWithUsers = await Promise.all(
        (conversationData || []).map(async (conv) => {
          console.log("Processing conversation:", conv.id);
          
          const { data: participants, error: participantsError } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id)
            .neq("user_id", userId);

          if (participantsError) {
            console.error("Error fetching participants:", participantsError);
            return null;
          }

          console.log("Other participants:", participants);

          if (participants && participants.length > 0) {
            const otherUserId = participants[0].user_id;
            
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("id, nom, post_nom, document_identite_url")
              .eq("id", otherUserId)
              .maybeSingle();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
              return null;
            }

            console.log("Profile:", profile);

            // Get last message
            const { data: lastMessage } = await supabase
              .from("private_messages")
              .select("content, sender_id")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            console.log("Last message:", lastMessage);

            if (profile) {
              return {
                id: conv.id,
                last_message_at: conv.last_message_at,
                other_user: profile,
                last_message: lastMessage || undefined,
              };
            }
          }
          return null;
        })
      );

      const filteredConversations = conversationsWithUsers.filter((c) => c !== null) as Conversation[];
      console.log("Final conversations:", filteredConversations);
      setConversations(filteredConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nom: string, postNom: string) => {
    return `${nom.charAt(0)}${postNom.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 bg-background border-b flex items-center justify-between">
        <h2 className="font-bold text-2xl text-foreground">Messages</h2>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onNewChat}
          className="hover:bg-muted"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-background">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <MessageSquarePlus className="h-12 w-12 mb-2 opacity-50" />
            <p>Aucune conversation</p>
            <p className="text-sm">Commencez une nouvelle discussion</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`px-4 py-3 cursor-pointer hover:bg-muted/70 transition-colors ${
                selectedConversationId === conv.id ? "bg-muted" : ""
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarImage src={conv.other_user.document_identite_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(conv.other_user.nom, conv.other_user.post_nom)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold truncate text-foreground">
                      {conv.other_user.nom} {conv.other_user.post_nom}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.last_message_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  {conv.last_message && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message.sender_id === userId ? "Vous: " : ""}
                      {conv.last_message.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
