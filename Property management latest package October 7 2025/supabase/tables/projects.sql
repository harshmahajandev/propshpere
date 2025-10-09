CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    island_id UUID,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    project_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    total_units INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    completion_date DATE,
    master_plan_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);