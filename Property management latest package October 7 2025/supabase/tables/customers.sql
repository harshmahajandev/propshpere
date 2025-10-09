CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    bahrain_id VARCHAR(255),
    nationality VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10),
    marital_status VARCHAR(20),
    occupation VARCHAR(100),
    monthly_income DECIMAL(12,2),
    customer_type VARCHAR(30) DEFAULT 'individual',
    preferred_language VARCHAR(10) DEFAULT 'english',
    lead_source VARCHAR(50),
    assigned_agent_id UUID REFERENCES users(id),
    credit_score INTEGER,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);