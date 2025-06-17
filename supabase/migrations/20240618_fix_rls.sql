-- Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
-- Create policies
CREATE POLICY "Users can view their own documents" ON public.documents FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON public.documents FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);
-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_updated_at_idx ON public.documents(updated_at DESC);
-- Enable realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE public.documents;