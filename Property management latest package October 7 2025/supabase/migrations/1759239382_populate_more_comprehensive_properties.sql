-- Migration: populate_more_comprehensive_properties
-- Created at: 1759239382

-- Al Noor Family Villas (35 units) - Family-oriented pricing BD 250,000-380,000
WITH property_data AS (
  SELECT 
    generate_series(1, 35) as unit_num,
    'Al Noor Family Villas' as project_name
)
INSERT INTO properties (
  title, project, type, status, price, currency, size, 
  bedrooms, bathrooms, location, description, features, amenities,
  latitude, longitude, total_units, available_units
)
SELECT 
  'Villa V-AN-' || LPAD(pd.unit_num::text, 3, '0'),
  pd.project_name,
  'villa',
  CASE 
    WHEN pd.unit_num <= 14 THEN 'available'  -- 40% available
    WHEN pd.unit_num <= 21 THEN 'sold'  -- 20% sold
    WHEN pd.unit_num <= 28 THEN 'reserved'  -- 20% reserved
    ELSE 'maintenance'  -- 20% in preparation
  END,
  250000 + (pd.unit_num % 9) * 14000,  -- 250K-362K
  'BHD',
  300 + (pd.unit_num % 5) * 35,  -- 300-440 sqm
  CASE 
    WHEN pd.unit_num <= 12 THEN 3
    WHEN pd.unit_num <= 28 THEN 4
    ELSE 5
  END,
  CASE 
    WHEN pd.unit_num <= 12 THEN 2
    WHEN pd.unit_num <= 28 THEN 3
    ELSE 4
  END,
  'Al Noor, Diyar Al Muharraq',
  'Family-oriented villa in Al Noor development with community amenities and shared facilities for neighborhood connectivity',
  ARRAY[
    'Family Kitchen', 'Built-in Storage', 'Tile Flooring', 'Split AC',
    'Family Garden', 'Play Area', 'Standard Finishes', 'Prayer Room',
    CASE WHEN pd.unit_num % 4 = 0 THEN 'Maid Room' ELSE 'Storage Room' END
  ],
  ARRAY[
    'Community Center', 'Children Playground', 'Mosque', 'School Nearby',
    'Family Pool', 'Sports Court', 'Walking Paths', 'Community Garden'
  ],
  26.2480 + (pd.unit_num % 7) * 0.0001,
  50.6440 + (pd.unit_num % 7) * 0.0001,
  1,
  CASE WHEN pd.unit_num <= 14 THEN 1 ELSE 0 END
FROM property_data pd;

-- Jeewan Contemporary Villas (25 units) - Modern design BD 280,000-420,000
WITH property_data AS (
  SELECT 
    generate_series(1, 25) as unit_num,
    'Jeewan Contemporary' as project_name
)
INSERT INTO properties (
  title, project, type, status, price, currency, size, 
  bedrooms, bathrooms, location, description, features, amenities,
  latitude, longitude, total_units, available_units
)
SELECT 
  'Villa V-JW-' || LPAD(pd.unit_num::text, 3, '0'),
  pd.project_name,
  'villa',
  CASE 
    WHEN pd.unit_num <= 10 THEN 'available'  -- 40% available
    WHEN pd.unit_num <= 15 THEN 'reserved'  -- 20% reserved
    WHEN pd.unit_num <= 20 THEN 'sold'  -- 20% sold
    ELSE 'maintenance'  -- 20% under construction/maintenance
  END,
  280000 + (pd.unit_num % 7) * 20000,  -- 280K-400K
  'BHD',
  320 + (pd.unit_num % 6) * 45,  -- 320-545 sqm
  CASE 
    WHEN pd.unit_num <= 8 THEN 3
    WHEN pd.unit_num <= 18 THEN 4
    ELSE 5
  END,
  CASE 
    WHEN pd.unit_num <= 8 THEN 2
    WHEN pd.unit_num <= 18 THEN 3
    ELSE 4
  END,
  'Jeewan, Diyar Al Muharraq',
  'Contemporary villa with cutting-edge architecture, smart home integration, and sustainable design principles',
  ARRAY[
    'Smart Kitchen', 'Home Automation', 'Premium Flooring', 'Smart AC',
    'Rooftop Terrace', 'Solar Panels', 'Modern Finishes', 'Tech Room',
    CASE WHEN pd.unit_num % 3 = 0 THEN 'Electric Car Charging' ELSE 'Smart Garage' END
  ],
  ARRAY[
    'Innovation Hub', 'Tech Center', 'Eco Park', 'Sustainability Center',
    'Smart Community', 'Fiber Internet', 'Green Building', 'Future Living'
  ],
  26.2520 + (pd.unit_num % 5) * 0.0001,
  50.6400 + (pd.unit_num % 5) * 0.0001,
  1,
  CASE WHEN pd.unit_num <= 10 THEN 1 ELSE 0 END
FROM property_data pd;

-- North Islands Investment Villas (30 units) - Investment focus BD 200,000-350,000
WITH property_data AS (
  SELECT 
    generate_series(1, 30) as unit_num,
    'North Islands Investment Villas' as project_name
)
INSERT INTO properties (
  title, project, type, status, price, currency, size, 
  bedrooms, bathrooms, location, description, features, amenities,
  latitude, longitude, total_units, available_units
)
SELECT 
  'Villa V-NI-' || LPAD(pd.unit_num::text, 3, '0'),
  pd.project_name,
  'villa',
  CASE 
    WHEN pd.unit_num <= 12 THEN 'available'  -- 40% available
    WHEN pd.unit_num <= 18 THEN 'sold'  -- 20% sold
    WHEN pd.unit_num <= 24 THEN 'reserved'  -- 20% reserved
    ELSE 'maintenance'  -- 20% in preparation
  END,
  200000 + (pd.unit_num % 10) * 15000,  -- 200K-335K
  'BHD',
  280 + (pd.unit_num % 4) * 40,  -- 280-400 sqm
  CASE 
    WHEN pd.unit_num <= 10 THEN 3
    WHEN pd.unit_num <= 22 THEN 4
    ELSE 5
  END,
  CASE 
    WHEN pd.unit_num <= 10 THEN 2
    WHEN pd.unit_num <= 22 THEN 3
    ELSE 4
  END,
  'North Islands, Diyar Al Muharraq',
  'Investment-focused villa with high rental potential and strategic location for property investors seeking steady returns',
  ARRAY[
    'Rental-Ready', 'Furnished Option', 'Standard Kitchen', 'Central AC',
    'Investment Grade', 'Tenant-Friendly', 'Low Maintenance', 'Rental Management',
    CASE WHEN pd.unit_num % 5 = 0 THEN 'Furnished Package' ELSE 'Unfurnished' END
  ],
  ARRAY[
    'Property Management', 'Rental Support', 'Investment Services', 'Tenant Services',
    'Maintenance Support', 'Rental Guarantee', 'ROI Optimization', 'Market Analysis'
  ],
  26.2660 + (pd.unit_num % 6) * 0.0001,
  50.6600 + (pd.unit_num % 6) * 0.0001,
  1,
  CASE WHEN pd.unit_num <= 12 THEN 1 ELSE 0 END
FROM property_data pd;;