CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    property_id UUID,
    lead_source VARCHAR(50),
    status VARCHAR(30) DEFAULT 'new',
    interest_level VARCHAR(20),
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    preferred_bedrooms INTEGER,
    preferred_location TEXT,
    assigned_agent_id UUID,
    qualification_score INTEGER,
    last_contact_date TIMESTAMP,
    next_follow_up TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);