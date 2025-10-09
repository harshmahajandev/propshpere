CREATE TABLE customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    min_bathrooms INTEGER,
    preferred_locations TEXT[],
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    property_types TEXT[],
    lifestyle_preferences JSONB,
    amenity_preferences TEXT[],
    transportation_preferences JSONB,
    family_composition JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);