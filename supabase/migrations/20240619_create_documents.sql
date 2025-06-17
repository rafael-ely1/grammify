-- Create documents table
CREATE TABLE "public"."documents" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "user_id" uuid NOT NULL,
    "title" text,
    "content" text DEFAULT '' NOT NULL,
    "suggestions" jsonb [],
    "stats" jsonb
);
-- Enable Row Level Security
ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
-- Create policies
CREATE POLICY "Users can view their own documents" ON "public"."documents" FOR
SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own documents" ON "public"."documents" FOR
INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own documents" ON "public"."documents" FOR
UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own documents" ON "public"."documents" FOR DELETE USING (auth.uid()::text = user_id::text);
-- Create indexes for better performance
CREATE INDEX documents_user_id_idx ON "public"."documents" (user_id);
CREATE INDEX documents_created_at_idx ON "public"."documents" (created_at);
-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime
ADD TABLE "public"."documents";