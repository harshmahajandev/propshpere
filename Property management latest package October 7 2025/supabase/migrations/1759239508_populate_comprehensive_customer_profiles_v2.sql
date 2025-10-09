-- Migration: populate_comprehensive_customer_profiles_v2
-- Created at: 1759239508

-- Clear existing customer profiles and populate with realistic Bahraini customer profiles
DELETE FROM profiles WHERE role IN ('customer', 'lead', 'prospect');

-- HNI (High Net Worth Individual) Customers - Net worth > BD 500K
INSERT INTO profiles (id, email, full_name, phone, role, company, nationality, customer_preferences, customer_requirements, risk_level, credit_score, created_at) VALUES
(gen_random_uuid(), 'ahmed.alkhalifa@royal.bh', 'Ahmed bin Rashid Al-Khalifa', '+973-3612-8901', 'customer', 'Royal Family Office', 'Bahraini', 
 '{"budget_range": "500000-1000000", "preferred_location": "Deerat Al Oyoun", "property_type": "luxury_villa", "bedrooms": 5, "special_requirements": ["private_beach", "waterfront", "exclusive_location"]}',
 'Royal family member seeking exclusive waterfront property with private beach access and complete privacy', 'low', 850, NOW() - INTERVAL '45 days'),

(gen_random_uuid(), 'fatima.alsabah@investment.com', 'Fatima Al-Zahra Al-Sabah', '+973-3698-7234', 'customer', 'Al-Sabah Investment Group', 'Kuwaiti',
 '{"budget_range": "400000-800000", "preferred_location": "Al Bareh", "property_type": "premium_villa", "bedrooms": 4, "investment_focus": true}',
 'Investment portfolio expansion, interested in premium properties with high appreciation potential', 'low', 820, NOW() - INTERVAL '38 days'),

(gen_random_uuid(), 'mohammed.alkhalidi@business.bh', 'Mohammed bin Sultan Al-Khalidi', '+973-3345-6789', 'customer', 'Al-Khalidi Business Group', 'Bahraini',
 '{"budget_range": "350000-650000", "preferred_location": "Al Naseem", "property_type": "waterfront_villa", "bedrooms": 4, "special_requirements": ["entertainment_area", "large_garden"]}',
 'Business owner looking for primary residence with entertainment facilities and networking spaces', 'low', 780, NOW() - INTERVAL '52 days'),

(gen_random_uuid(), 'sarah.almannai@wealth.bh', 'Sarah Abdullah Al-Mannai', '+973-3567-8901', 'customer', 'Mannai Wealth Management', 'Bahraini',
 '{"budget_range": "450000-750000", "preferred_location": "Deerat Al Oyoun", "property_type": "exclusive_villa", "bedrooms": 5, "lifestyle": "luxury"}',
 'Wealth management executive seeking prestigious address that reflects professional success', 'low', 795, NOW() - INTERVAL '28 days'),

(gen_random_uuid(), 'khalid.althani@group.qa', 'Khalid bin Hamad Al-Thani', '+973-3789-0123', 'customer', 'Al-Thani Holdings', 'Qatari',
 '{"budget_range": "500000-900000", "preferred_location": "Al Bareh", "property_type": "luxury_villa", "bedrooms": 5, "cross_border": true}',
 'Cross-GCC investment, interested in luxury properties for family residence and investment', 'low', 810, NOW() - INTERVAL '33 days'),

-- Investor Customers - Multiple properties or investment focus
(gen_random_uuid(), 'properties@bih.com.bh', 'Bahrain Investment Holdings', '+973-1723-4567', 'customer', 'Bahrain Investment Holdings', 'Corporate',
 '{"budget_range": "200000-400000", "preferred_location": "North Islands", "property_type": "investment_villa", "quantity": "multiple", "roi_focus": true}',
 'Real estate investment company focusing on rental portfolio expansion with high ROI', 'medium', 750, NOW() - INTERVAL '41 days'),

(gen_random_uuid(), 'ali.mahmoud@realestate.bh', 'Ali Hassan Al-Mahmoud', '+973-3234-5678', 'customer', 'Al-Mahmoud Properties', 'Bahraini',
 '{"budget_range": "180000-320000", "preferred_location": "Al Naseem", "property_type": "multiple_units", "existing_portfolio": 8}',
 'Real estate investor with existing portfolio of 8 properties, seeking to expand with additional units', 'low', 720, NOW() - INTERVAL '36 days'),

(gen_random_uuid(), 'invest@noorgroup.bh', 'Noor Investment Group', '+973-1634-7890', 'customer', 'Noor Investment Group', 'Corporate',
 '{"budget_range": "300000-600000", "preferred_location": "Multiple", "property_type": "commercial_residential", "diversified": true}',
 'Diversified investment group seeking both residential and commercial opportunities across all developments', 'medium', 780, NOW() - INTERVAL '29 days'),

(gen_random_uuid(), 'mariam.aldosari@properties.bh', 'Mariam bint Ali Al-Dosari', '+973-3445-6789', 'customer', 'Al-Dosari Real Estate', 'Bahraini',
 '{"budget_range": "220000-380000", "preferred_location": "Al Bareh", "property_type": "rental_property", "rental_focus": true}',
 'Individual investor building rental property portfolio with focus on consistent rental income', 'medium', 690, NOW() - INTERVAL '44 days'),

(gen_random_uuid(), 'development@gulfprops.com', 'Gulf Properties LLC', '+973-1745-8901', 'customer', 'Gulf Properties LLC', 'Corporate',
 '{"budget_range": "400000-800000", "preferred_location": "Commercial District", "property_type": "mixed_use", "development_focus": true}',
 'Regional property development company interested in commercial plots for mixed-use development', 'medium', 760, NOW() - INTERVAL '31 days');;