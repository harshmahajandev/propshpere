-- Migration: populate_diyar_projects_comprehensive_v2
-- Created at: 1759239267

-- Clear existing projects and populate with comprehensive Diyar developments
DELETE FROM projects;

-- Get island IDs for reference
WITH island_refs AS (
  SELECT id, name FROM islands
)
INSERT INTO projects (island_id, name, display_name, project_type, status, description, completion_date, total_units, completion_percentage) 
SELECT 
  i.id,
  CASE i.name 
    WHEN 'al_naseem' THEN 'al_naseem_phase_1'
    WHEN 'al_bareh' THEN 'al_bareh_premium'
    WHEN 'deerat_al_oyoun' THEN 'deerat_al_oyoun_exclusive'
    WHEN 'al_noor_al_sherooq' THEN 'al_noor_family'
    WHEN 'jeewan' THEN 'jeewan_contemporary'
    WHEN 'north_islands' THEN 'north_islands_investment'
    WHEN 'commercial_district' THEN 'commercial_plaza'
  END as name,
  CASE i.name 
    WHEN 'al_naseem' THEN 'Al Naseem Villas Phase 1'
    WHEN 'al_bareh' THEN 'Al Bareh Premium Villas'
    WHEN 'deerat_al_oyoun' THEN 'Deerat Al Oyoun Exclusive'
    WHEN 'al_noor_al_sherooq' THEN 'Al Noor Family Villas'
    WHEN 'jeewan' THEN 'Jeewan Contemporary'
    WHEN 'north_islands' THEN 'North Islands Investment Villas'
    WHEN 'commercial_district' THEN 'Commercial Plaza Development'
  END as display_name,
  CASE i.name 
    WHEN 'commercial_district' THEN 'commercial'
    ELSE 'residential'
  END as project_type,
  CASE i.name 
    WHEN 'al_naseem' THEN 'active'
    WHEN 'al_bareh' THEN 'active'
    WHEN 'deerat_al_oyoun' THEN 'planning'
    WHEN 'al_noor_al_sherooq' THEN 'active'
    WHEN 'jeewan' THEN 'construction'
    WHEN 'north_islands' THEN 'active'
    WHEN 'commercial_district' THEN 'planning'
  END as status,
  CASE i.name 
    WHEN 'al_naseem' THEN 'Flagship residential development with family-oriented villas and comprehensive amenities'
    WHEN 'al_bareh' THEN 'Premium villas with luxury finishes, landscaping, and modern amenities'
    WHEN 'deerat_al_oyoun' THEN 'Exclusive waterfront villas with private beach access and resort amenities'
    WHEN 'al_noor_al_sherooq' THEN 'Community-focused development with shared amenities and family facilities'
    WHEN 'jeewan' THEN 'Modern architectural design with smart home features and sustainable elements'
    WHEN 'north_islands' THEN 'Investment properties with high rental potential and strategic location'
    WHEN 'commercial_district' THEN 'Mixed-use commercial development for businesses, retail, and services'
  END as description,
  CASE i.name 
    WHEN 'al_naseem' THEN '2025-12-31'::date
    WHEN 'al_bareh' THEN '2026-06-30'::date
    WHEN 'deerat_al_oyoun' THEN '2026-12-31'::date
    WHEN 'al_noor_al_sherooq' THEN '2025-11-30'::date
    WHEN 'jeewan' THEN '2026-03-31'::date
    WHEN 'north_islands' THEN '2025-12-31'::date
    WHEN 'commercial_district' THEN '2027-06-30'::date
  END as completion_date,
  CASE i.name 
    WHEN 'al_naseem' THEN 45
    WHEN 'al_bareh' THEN 30
    WHEN 'deerat_al_oyoun' THEN 20
    WHEN 'al_noor_al_sherooq' THEN 35
    WHEN 'jeewan' THEN 25
    WHEN 'north_islands' THEN 30
    WHEN 'commercial_district' THEN 40
  END as total_units,
  CASE i.name 
    WHEN 'al_naseem' THEN 85.0
    WHEN 'al_bareh' THEN 65.0
    WHEN 'deerat_al_oyoun' THEN 15.0
    WHEN 'al_noor_al_sherooq' THEN 95.0
    WHEN 'jeewan' THEN 45.0
    WHEN 'north_islands' THEN 78.0
    WHEN 'commercial_district' THEN 5.0
  END as completion_percentage
FROM island_refs i;

-- Add second phase for Al Naseem
INSERT INTO projects (island_id, name, display_name, project_type, status, description, completion_date, total_units, completion_percentage)
SELECT 
  i.id,
  'al_naseem_phase_2',
  'Al Naseem Villas Phase 2',
  'residential',
  'construction',
  'Second phase of Al Naseem featuring enhanced villa designs and premium amenities',
  '2026-03-31'::date,
  35,
  25.0
FROM islands i WHERE i.name = 'al_naseem';

-- Add Al Sherooq as separate project
INSERT INTO projects (island_id, name, display_name, project_type, status, description, completion_date, total_units, completion_percentage)
SELECT 
  i.id,
  'al_sherooq_gardens',
  'Al Sherooq Garden Homes',
  'residential',
  'active',
  'Garden-focused villa development with landscaped outdoor spaces and community gardens',
  '2025-10-31'::date,
  28,
  88.0
FROM islands i WHERE i.name = 'al_noor_al_sherooq';;