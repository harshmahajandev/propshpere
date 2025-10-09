CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID,
    customer_id UUID,
    reservation_code VARCHAR(50) UNIQUE,
    status VARCHAR(30) DEFAULT 'pending',
    reservation_amount DECIMAL(12,2),
    reservation_date TIMESTAMP,
    expiry_date TIMESTAMP,
    payment_plan JSONB,
    terms_conditions TEXT,
    agent_id UUID,
    approved_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);