CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('lead',
    'property',
    'reservation',
    'campaign')),
    entity_id UUID NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4),
    metric_data JSONB,
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text,
    NOW()) NOT NULL
);