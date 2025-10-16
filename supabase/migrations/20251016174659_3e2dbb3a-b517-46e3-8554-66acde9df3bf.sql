-- Remove telephone and photo_profil_url columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS telephone;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS photo_profil_url;

-- Update the handle_new_user function to remove telephone reference
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, post_nom, email, numero_carte_identite)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'post_nom', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'numero_carte_identite', '')
  );
  RETURN NEW;
END;
$$;

-- Delete the profiles storage bucket since we only use identity-documents now
DELETE FROM storage.buckets WHERE id = 'profiles';