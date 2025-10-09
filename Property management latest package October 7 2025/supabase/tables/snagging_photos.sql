CREATE TABLE snagging_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    snagging_issue_id UUID NOT NULL,
    photo_url TEXT NOT NULL,
    photo_type VARCHAR(50) DEFAULT 'before' CHECK (photo_type IN ('before',
    'during',
    'after')),
    caption TEXT,
    uploaded_by UUID,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);