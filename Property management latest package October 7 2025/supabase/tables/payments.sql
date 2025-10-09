CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID,
    customer_id UUID,
    payment_type VARCHAR(30),
    amount_bhd DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'BHD',
    payment_method VARCHAR(30),
    payment_status VARCHAR(20) DEFAULT 'pending',
    transaction_ref VARCHAR(100),
    payment_date TIMESTAMP,
    due_date DATE,
    late_fees DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);