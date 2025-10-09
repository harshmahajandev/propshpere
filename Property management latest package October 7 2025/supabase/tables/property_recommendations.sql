CREATE TABLE property_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    property_id UUID,
    match_score DECIMAL(5,2),
    compatibility_factors JSONB,
    recommendation_reason TEXT,
    status VARCHAR(20) DEFAULT 'active',
    viewed_at TIMESTAMP,
    favorited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);