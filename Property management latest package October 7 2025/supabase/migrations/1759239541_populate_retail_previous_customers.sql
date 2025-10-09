-- Migration: populate_retail_previous_customers
-- Created at: 1759239541

-- Retail Customers - First-time buyers and families
INSERT INTO profiles (id, email, full_name, phone, role, company, nationality, customer_preferences, customer_requirements, risk_level, credit_score, created_at) VALUES
(gen_random_uuid(), 'omar.rashid@email.com', 'Omar Abdulla Al-Rashid', '+973-3567-1234', 'customer', 'Gulf Bank', 'Bahraini',
 '{"budget_range": "180000-250000", "preferred_location": "Al Naseem", "property_type": "family_villa", "bedrooms": 3, "first_time_buyer": true}',
 'Young professional, first-time buyer looking for family home with good value and financing options', 'medium', 650, NOW() - INTERVAL '22 days'),

(gen_random_uuid(), 'layla.kuwari@education.gov.bh', 'Layla Mohammed Al-Kuwari', '+973-3678-2345', 'customer', 'Ministry of Education', 'Bahraini',
 '{"budget_range": "200000-280000", "preferred_location": "Al Noor", "property_type": "family_villa", "bedrooms": 4, "school_proximity": true}',
 'Teacher seeking family villa near schools with good community amenities and family-friendly environment', 'low', 680, NOW() - INTERVAL '35 days'),

(gen_random_uuid(), 'hassan.mansoori@health.gov.bh', 'Hassan Ali Al-Mansoori', '+973-3789-3456', 'customer', 'Ministry of Health', 'Bahraini',
 '{"budget_range": "190000-240000", "preferred_location": "Al Naseem", "property_type": "3_bedroom_villa", "bedrooms": 3, "garden_required": true}',
 'Healthcare worker looking for first family home with garden space for children and proximity to amenities', 'low', 670, NOW() - INTERVAL '26 days'),

(gen_random_uuid(), 'aisha.binali@bank.bh', 'Aisha Khalil Al-Binali', '+973-3890-4567', 'customer', 'National Bank of Bahrain', 'Bahraini',
 '{"budget_range": "250000-320000", "preferred_location": "Jeewan", "property_type": "modern_villa", "bedrooms": 4, "smart_home": true}',
 'Bank employee interested in smart home features and modern design with technology integration', 'low', 710, NOW() - INTERVAL '19 days'),

(gen_random_uuid(), 'yousef.shaikh@oil.com.bh', 'Yousef Ahmad Al-Shaikh', '+973-3901-5678', 'customer', 'Bahrain Petroleum Company', 'Bahraini',
 '{"budget_range": "280000-350000", "preferred_location": "Al Bareh", "property_type": "family_villa", "bedrooms": 4, "upgrade_buyer": true}',
 'Oil company engineer seeking upgrade from apartment to villa with more space for growing family', 'low', 690, NOW() - INTERVAL '41 days'),

-- Previous Customers - Existing Diyar owners
(gen_random_uuid(), 'amina.alkhalifa@previous.bh', 'Amina bint Hamad Al-Khalifa', '+973-3123-4567', 'customer', 'Al-Khalifa Trading', 'Bahraini',
 '{"budget_range": "320000-450000", "preferred_location": "Al Bareh", "property_type": "upgrade_villa", "bedrooms": 5, "existing_owner": true, "current_property": "Al Naseem"}',
 'Current Al Naseem owner considering upgrade to larger premium villa with better amenities', 'low', 750, NOW() - INTERVAL '15 days'),

(gen_random_uuid(), 'rashid.mannai@existing.bh', 'Rashid bin Mohammed Al-Mannai', '+973-3234-6789', 'customer', 'Mannai Corporation', 'Bahraini',
 '{"budget_range": "450000-650000", "preferred_location": "Deerat Al Oyoun", "property_type": "luxury_upgrade", "bedrooms": 5, "existing_owner": true, "current_property": "Al Noor"}',
 'Al Noor resident looking to upgrade to exclusive waterfront villa with premium location', 'low', 770, NOW() - INTERVAL '21 days'),

(gen_random_uuid(), 'fatima.dosari@loyal.bh', 'Fatima Ali Al-Dosari', '+973-3345-7890', 'customer', 'Al-Dosari Industries', 'Bahraini',
 '{"budget_range": "240000-320000", "preferred_location": "Al Naseem", "property_type": "second_home", "bedrooms": 4, "existing_owner": true, "current_property": "Al Bareh"}',
 'Happy Al Bareh owner interested in Al Naseem villa as second home for extended family', 'low', 730, NOW() - INTERVAL '18 days'),

(gen_random_uuid(), 'abdullah.sabah@referral.bh', 'Abdullah Khalid Al-Sabah', '+973-3456-8901', 'customer', 'Al-Sabah Enterprises', 'Kuwaiti',
 '{"budget_range": "380000-520000", "preferred_location": "Al Bareh", "property_type": "investment_property", "bedrooms": 4, "existing_owner": true, "referral": true}',
 'Satisfied Al Naseem owner expanding portfolio with premium Al Bareh villa, referred by sales team', 'low', 800, NOW() - INTERVAL '39 days'),

(gen_random_uuid(), 'maryam.thani@repeat.bh', 'Maryam Hassan Al-Thani', '+973-3567-9012', 'customer', 'Al-Thani Real Estate', 'Qatari',
 '{"budget_range": "220000-300000", "preferred_location": "North Islands", "property_type": "rental_investment", "bedrooms": 3, "existing_owner": true, "repeat_customer": true}',
 'Repeat customer interested in investment property in North Islands for rental income generation', 'low', 760, NOW() - INTERVAL '12 days'),

-- Additional prospects and leads for pipeline
(gen_random_uuid(), 'ahmed.new@prospects.bh', 'Ahmed Mohammed Al-Baker', '+973-3111-2222', 'lead', 'Baker Trading Co.', 'Bahraini',
 '{"budget_range": "280000-380000", "preferred_location": "Al Naseem", "property_type": "family_villa", "bedrooms": 4, "new_inquiry": true}',
 'New inquiry from website, interested in family villa with modern amenities', 'medium', 680, NOW() - INTERVAL '3 days'),

(gen_random_uuid(), 'sara.prospect@leads.com', 'Sara Khalil Al-Zayani', '+973-3222-3333', 'lead', 'Zayani Group', 'Bahraini',
 '{"budget_range": "320000-450000", "preferred_location": "Al Bareh", "property_type": "premium_villa", "bedrooms": 5, "corporate_inquiry": true}',
 'Corporate executive interested in premium villa for senior management housing', 'low', 720, NOW() - INTERVAL '1 day'),

(gen_random_uuid(), 'khalid.hot@prospects.bh', 'Khalid Hassan Al-Mahmoud', '+973-3333-4444', 'prospect', 'Independent Investor', 'Bahraini',
 '{"budget_range": "200000-300000", "preferred_location": "North Islands", "property_type": "investment_villa", "bedrooms": 3, "hot_lead": true}',
 'Hot prospect ready to purchase investment villa, pre-qualified financing', 'low', 700, NOW() - INTERVAL '2 days');;