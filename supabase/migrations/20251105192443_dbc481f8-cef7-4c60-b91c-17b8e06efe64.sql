-- Fix infinite recursion in conversation_participants RLS policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;

-- Create a simpler policy without circular reference
CREATE POLICY "Users can view participants of their conversations"
ON conversation_participants
FOR SELECT
USING (user_id = auth.uid());

-- Fix private_messages policy to avoid recursion
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON private_messages;

CREATE POLICY "Users can view messages from their conversations"
ON private_messages
FOR SELECT
USING (
  sender_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = private_messages.conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- Allow users to delete their own messages
DROP POLICY IF EXISTS "Users can delete their own messages" ON private_messages;

CREATE POLICY "Users can delete their own messages"
ON private_messages
FOR DELETE
USING (sender_id = auth.uid());