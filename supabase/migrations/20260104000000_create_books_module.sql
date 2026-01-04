-- Create Storage Bucket for Books
INSERT INTO storage.buckets (id, name, public) 
VALUES ('books', 'books', false)
ON CONFLICT (id) DO NOTHING;

-- Create Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    file_path TEXT NOT NULL,
    cover_url TEXT,
    current_page INTEGER DEFAULT 1,
    total_pages INTEGER NOT NULL DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Database Policies
CREATE POLICY "Users can view their own books"
    ON public.books FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
    ON public.books FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
    ON public.books FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
    ON public.books FOR DELETE
    USING (auth.uid() = user_id);

-- Storage Policies
CREATE POLICY "Users can upload book files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'books' AND 
    auth.uid() = owner
);

CREATE POLICY "Users can view own book files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'books' AND 
    auth.uid() = owner
);

CREATE POLICY "Users can update own book files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'books' AND 
    auth.uid() = owner
);

CREATE POLICY "Users can delete own book files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'books' AND 
    auth.uid() = owner
);
