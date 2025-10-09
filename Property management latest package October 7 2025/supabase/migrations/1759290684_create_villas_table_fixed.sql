-- Migration: create_villas_table_fixed
-- Created at: 1759290684

-- Create villas table for Interactive Property Map (without foreign key constraint)
CREATE TABLE IF NOT EXISTS villas (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255), -- Remove foreign key constraint due to type mismatch
    unit_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- available, reserved, sold, under_construction
    size_sqft NUMERIC,
    price NUMERIC,
    floor_plan_url TEXT,
    position_x INT, -- For map layout
    position_y INT, -- For map layout
    project VARCHAR(255),
    title VARCHAR(255),
    bedrooms INT,
    bathrooms INT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_villas_status ON villas(status);
CREATE INDEX IF NOT EXISTS idx_villas_project ON villas(project);
CREATE INDEX IF NOT EXISTS idx_villas_price ON villas(price);
CREATE INDEX IF NOT EXISTS idx_villas_unit_number ON villas(unit_number);;