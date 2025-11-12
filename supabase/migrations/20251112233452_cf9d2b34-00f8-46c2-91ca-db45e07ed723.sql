-- Add image_url and additional_info columns to activities table
ALTER TABLE public.activities 
ADD COLUMN image_url TEXT,
ADD COLUMN additional_info TEXT;

-- Create storage bucket for activity images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for activity images
CREATE POLICY "Activity images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'activity-images');

CREATE POLICY "Authenticated users can upload activity images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'activity-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their activity images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'activity-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their activity images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'activity-images' AND auth.uid() IS NOT NULL);