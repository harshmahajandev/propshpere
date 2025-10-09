-- Migration: populate_comprehensive_customer_profiles
-- Created at: 1759239479

-- Clear existing profiles and populate with realistic Bahraini customer profiles
DELETE FROM profiles WHERE role IN ('customer', 'lead', 'prospect');

-- HNI (High Net Worth Individual) Customers - Net worth > BD 500K
INSERT INTO profiles (email, full_name, phone, role, company, nationality, customer_preferences, customer_requirements, risk_level, credit_score, created_at) VALUES
('ahmed.alkhalifa@royal.bh', 'Ahmed bin Rashid Al-Khalifa', '+973-3612-8901', 'customer', 'Royal Family Office', 'Bahraini', 
 '{"budget_range": "500000-1000000", "preferred_location": "Deerat Al Oyoun", "property_type": "luxury_villa", "bedrooms": 5, "special_requirements": ["private_beach", "waterfront", "exclusive_location"]}',
 'Royal family member seeking exclusive waterfront property with private beach access and complete privacy', 'low', 850, NOW() - INTERVAL '45 days'),

('fatima.alsabah@investment.com', 'Fatima Al-Zahra Al-Sabah', '+973-3698-7234', 'customer', 'Al-Sabah Investment Group', 'Kuwaiti',
 '{"budget_range": "400000-800000", "preferred_location": "Al Bareh", "property_type": "premium_villa", "bedrooms": 4, "investment_focus": true}',
 'Investment portfolio expansion, interested in premium properties with high appreciation potential', 'low', 820, NOW() - INTERVAL '38 days'),

('mohammed.alkhalidi@business.bh', 'Mohammed bin Sultan Al-Khalidi', '+973-3345-6789', 'customer', 'Al-Khalidi Business Group', 'Bahraini',
 '{"budget_range": "350000-650000", "preferred_location": "Al Naseem", "property_type": "waterfront_villa", "bedrooms": 4, "special_requirements": ["entertainment_area", "large_garden"]}',
 'Business owner looking for primary residence with entertainment facilities and networking spaces', 'low', 780, NOW() - INTERVAL '52 days'),

('sarah.almannai@wealth.bh', 'Sarah Abdullah Al-Mannai', '+973-3567-8901', 'customer', 'Mannai Wealth Management', 'Bahraini',
 '{"budget_range": "450000-750000", "preferred_location": "Deerat Al Oyoun", "property_type": "exclusive_villa", "bedrooms": 5, "lifestyle": "luxury"}',
 'Wealth management executive seeking prestigious address that reflects professional success', 'low', 795, NOW() - INTERVAL '28 days'),

('khalid.althani@group.qa', 'Khalid bin Hamad Al-Thani', '+973-3789-0123', 'customer', 'Al-Thani Holdings', 'Qatari',
 '{"budget_range": "500000-900000", "preferred_location": "Al Bareh", "property_type": "luxury_villa", "bedrooms": 5, "cross_border": true}',
 'Cross-GCC investment, interested in luxury properties for family residence and investment', 'low', 810, NOW() - INTERVAL '33 days'),

-- Investor Customers - Multiple properties or investment focus
('properties@bih.com.bh', 'Bahrain Investment Holdings', '+973-1723-4567', 'customer', 'Bahrain Investment Holdings', 'Corporate',
 '{"budget_range": "200000-400000", "preferred_location": "North Islands", "property_type": "investment_villa", "quantity": "multiple", "roi_focus": true}',
 'Real estate investment company focusing on rental portfolio expansion with high ROI', 'medium', 750, NOW() - INTERVAL '41 days'),

('ali.mahmoud@realestate.bh', 'Ali Hassan Al-Mahmoud', '+973-3234-5678', 'customer', 'Al-Mahmoud Properties', 'Bahraini',
 '{"budget_range": "180000-320000", "preferred_location": "Al Naseem", "property_type": "multiple_units", "existing_portfolio": 8}',
 'Real estate investor with existing portfolio of 8 properties, seeking to expand with additional units', 'low', 720, NOW() - INTERVAL '36 days'),

('invest@noorgroup.bh', 'Noor Investment Group', '+973-1634-7890', 'customer', 'Noor Investment Group', 'Corporate',
 '{"budget_range": "300000-600000", "preferred_location": "Multiple", "property_type": "commercial_residential", "diversified": true}',
 'Diversified investment group seeking both residential and commercial opportunities across all developments', 'medium', 780, NOW() - INTERVAL '29 days'),

('mariam.aldosari@properties.bh', 'Mariam bint Ali Al-Dosari', '+973-3445-6789', 'customer', 'Al-Dosari Real Estate', 'Bahraini',
 '{"budget_range": "220000-380000", "preferred_location": "Al Bareh", "property_type": "rental_property", "rental_focus": true}',
 'Individual investor building rental property portfolio with focus on consistent rental income', 'medium', 690, NOW() - INTERVAL '44 days'),

('development@gulfprops.com', 'Gulf Properties LLC', '+973-1745-8901', 'customer', 'Gulf Properties LLC', 'Corporate',
 '{"budget_range": "400000-800000", "preferred_location": "Commercial District", "property_type": "mixed_use", "development_focus": true}',
 'Regional property development company interested in commercial plots for mixed-use development', 'medium', 760, NOW() - INTERVAL '31 days');

-- Retail Customers - First-time buyers and families
INSERT INTO profiles (email, full_name, phone, role, company, nationality, customer_preferences, customer_requirements, risk_level, credit_score, created_at) VALUES
('omar.rashid@email.com', 'Omar Abdulla Al-Rashid', '+973-3567-1234', 'customer', 'Gulf Bank', 'Bahraini',
 '{"budget_range": "180000-250000", "preferred_location": "Al Naseem", "property_type": "family_villa", "bedrooms": 3, "first_time_buyer": true}',
 'Young professional, first-time buyer looking for family home with good value and financing options', 'medium', 650, NOW() - INTERVAL '22 days'),

('layla.kuwari@education.gov.bh', 'Layla Mohammed Al-Kuwari', '+973-3678-2345', 'customer', 'Ministry of Education', 'Bahraini',
 '{"budget_range": "200000-280000", "preferred_location": "Al Noor", "property_type": "family_villa", "bedrooms": 4, "school_proximity": true}',
 'Teacher seeking family villa near schools with good community amenities and family-friendly environment', 'low', 680, NOW() - INTERVAL '35 days'),

('hassan.mansoori@health.gov.bh', 'Hassan Ali Al-Mansoori', '+973-3789-3456', 'customer', 'Ministry of Health', 'Bahraini',
 '{"budget_range": "190000-240000", "preferred_location": "Al Naseem", "property_type": "3_bedroom_villa", "bedrooms": 3, "garden_required": true}',
 'Healthcare worker looking for first family home with garden space for children and proximity to amenities', 'low', 670, NOW() - INTERVAL '26 days'),

('aisha.binali@bank.bh', 'Aisha Khalil Al-Binali', '+973-3890-4567', 'customer', 'National Bank of Bahrain', 'Bahraini',
 '{"budget_range": "250000-320000", "preferred_location": "Jeewan", "property_type": "modern_villa", "bedrooms": 4, "smart_home": true}',
 'Bank employee interested in smart home features and modern design with technology integration', 'low', 710, NOW() - INTERVAL '19 days'),

('yousef.shaikh@oil.com.bh', 'Yousef Ahmad Al-Shaikh', '+973-3901-5678', 'customer', 'Bahrain Petroleum Company', 'Bahraini',
 '{"budget_range": "280000-350000", "preferred_location": "Al Bareh", "property_type": "family_villa", "bedrooms": 4, "upgrade_buyer": true}',
 'Oil company engineer seeking upgrade from apartment to villa with more space for growing family', 'low', 690, NOW() - INTERVAL '41 days'),

-- Previous Customers - Existing Diyar owners
('amina.alkhalifa@previous.bh', 'Amina bint Hamad Al-Khalifa', '+973-3123-4567', 'customer', 'Al-Khalifa Trading', 'Bahraini',
 '{"budget_range": "320000-450000", "preferred_location": "Al Bareh", "property_type": "upgrade_villa", "bedrooms": 5, "existing_owner": true, "current_property": "Al Naseem"}',
 'Current Al Naseem owner considering upgrade to larger premium villa with better amenities', 'low', 750, NOW() - INTERVAL '15 days'),

('rashid.mannai@existing.bh', 'Rashid bin Mohammed Al-Mannai', '+973-3234-6789', 'customer', 'Mannai Corporation', 'Bahraini',
 '{"budget_range": "450000-650000", "preferred_location": "Deerat Al Oyoun", "property_type": "luxury_upgrade", "bedrooms": 5, "existing_owner": true, "current_property": "Al Noor"}',
 'Al Noor resident looking to upgrade to exclusive waterfront villa with premium location', 'low', 770, NOW() - INTERVAL '21 days'),

('fatima.dosari@loyal.bh', 'Fatima Ali Al-Dosari', '+973-3345-7890', 'customer', 'Al-Dosari Industries', 'Bahraini',
 '{"budget_range": "240000-320000", "preferred_location": "Al Naseem", "property_type": "second_home", "bedrooms": 4, "existing_owner": true, "current_property": "Al Bareh"}',
 'Happy Al Bareh owner interested in Al Naseem villa as second home for extended family', 'low', 730, NOW() - INTERVAL '18 days'),

('abdullah.sabah@referral.bh', 'Abdullah Khalid Al-Sabah', '+973-3456-8901', 'customer', 'Al-Sabah Enterprises', 'Kuwaiti',
 '{"budget_range": "380000-520000", "preferred_location": "Al Bareh", "property_type": "investment_property", "bedrooms": 4, "existing_owner": true, "referral": true}',
 'Satisfied Al Naseem owner expanding portfolio with premium Al Bareh villa, referred by sales team', 'low', 800, NOW() - INTERVAL '39 days'),

('maryam.thani@repeat.bh', 'Maryam Hassan Al-Thani', '+973-3567-9012', 'customer', 'Al-Thani Real Estate', 'Qatari',
 '{"budget_range": "220000-300000", "preferred_location": "North Islands", "property_type": "rental_investment", "bedrooms": 3, "existing_owner": true, "repeat_customer": true}',
 'Repeat customer interested in investment property in North Islands for rental income generation', 'low', 760, NOW() - INTERVAL '12 days');;