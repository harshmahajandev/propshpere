-- Migration: create_invoice_milestones_system
-- Created at: 1759250094

-- Migration: create_invoice_milestones_system
-- Create comprehensive milestone-based invoice generation system

-- Create milestones table for payment milestones
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_type TEXT NOT NULL,
    milestone_name TEXT NOT NULL,
    milestone_order INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_type, milestone_order)
);

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    total_price DECIMAL(15,2) NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    milestones_completed JSONB DEFAULT '{}',
    payment_plan JSONB DEFAULT '{}',
    booking_reference TEXT UNIQUE NOT NULL,
    terms_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add milestone support to existing invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS milestone_name TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS milestone_percentage DECIMAL(5,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;

-- Insert default milestones for different property types
INSERT INTO milestones (property_type, milestone_name, milestone_order, percentage, description) VALUES
('villa', 'Down Payment', 1, 20.00, 'Initial down payment to secure the property'),
('villa', 'Foundation Completion', 2, 25.00, 'Payment upon completion of foundation work'),
('villa', 'Structure Completion', 3, 25.00, 'Payment upon completion of main structure'),
('villa', 'Finishing Works', 4, 20.00, 'Payment upon completion of interior finishing'),
('villa', 'Final Payment', 5, 10.00, 'Final payment upon handover'),

('apartment', 'Down Payment', 1, 25.00, 'Initial down payment to secure the apartment'),
('apartment', 'Construction Start', 2, 25.00, 'Payment upon construction commencement'),
('apartment', 'Mid Construction', 3, 25.00, 'Payment at 50% construction completion'),
('apartment', 'Final Payment', 4, 25.00, 'Final payment upon handover'),

('commercial', 'Down Payment', 1, 30.00, 'Initial down payment for commercial property'),
('commercial', 'Construction Milestone 1', 2, 30.00, 'First construction milestone payment'),
('commercial', 'Construction Milestone 2', 3, 25.00, 'Second construction milestone payment'),
('commercial', 'Final Payment', 4, 15.00, 'Final payment upon handover'),

('plot', 'Down Payment', 1, 50.00, 'Initial payment for plot reservation'),
('plot', 'Final Payment', 2, 50.00, 'Final payment upon plot transfer');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_milestones_property_type ON milestones(property_type);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_invoices_milestone ON invoices(milestone_name);
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);

-- Create trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;