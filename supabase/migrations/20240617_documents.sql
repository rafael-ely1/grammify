-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL DEFAULT '',
    suggestions JSONB [],
    stats JSONB
);
-- Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
-- Create policies
CREATE POLICY "Users can view their own documents" ON public.documents FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON public.documents FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);
-- Create indexes
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_updated_at_idx ON public.documents(updated_at DESC);
-- Enable realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE public.documents;