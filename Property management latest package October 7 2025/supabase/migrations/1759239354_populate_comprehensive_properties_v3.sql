-- Migration: populate_comprehensive_properties_v3
-- Created at: 1759239354

-- Clear existing properties and populate with comprehensive villa data
DELETE FROM properties;

-- Al Naseem Phase 1 Properties (45 units) - Starting from BD 199,000
WITH property_data AS (
  SELECT 
    generate_series(1, 45) as unit_num,
    'Al Naseem Phase 1' as project_name
)
INSERT INTO properties (
  title, project, type, status, price, currency, size, 
  bedrooms, bathrooms, location, description, features, amenities,
  latitude, longitude, total_units, available_units
)
SELECT 
  'Villa V-AN1-' || LPAD(pd.unit_num::text, 3, '0'),
  pd.project_name,
  'villa',
  CASE 
    WHEN pd.unit_num <= 17 THEN 'sold'  -- 38% sold
    WHEN pd.unit_num <= 28 THEN 'available'  -- 24% available  
    WHEN pd.unit_num <= 35 THEN 'reserved'  -- 16% reserved
    ELSE 'maintenance'  -- 22% in preparation/maintenance
  END,
  CASE 
    WHEN pd.unit_num <= 15 THEN 199000 + (pd.unit_num % 5) * 8000  -- 199K-231K
    WHEN pd.unit_num <= 30 THEN 235000 + (pd.unit_num % 6) * 12000  -- 235K-295K
    ELSE 300000 + (pd.unit_num % 7) * 15000  -- 300K-390K
  END,
  'BHD',
  CASE 
    WHEN pd.unit_num <= 15 THEN 280 + (pd.unit_num % 3) * 20  -- 280-320 sqm
    WHEN pd.unit_num <= 30 THEN 320 + (pd.unit_num % 4) * 25  -- 320-395 sqm
    ELSE 400 + (pd.unit_num % 5) * 30  -- 400-520 sqm
  END,
  CASE 
    WHEN pd.unit_num <= 8 THEN 3
    WHEN pd.unit_num <= 25 THEN 4
    WHEN pd.unit_num <= 38 THEN 5
    ELSE 4
  END,
  CASE 
    WHEN pd.unit_num <= 8 THEN 2
    WHEN pd.unit_num <= 25 THEN 3
    WHEN pd.unit_num <= 38 THEN 4
    ELSE 3
  END,
  'Al Naseem, Diyar Al Muharraq',
  'Modern villa in the flagship Al Naseem development featuring family-oriented design with comprehensive amenities and waterfront proximity',
  ARRAY[
    'Modern Kitchen', 'Built-in Wardrobes', 'Ceramic Flooring', 'Central AC',
    CASE WHEN pd.unit_num % 3 = 0 THEN 'Garden View' ELSE 'Street View' END,
    CASE WHEN pd.unit_num % 4 = 0 THEN 'Private Garden' ELSE 'Balcony' END,
    CASE WHEN pd.unit_num > 30 THEN 'Luxury Finishes' ELSE 'Standard Finishes' END
  ],
  ARRAY[
    'Community Pool', 'Playground', 'Mosque', 'Shopping Center',
    'Security 24/7', 'Covered Parking', 'Landscaping',
    CASE WHEN pd.unit_num % 5 = 0 THEN 'Beach Access' ELSE 'Garden Access' END
  ],
  26.2540 + (pd.unit_num % 10) * 0.0001,  -- Slight variations in coordinates
  50.6480 + (pd.unit_num % 10) * 0.0001,
  1,
  CASE WHEN pd.unit_num <= 28 THEN 1 ELSE 0 END
FROM property_data pd;

-- Al Bareh Premium Villas (30 units)
WITH property_data AS (
  SELECT 
    generate_series(1, 30) as unit_num,
    'Al Bareh Premium Villas' as project_name
)
INSERT INTO properties (
  title, project, type, status, price, currency, size, 
  bedrooms, bathrooms, location, description, features, amenities,
  latitude, longitude, total_units, available_units
)
SELECT 
  'Villa V-AB-' || LPAD(pd.unit_num::text, 3, '0'),
  pd.project_name,
  'villa',
  CASE 
    WHEN pd.unit_num <= 12 THEN 'available'  -- 40% available
    WHEN pd.unit_num <= 18 THEN 'sold'  -- 20% sold
    WHEN pd.unit_num <= 24 THEN 'reserved'  -- 20% reserved
    ELSE 'maintenance'  -- 20% in preparation
  END,
  320000 + (pd.unit_num % 8) * 16000,  -- 320K-432K
  'BHD',
  350 + (pd.unit_num % 6) * 40,  -- 350-550 sqm
  CASE 
    WHEN pd.unit_num <= 10 THEN 4
    WHEN pd.unit_num <= 22 THEN 5
    ELSE 6
  END,
  CASE 
    WHEN pd.unit_num <= 10 THEN 3
    WHEN pd.unit_num <= 22 THEN 4
    ELSE 5
  END,
  'Al Bareh, Diyar Al Muharraq',
  'Premium villa in Al Bareh development featuring luxury finishes, landscaping, and exclusive amenities',
  ARRAY[
    'Premium Kitchen', 'Walk-in Wardrobes', 'Marble Flooring', 'Smart Home System',
    'Private Garden', 'Covered Parking', 'Luxury Finishes', 'Study Room',
    CASE WHEN pd.unit_num % 3 = 0 THEN 'Swimming Pool' ELSE 'Jacuzzi' END
  ],
  ARRAY[
    'Private Beach', 'Golf Course Access', 'Spa & Wellness', 'Fine Dining',
    'Concierge Service', 'Valet Parking', 'Tennis Court', 'Kids Club'
  ],
  26.2580 + (pd.unit_num % 8) * 0.0001,
  50.6520 + (pd.unit_num % 8) * 0.0001,
  1,
  CASE WHEN pd.unit_num <= 12 THEN 1 ELSE 0 END
FROM property_data pd;;