-- Migration: populate_comprehensive_customers
-- Created at: 1759239418

-- Clear existing customers and populate with realistic Bahraini customer profiles
DELETE FROM customers;

-- HNI (High Net Worth Individual) Customers - Net worth > BD 500K
INSERT INTO customers (full_name, cpr_number, email, phone, nationality, segment, budget_range, preferred_location, property_type_interest, notes, created_at) VALUES
('Ahmed bin Rashid Al-Khalifa', '850312****', 'ahmed.alkhalifa@royal.bh', '+973-3612-8901', 'Bahraini', 'HNI', 'high', 'Deerat Al Oyoun', 'luxury_villa', 'Royal family member seeking exclusive waterfront property with private beach access', NOW() - INTERVAL '45 days'),
('Fatima Al-Zahra Al-Sabah', '780925****', 'fatima.alsabah@investment.com', '+973-3698-7234', 'Kuwaiti', 'HNI', 'high', 'Al Bareh', 'premium_villa', 'Investment portfolio expansion, interested in premium properties with high appreciation potential', NOW() - INTERVAL '38 days'),
('Mohammed bin Sultan Al-Khalidi', '820418****', 'mohammed.alkhalidi@business.bh', '+973-3345-6789', 'Bahraini', 'HNI', 'high', 'Al Naseem', 'waterfront_villa', 'Business owner looking for primary residence with entertainment facilities', NOW() - INTERVAL '52 days'),
('Sarah Abdullah Al-Mannai', '751203****', 'sarah.almannai@wealth.bh', '+973-3567-8901', 'Bahraini', 'HNI', 'high', 'Deerat Al Oyoun', 'exclusive_villa', 'Wealth management executive seeking prestigious address', NOW() - INTERVAL '28 days'),
('Khalid bin Hamad Al-Thani', '830717****', 'khalid.althani@group.qa', '+973-3789-0123', 'Qatari', 'HNI', 'high', 'Al Bareh', 'luxury_villa', 'Cross-GCC investment, interested in luxury properties for family residence', NOW() - INTERVAL '33 days'),

-- Investor Customers - Multiple properties or investment focus
('Bahrain Investment Holdings', '123456****', 'properties@bih.com.bh', '+973-1723-4567', 'Corporate', 'Investor', 'medium_high', 'North Islands', 'investment_villa', 'Real estate investment company focusing on rental portfolio expansion', NOW() - INTERVAL '41 days'),
('Ali Hassan Al-Mahmoud', '770503****', 'ali.mahmoud@realestate.bh', '+973-3234-5678', 'Bahraini', 'Investor', 'medium', 'Al Naseem', 'multiple_units', 'Real estate investor with existing portfolio of 8 properties', NOW() - INTERVAL '36 days'),
('Noor Investment Group', '234567****', 'invest@noorgroup.bh', '+973-1634-7890', 'Corporate', 'Investor', 'high', 'Multiple', 'commercial_residential', 'Diversified investment group seeking both residential and commercial opportunities', NOW() - INTERVAL '29 days'),
('Mariam bint Ali Al-Dosari', '810622****', 'mariam.aldosari@properties.bh', '+973-3445-6789', 'Bahraini', 'Investor', 'medium', 'Al Bareh', 'rental_property', 'Individual investor building rental property portfolio', NOW() - INTERVAL '44 days'),
('Gulf Properties LLC', '345678****', 'development@gulfprops.com', '+973-1745-8901', 'Corporate', 'Investor', 'high', 'Commercial District', 'mixed_use', 'Regional property development company interested in commercial plots', NOW() - INTERVAL '31 days'),

-- Retail Customers - First-time buyers and families
('Omar Abdulla Al-Rashid', '850917****', 'omar.rashid@email.com', '+973-3567-1234', 'Bahraini', 'Retail', 'low_medium', 'Al Naseem', 'family_villa', 'Young professional, first-time buyer looking for family home', NOW() - INTERVAL '22 days'),
('Layla Mohammed Al-Kuwari', '790812****', 'layla.kuwari@education.gov.bh', '+973-3678-2345', 'Bahraini', 'Retail', 'medium', 'Al Noor', 'family_villa', 'Teacher seeking family villa near schools with good community amenities', NOW() - INTERVAL '35 days'),
('Hassan Ali Al-Mansoori', '820305****', 'hassan.mansoori@health.gov.bh', '+973-3789-3456', 'Bahraini', 'Retail', 'low_medium', 'Al Naseem', '3_bedroom_villa', 'Healthcare worker looking for first family home with garden', NOW() - INTERVAL '26 days'),
('Aisha Khalil Al-Binali', '880124****', 'aisha.binali@bank.bh', '+973-3890-4567', 'Bahraini', 'Retail', 'medium', 'Jeewan', 'modern_villa', 'Bank employee interested in smart home features and modern design', NOW() - INTERVAL '19 days'),
('Yousef Ahmad Al-Shaikh', '750406****', 'yousef.shaikh@oil.com.bh', '+973-3901-5678', 'Bahraini', 'Retail', 'medium', 'Al Bareh', 'family_villa', 'Oil company engineer seeking upgrade from apartment to villa', NOW() - INTERVAL '41 days'),

-- Previous Customers - Existing Diyar owners
('Amina bint Hamad Al-Khalifa', '740213****', 'amina.alkhalifa@previous.bh', '+973-3123-4567', 'Bahraini', 'Previous', 'medium_high', 'Al Bareh', 'upgrade_villa', 'Current Al Naseem owner considering upgrade to larger premium villa', NOW() - INTERVAL '15 days'),
('Rashid bin Mohammed Al-Mannai', '760829****', 'rashid.mannai@existing.bh', '+973-3234-6789', 'Bahraini', 'Previous', 'high', 'Deerat Al Oyoun', 'luxury_upgrade', 'Al Noor resident looking to upgrade to exclusive waterfront villa', NOW() - INTERVAL '21 days'),
('Fatima Ali Al-Dosari', '821115****', 'fatima.dosari@loyal.bh', '+973-3345-7890', 'Bahraini', 'Previous', 'medium', 'Al Naseem', 'second_home', 'Happy Al Bareh owner interested in Al Naseem villa as second home', NOW() - INTERVAL '18 days'),
('Abdullah Khalid Al-Sabah', '690507****', 'abdullah.sabah@referral.bh', '+973-3456-8901', 'Kuwaiti', 'Previous', 'high', 'Al Bareh', 'investment_property', 'Satisfied Al Naseem owner expanding portfolio with premium Al Bareh villa', NOW() - INTERVAL '39 days'),
('Maryam Hassan Al-Thani', '831208****', 'maryam.thani@repeat.bh', '+973-3567-9012', 'Qatari', 'Previous', 'medium_high', 'North Islands', 'rental_investment', 'Repeat customer interested in investment property in North Islands', NOW() - INTERVAL '12 days');;