-- Create a secure function to create conversations with participants
CREATE OR REPLACE FUNCTION public.create_conversation_with_participants(
  participant_user_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_conversation_id uuid;
  participant_id uuid;
BEGIN
  -- Verify that the current user is in the participant list
  IF NOT (auth.uid() = ANY(participant_user_ids)) THEN
    RAISE EXCEPTION 'Current user must be included in participants';
  END IF;

  -- Create the conversation
  INSERT INTO conversations (id, last_message_at)
  VALUES (gen_random_uuid(), now())
  RETURNING id INTO new_conversation_id;

  -- Add all participants
  FOREACH participant_id IN ARRAY participant_user_ids
  LOOP
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (new_conversation_id, participant_id);
  END LOOP;

  RETURN new_conversation_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_conversation_with_participants(uuid[]) TO authenticated;