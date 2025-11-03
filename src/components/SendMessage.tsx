import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Link as LinkIcon } from "lucide-react";

interface SendMessageProps {
  userId: string;
  onMessageSent: () => void;
}

interface Post {
  id: string;
  content: string;
}

const SendMessage = ({ userId, onMessageSent }: SendMessageProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [mentionedPostId, setMentionedPostId] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleSend = async () => {
    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Le message ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("discussion_messages").insert({
        user_id: userId,
        content: content.trim(),
        mentioned_post_id: mentionedPostId || null,
      });

      if (error) throw error;

      setContent("");
      setMentionedPostId("");
      onMessageSent();
      
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });
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

  return (
    <div className="space-y-3 p-4 bg-card border rounded-lg">
      <Textarea
        placeholder="Écrivez votre message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px] resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      
      <div className="flex items-center space-x-2">
        <div className="flex-1 flex items-center space-x-2">
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
          <Select value={mentionedPostId} onValueChange={setMentionedPostId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mentionner une publication (optionnel)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucune publication</SelectItem>
              {posts.map((post) => (
                <SelectItem key={post.id} value={post.id}>
                  {post.content.substring(0, 50)}
                  {post.content.length > 50 ? "..." : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleSend} 
          disabled={sending || !content.trim()}
          size="sm"
        >
          <Send className="h-4 w-4 mr-2" />
          Envoyer
        </Button>
      </div>
    </div>
  );
};

export default SendMessage;
