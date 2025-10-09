-- Migration: expand_diyar_schema_comprehensive
-- Created at: 1759239202

-- Expand islands table with all 7 Diyar developments
INSERT INTO islands (name, description) VALUES 
('Al Naseem', 'Comprehensive villa project with multiple phases including waterfront properties starting from BD 199,000'),
('Al Bareh', 'Mixed villa and premium plot development with luxury finishes and modern amenities'),
('Deerat Al Oyoun', 'Premium villa community with exclusive waterfront access and private beaches'),
('Al Noor & Al Sherooq', 'Twin villa developments with family-oriented amenities and community facilities'),
('Jeewan', 'Contemporary villa development featuring modern architecture and smart home integration'),
('North Islands', 'Investment-focused development with rental potential and commercial opportunities'),
('Commercial District', 'Mixed-use commercial development with showrooms, warehouses, and business plots');

-- Expand projects table with realistic Diyar developments
INSERT INTO projects (island_id, name, project_type, status, description, completion_date, total_units, available_units) 
SELECT 
  i.id,
  CASE i.name 
    WHEN 'Al Naseem' THEN 'Al Naseem Villas Phase ' || (ROW_NUMBER() OVER (PARTITION BY i.name ORDER BY i.name))::text
    WHEN 'Al Bareh' THEN 'Al Bareh Premium Villas'
    WHEN 'Deerat Al Oyoun' THEN 'Deerat Al Oyoun Exclusive'
    WHEN 'Al Noor & Al Sherooq' THEN CASE WHEN ROW_NUMBER() OVER (PARTITION BY i.name ORDER BY i.name) = 1 THEN 'Al Noor Family Villas' ELSE 'Al Sherooq Garden Homes' END
    WHEN 'Jeewan' THEN 'Jeewan Contemporary'
    WHEN 'North Islands' THEN 'North Islands Investment Villas'
    WHEN 'Commercial District' THEN 'Commercial Plaza Development'
  END as name,
  CASE i.name 
    WHEN 'Commercial District' THEN 'commercial'
    ELSE 'residential'
  END as project_type,
  CASE i.name 
    WHEN 'Al Naseem' THEN 'active'
    WHEN 'Al Bareh' THEN 'active'
    WHEN 'Deerat Al Oyoun' THEN 'planning'
    WHEN 'Al Noor & Al Sherooq' THEN 'active'
    WHEN 'Jeewan' THEN 'construction'
    WHEN 'North Islands' THEN 'active'
    WHEN 'Commercial District' THEN 'planning'
  END as status,
  CASE i.name 
    WHEN 'Al Naseem' THEN 'Flagship residential development with family-oriented villas'
    WHEN 'Al Bareh' THEN 'Premium villas with luxury finishes and landscaping'
    WHEN 'Deerat Al Oyoun' THEN 'Exclusive waterfront villas with private beach access'
    WHEN 'Al Noor & Al Sherooq' THEN 'Community-focused development with shared amenities'
    WHEN 'Jeewan' THEN 'Modern architectural design with smart home features'
    WHEN 'North Islands' THEN 'Investment properties with high rental potential'
    WHEN 'Commercial District' THEN 'Mixed-use commercial development for businesses'
  END as description,
  CASE i.name 
    WHEN 'Al Naseem' THEN '2025-12-31'::date
    WHEN 'Al Bareh' THEN '2026-06-30'::date
    WHEN 'Deerat Al Oyoun' THEN '2026-12-31'::date
    WHEN 'Al Noor & Al Sherooq' THEN '2025-09-30'::date
    WHEN 'Jeewan' THEN '2026-03-31'::date
    WHEN 'North Islands' THEN '2025-12-31'::date
    WHEN 'Commercial District' THEN '2027-06-30'::date
  END as completion_date,
  CASE i.name 
    WHEN 'Al Naseem' THEN 45
    WHEN 'Al Bareh' THEN 30
    WHEN 'Deerat Al Oyoun' THEN 20
    WHEN 'Al Noor & Al Sherooq' THEN 35
    WHEN 'Jeewan' THEN 25
    WHEN 'North Islands' THEN 30
    WHEN 'Commercial District' THEN 40
  END as total_units,
  CASE i.name 
    WHEN 'Al Naseem' THEN 28
    WHEN 'Al Bareh' THEN 18
    WHEN 'Deerat Al Oyoun' THEN 15
    WHEN 'Al Noor & Al Sherooq' THEN 21
    WHEN 'Jeewan' THEN 22
    WHEN 'North Islands' THEN 19
    WHEN 'Commercial District' THEN 32
  END as available_units
FROM islands i
WHERE i.name IN ('Al Naseem', 'Al Bareh', 'Deerat Al Oyoun', 'Al Noor & Al Sherooq', 'Jeewan', 'North Islands', 'Commercial District');

-- Add missing columns to projects table if they don't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_units INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS available_units INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_date DATE;;