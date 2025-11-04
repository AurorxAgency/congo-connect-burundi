import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import NewChatDialog from "@/components/NewChatDialog";
import { MessageSquare } from "lucide-react";

const PrivateChats = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <div className="flex-1 flex max-w-7xl mx-auto w-full border-x">
        {/* Conversations List Sidebar */}
        <div className="w-80 border-r bg-card">
          <ConversationList
            userId={user.id}
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation}
            onNewChat={() => setShowNewChatDialog(true)}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation}
              currentUserId={user.id}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-24 w-24 mb-4 opacity-20" />
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p className="text-sm">Choisissez une discussion ou démarrez-en une nouvelle</p>
            </div>
          )}
        </div>
      </div>

      <NewChatDialog
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
        currentUserId={user.id}
        onConversationCreated={(conversationId) => {
          setSelectedConversation(conversationId);
        }}
      />
    </div>
  );
};

export default PrivateChats;
