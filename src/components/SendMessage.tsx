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
  const [mentionedPostId, setMentionedPostId] = useState<string>("none");
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
      const postId = mentionedPostId === "none" ? null : mentionedPostId;
      const { error } = await supabase.from("discussion_messages").insert({
        user_id: userId,
        content: content.trim(),
        mentioned_post_id: postId,
      });

      if (error) throw error;

      setContent("");
      setMentionedPostId("none");
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
    <div className="p-3 space-y-2">
      {mentionedPostId && mentionedPostId !== "none" && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm">
          <LinkIcon className="h-3 w-3 text-primary" />
          <span className="flex-1 text-muted-foreground">
            Publication mentionnée: {posts.find(p => p.id === mentionedPostId)?.content.substring(0, 40)}...
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setMentionedPostId("none")}
          >
            ×
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Select value={mentionedPostId} onValueChange={setMentionedPostId}>
          <SelectTrigger className="w-10 h-10 p-0 shrink-0">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune publication</SelectItem>
            {posts.map((post) => (
              <SelectItem key={post.id} value={post.id}>
                {post.content.substring(0, 50)}
                {post.content.length > 50 ? "..." : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
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
  );
};

export default SendMessage;
