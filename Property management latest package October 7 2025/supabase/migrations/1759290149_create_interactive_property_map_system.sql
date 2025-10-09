-- Migration: create_interactive_property_map_system
-- Created at: 1759290149

-- Enhanced Property Units for Interactive Map
CREATE TABLE villa_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_number VARCHAR(50) NOT NULL UNIQUE,
  project_id UUID,
  island_id UUID,
  property_type VARCHAR(100) NOT NULL,
  floor_level INTEGER DEFAULT 1,
  built_up_area DECIMAL(10,2) NOT NULL,
  land_area DECIMAL(10,2),
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  parking_spaces INTEGER DEFAULT 0,
  base_price DECIMAL(15,2) NOT NULL,
  current_price DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'available', -- available, reserved, sold, under_construction
  position_x INTEGER DEFAULT 0, -- Map coordinates
  position_y INTEGER DEFAULT 0, -- Map coordinates
  floor_plan_url TEXT,
  villa_images TEXT[],
  amenities TEXT[],
  specifications JSONB,
  sales_person_id UUID,
  reserved_date TIMESTAMP WITH TIME ZONE,
  sold_date TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quick Registration from Map
CREATE TABLE map_quick_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_unit_id UUID NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  interest_level VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
  budget_range VARCHAR(100),
  preferred_contact_method VARCHAR(50) DEFAULT 'phone', -- phone, email, whatsapp
  preferred_contact_time VARCHAR(100),
  initial_notes TEXT,
  registration_source VARCHAR(50) DEFAULT 'property_map',
  assigned_sales_person_id UUID,
  follow_up_required BOOLEAN DEFAULT true,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted, lost
  lead_id UUID, -- Link to leads table when converted
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Villa Interaction Tracking
CREATE TABLE villa_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_unit_id UUID NOT NULL,
  user_id UUID NOT NULL,
  interaction_type VARCHAR(50) NOT NULL, -- view, select, register, status_change
  interaction_details JSONB,
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Villa Status Updates
CREATE TABLE villa_status_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_unit_id UUID NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  updated_by UUID NOT NULL,
  reason TEXT,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Map Layout Configuration
CREATE TABLE map_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  layout_name VARCHAR(200) NOT NULL,
  layout_type VARCHAR(50) DEFAULT 'grid', -- grid, site_plan, floor_plan
  dimensions JSONB, -- {width: 1200, height: 800}
  background_image_url TEXT,
  grid_settings JSONB, -- {rows: 10, cols: 15, spacing: 50}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample villa units for demonstration
INSERT INTO villa_units (unit_number, property_type, floor_level, built_up_area, land_area, bedrooms, bathrooms, parking_spaces, base_price, current_price, status, position_x, position_y, amenities, specifications) VALUES
-- Al Naseem Villas
('AN-001', 'Villa', 1, 250.5, 400.0, 3, 4, 2, 280000, 280000, 'available', 100, 100, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area'], 
 '{"view": "sea", "furnished": false, "smart_home": true}'),
('AN-002', 'Villa', 1, 300.0, 450.0, 4, 5, 2, 350000, 350000, 'available', 200, 100, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Gym'], 
 '{"view": "garden", "furnished": false, "smart_home": true}'),
('AN-003', 'Villa', 1, 280.0, 420.0, 3, 4, 2, 320000, 320000, 'reserved', 300, 100, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room'], 
 '{"view": "sea", "furnished": true, "smart_home": false}'),
('AN-004', 'Villa', 1, 350.0, 500.0, 5, 6, 3, 450000, 450000, 'sold', 400, 100, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Gym', 'Study Room'], 
 '{"view": "sea", "furnished": true, "smart_home": true}'),
('AN-005', 'Villa', 1, 275.0, 410.0, 4, 4, 2, 300000, 300000, 'under_construction', 500, 100, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area'], 
 '{"view": "garden", "furnished": false, "smart_home": true}'),

-- Al Bareh Villas
('AB-001', 'Villa', 1, 320.0, 480.0, 4, 5, 2, 380000, 380000, 'available', 100, 200, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Terrace'], 
 '{"view": "sea", "furnished": false, "smart_home": true}'),
('AB-002', 'Villa', 1, 290.0, 440.0, 3, 4, 2, 340000, 340000, 'available', 200, 200, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room'], 
 '{"view": "garden", "furnished": false, "smart_home": false}'),
('AB-003', 'Villa', 1, 360.0, 520.0, 5, 6, 3, 480000, 480000, 'reserved', 300, 200, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Gym', 'Cinema Room'], 
 '{"view": "sea", "furnished": true, "smart_home": true}'),
('AB-004', 'Villa', 1, 275.0, 400.0, 3, 4, 2, 310000, 310000, 'available', 400, 200, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area'], 
 '{"view": "garden", "furnished": false, "smart_home": true}'),
('AB-005', 'Villa', 1, 310.0, 460.0, 4, 5, 2, 370000, 370000, 'sold', 500, 200, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Study Room'], 
 '{"view": "sea", "furnished": true, "smart_home": true}'),

-- Deerat Al Oyoun Villas
('DO-001', 'Villa', 1, 285.0, 430.0, 3, 4, 2, 325000, 325000, 'available', 100, 300, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area'], 
 '{"view": "lagoon", "furnished": false, "smart_home": true}'),
('DO-002', 'Villa', 1, 330.0, 490.0, 4, 5, 2, 395000, 395000, 'under_construction', 200, 300, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Gym'], 
 '{"view": "lagoon", "furnished": false, "smart_home": true}'),
('DO-003', 'Villa', 1, 305.0, 455.0, 4, 5, 2, 365000, 365000, 'available', 300, 300, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Terrace'], 
 '{"view": "garden", "furnished": false, "smart_home": false}'),
('DO-004', 'Villa', 1, 375.0, 550.0, 5, 6, 3, 520000, 520000, 'reserved', 400, 300, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Gym', 'Cinema Room', 'Study Room'], 
 '{"view": "lagoon", "furnished": true, "smart_home": true}'),
('DO-005', 'Villa', 1, 265.0, 390.0, 3, 3, 2, 295000, 295000, 'available', 500, 300, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room'], 
 '{"view": "garden", "furnished": false, "smart_home": true}'),

-- Al Noor & Al Sherooq Villas
('NS-001', 'Villa', 1, 295.0, 445.0, 4, 4, 2, 355000, 355000, 'available', 100, 400, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Balcony'], 
 '{"view": "marina", "furnished": false, "smart_home": true}'),
('NS-002', 'Villa', 1, 340.0, 500.0, 5, 5, 3, 425000, 425000, 'sold', 200, 400, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Gym', 'Study Room'], 
 '{"view": "marina", "furnished": true, "smart_home": true}'),
('NS-003', 'Villa', 1, 270.0, 410.0, 3, 4, 2, 315000, 315000, 'available', 300, 400, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area'], 
 '{"view": "garden", "furnished": false, "smart_home": false}'),
('NS-004', 'Villa', 1, 320.0, 475.0, 4, 5, 2, 385000, 385000, 'under_construction', 400, 400, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Terrace'], 
 '{"view": "marina", "furnished": false, "smart_home": true}'),
('NS-005', 'Villa', 1, 390.0, 580.0, 6, 7, 3, 580000, 580000, 'available', 500, 400, 
 ARRAY['Swimming Pool', 'Garden', 'Maid Room', 'BBQ Area', 'Gym', 'Cinema Room', 'Study Room', 'Guest Room'], 
 '{"view": "marina", "furnished": true, "smart_home": true}');

-- Insert default map layout
INSERT INTO map_layouts (project_id, layout_name, layout_type, dimensions, grid_settings, is_active) VALUES
(null, 'Default Villa Layout', 'grid', '{"width": 1200, "height": 600}', '{"rows": 4, "cols": 5, "spacing": 120}', true);

-- Create indexes for performance
CREATE INDEX idx_villa_units_status ON villa_units(status);
CREATE INDEX idx_villa_units_project ON villa_units(project_id);
CREATE INDEX idx_villa_units_position ON villa_units(position_x, position_y);
CREATE INDEX idx_map_registrations_villa ON map_quick_registrations(villa_unit_id);
CREATE INDEX idx_map_registrations_status ON map_quick_registrations(status);
CREATE INDEX idx_villa_interactions_villa ON villa_interactions(villa_unit_id);
CREATE INDEX idx_villa_interactions_user ON villa_interactions(user_id);
CREATE INDEX idx_villa_status_updates_villa ON villa_status_updates(villa_unit_id);;