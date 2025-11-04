import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import DiscussionMessage from "@/components/DiscussionMessage";
import SendMessage from "@/components/SendMessage";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface Message {
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
}

interface MentionedPost {
  content: string;
  image_url: string | null;
}

const Discussions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mentionedPosts, setMentionedPosts] = useState<Record<string, MentionedPost>>({});
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchMessages();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchMessages();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("discussion_messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "discussion_messages",
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch profile for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("nom, post_nom, document_identite_url")
            .eq("id", newMessage.user_id)
            .single();

          if (profile) {
            const messageWithProfile = {
              ...newMessage,
              profiles: profile,
            };
            setMessages((prev) => [...prev, messageWithProfile]);

            // Fetch mentioned post if exists
            if (newMessage.mentioned_post_id) {
              fetchMentionedPost(newMessage.mentioned_post_id);
            }
            
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data: messagesData, error } = await supabase
        .from("discussion_messages")
        .select("id, content, created_at, mentioned_post_id, user_id")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for all messages
      const userIds = messagesData?.map((msg) => msg.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, nom, post_nom, document_identite_url")
        .in("id", userIds);

      // Create a map of profiles
      const profilesMap: Record<string, any> = {};
      profilesData?.forEach((profile) => {
        profilesMap[profile.id] = profile;
      });

      // Combine messages with profiles
      const messagesWithProfiles = messagesData?.map((msg) => ({
        ...msg,
        profiles: profilesMap[msg.user_id],
      })) || [];

      setMessages(messagesWithProfiles);

      // Fetch all mentioned posts
      const postIds = messagesData
        ?.filter((msg) => msg.mentioned_post_id)
        .map((msg) => msg.mentioned_post_id) || [];

      if (postIds.length > 0) {
        const { data: posts } = await supabase
          .from("posts")
          .select("id, content, image_url")
          .in("id", postIds);

        if (posts) {
          const postsMap: Record<string, MentionedPost> = {};
          posts.forEach((post) => {
            postsMap[post.id] = {
              content: post.content,
              image_url: post.image_url,
            };
          });
          setMentionedPosts(postsMap);
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMentionedPost = async (postId: string) => {
    try {
      const { data } = await supabase
        .from("posts")
        .select("content, image_url")
        .eq("id", postId)
        .single();

      if (data) {
        setMentionedPosts((prev) => ({
          ...prev,
          [postId]: data,
        }));
      }
    } catch (error) {
      console.error("Error fetching mentioned post:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />
      
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        {/* Chat Header */}
        <div className="bg-card border-b px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Salon Général</h1>
              <p className="text-xs text-muted-foreground">Discussion communautaire</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="h-20 w-3/4 ml-auto" />
              <Skeleton className="h-20 w-3/4" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun message pour le moment.</p>
                <p className="text-sm">Soyez le premier à écrire !</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <DiscussionMessage
                key={message.id}
                message={message}
                currentUserId={user?.id}
                mentionedPost={
                  message.mentioned_post_id
                    ? mentionedPosts[message.mentioned_post_id]
                    : null
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Message Input */}
        {user && (
          <div className="border-t bg-card">
            <SendMessage
              userId={user.id}
              onMessageSent={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Discussions;
