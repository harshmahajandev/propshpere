-- Migration: populate_comprehensive_properties
-- Created at: 1759239290

-- Clear existing properties and populate with comprehensive villa data
DELETE FROM properties;

-- Al Naseem Phase 1 Properties (45 units) - Starting from BD 199,000
WITH al_naseem_p1 AS (
  SELECT id FROM projects WHERE name = 'al_naseem_phase_1'
),
property_sequence AS (
  SELECT generate_series(1, 45) as unit_num
)
INSERT INTO properties (
  project_id, unit_number, property_type, size_sqm, price, 
  status, bedrooms, bathrooms, features, amenities
)
SELECT 
  p.id,
  'V-AN1-' || LPAD(ps.unit_num::text, 3, '0'),
  'villa',
  CASE 
    WHEN ps.unit_num <= 15 THEN 280 + (ps.unit_num % 3) * 20  -- 280-320 sqm
    WHEN ps.unit_num <= 30 THEN 320 + (ps.unit_num % 4) * 25  -- 320-395 sqm
    ELSE 400 + (ps.unit_num % 5) * 30  -- 400-520 sqm
  END,
  CASE 
    WHEN ps.unit_num <= 15 THEN 199000 + (ps.unit_num % 5) * 8000  -- 199K-231K
    WHEN ps.unit_num <= 30 THEN 235000 + (ps.unit_num % 6) * 12000  -- 235K-295K
    ELSE 300000 + (ps.unit_num % 7) * 15000  -- 300K-390K
  END,
  CASE 
    WHEN ps.unit_num <= 17 THEN 'sold'  -- 38% sold
    WHEN ps.unit_num <= 28 THEN 'available'  -- 24% available  
    WHEN ps.unit_num <= 35 THEN 'reserved'  -- 16% reserved
    ELSE 'under_construction'  -- 22% under construction
  END,
  CASE 
    WHEN ps.unit_num <= 8 THEN 3
    WHEN ps.unit_num <= 25 THEN 4
    WHEN ps.unit_num <= 38 THEN 5
    ELSE 4
  END,
  CASE 
    WHEN ps.unit_num <= 8 THEN 2
    WHEN ps.unit_num <= 25 THEN 3
    WHEN ps.unit_num <= 38 THEN 4
    ELSE 3
  END,
  ARRAY[
    'Modern Kitchen', 'Built-in Wardrobes', 'Ceramic Flooring', 'Central AC',
    CASE WHEN ps.unit_num % 3 = 0 THEN 'Garden View' ELSE 'Street View' END,
    CASE WHEN ps.unit_num % 4 = 0 THEN 'Private Garden' ELSE 'Balcony' END,
    CASE WHEN ps.unit_num > 30 THEN 'Luxury Finishes' ELSE 'Standard Finishes' END
  ],
  ARRAY[
    'Community Pool', 'Playground', 'Mosque', 'Shopping Center',
    'Security 24/7', 'Covered Parking', 'Landscaping',
    CASE WHEN ps.unit_num % 5 = 0 THEN 'Beach Access' ELSE 'Garden Access' END
  ]
FROM al_naseem_p1 p, property_sequence ps;

-- Al Bareh Premium Villas (30 units) - Premium pricing BD 320,000-450,000
WITH al_bareh AS (
  SELECT id FROM projects WHERE name = 'al_bareh_premium'
),
property_sequence AS (
  SELECT generate_series(1, 30) as unit_num
)
INSERT INTO properties (
  project_id, unit_number, property_type, size_sqm, price, 
  status, bedrooms, bathrooms, features, amenities
)
SELECT 
  p.id,
  'V-AB-' || LPAD(ps.unit_num::text, 3, '0'),
  'villa',
  350 + (ps.unit_num % 6) * 40,  -- 350-550 sqm
  320000 + (ps.unit_num % 8) * 16000,  -- 320K-432K
  CASE 
    WHEN ps.unit_num <= 12 THEN 'available'  -- 40% available
    WHEN ps.unit_num <= 18 THEN 'sold'  -- 20% sold
    WHEN ps.unit_num <= 24 THEN 'reserved'  -- 20% reserved
    ELSE 'under_construction'  -- 20% under construction
  END,
  CASE 
    WHEN ps.unit_num <= 10 THEN 4
    WHEN ps.unit_num <= 22 THEN 5
    ELSE 6
  END,
  CASE 
    WHEN ps.unit_num <= 10 THEN 3
    WHEN ps.unit_num <= 22 THEN 4
    ELSE 5
  END,
  ARRAY[
    'Premium Kitchen', 'Walk-in Wardrobes', 'Marble Flooring', 'Smart Home System',
    'Private Garden', 'Covered Parking', 'Luxury Finishes', 'Study Room',
    CASE WHEN ps.unit_num % 3 = 0 THEN 'Swimming Pool' ELSE 'Jacuzzi' END
  ],
  ARRAY[
    'Private Beach', 'Golf Course Access', 'Spa & Wellness', 'Fine Dining',
    'Concierge Service', 'Valet Parking', 'Tennis Court', 'Kids Club'
  ]
FROM al_bareh p, property_sequence ps;;