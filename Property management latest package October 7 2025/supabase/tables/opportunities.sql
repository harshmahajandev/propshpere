CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID,
    property_id UUID,
    customer_id UUID,
    assigned_agent_id UUID,
    status VARCHAR(30) DEFAULT 'open',
    stage VARCHAR(30) DEFAULT 'initial',
    probability DECIMAL(5,2),
    value_bhd DECIMAL(12,2),
    expected_close_date DATE,
    actual_close_date DATE,
    discount_amount DECIMAL(12,2),
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);