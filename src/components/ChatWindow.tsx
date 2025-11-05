import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, MoreVertical, Forward, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast as sonnerToast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: {
    nom: string;
    post_nom: string;
    document_identite_url: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

const ChatWindow = ({ conversationId, currentUserId }: ChatWindowProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    fetchOtherUser();

    // Subscribe to new messages
    const channel = supabase
      .channel(`private_messages_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          const { data: profile } = await supabase
            .from("profiles")
            .select("nom, post_nom, document_identite_url")
            .eq("id", newMessage.sender_id)
            .single();

          if (profile) {
            setMessages((prev) => [
              ...prev,
              {
                ...newMessage,
                sender: profile,
              },
            ]);
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("private_messages")
        .select("id, content, sender_id, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set(data?.map((m) => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nom, post_nom, document_identite_url")
        .in("id", senderIds);

      const profilesMap: Record<string, any> = {};
      profiles?.forEach((p) => {
        profilesMap[p.id] = p;
      });

      const messagesWithProfiles =
        data?.map((msg) => ({
          ...msg,
          sender: profilesMap[msg.sender_id],
        })) || [];

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    try {
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .neq("user_id", currentUserId);

      if (participants && participants.length > 0) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, nom, post_nom, document_identite_url")
          .eq("id", participants[0].user_id)
          .single();

        setOtherUser(profile);
      }
    } catch (error) {
      console.error("Error fetching other user:", error);
    }
  };

  const handleSend = async () => {
    if (!content.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("private_messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: content.trim(),
      });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      setContent("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('private_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      sonnerToast.success("Message supprimé");
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      sonnerToast.error("Erreur lors de la suppression");
    }
  };

  const handleForwardMessage = (messageContent: string) => {
    setContent(messageContent);
  };

  const getInitials = (nom: string, postNom: string) => {
    return `${nom.charAt(0)}${postNom.charAt(0)}`.toUpperCase();
  };

  if (!otherUser) {
    return <div className="flex items-center justify-center h-full">Chargement...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-card border-b px-4 py-3 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.document_identite_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(otherUser.nom, otherUser.post_nom)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">
            {otherUser.nom} {otherUser.post_nom}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-3/4" />
            <Skeleton className="h-20 w-3/4 ml-auto" />
            <Skeleton className="h-20 w-3/4" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Aucun message. Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  isCurrentUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={message.sender.document_identite_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(message.sender.nom, message.sender.post_nom)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`flex flex-col max-w-[75%] ${
                    isCurrentUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 group relative ${
                      isCurrentUser
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border rounded-tl-sm"
                    }`}
                  >
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
                          <DropdownMenuItem onClick={() => handleForwardMessage(message.content)}>
                            <Forward className="h-4 w-4 mr-2" />
                            Retransférer
                          </DropdownMenuItem>
                          {isCurrentUser && (
                            <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>

                {isCurrentUser && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={message.sender.document_identite_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(message.sender.nom, message.sender.post_nom)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Message Input */}
      <div className="border-t bg-card p-3">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Écrivez votre message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[40px] max-h-[120px] resize-none flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <Button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
