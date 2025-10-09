-- Migration: populate_leads_sales_pipeline_v3
-- Created at: 1759239688

-- Clear existing leads and populate comprehensive sales pipeline
DELETE FROM leads;

-- Populate leads with realistic Bahraini lead data using correct constraint values
INSERT INTO leads (
  first_name, last_name, email, phone, preferred_language, buyer_type,
  budget_min, budget_max, currency, property_interests, timeline, status,
  score, source, notes, activities, ai_insights, created_at
) VALUES
-- Hot leads (new)
('Ahmed', 'Al-Baker', 'ahmed.baker@newleads.bh', '+973-3111-2222', 'English', 'retail', 280000, 380000, 'BHD', 
 ARRAY['Al Naseem', 'Family Villa', '4 Bedroom'], '1-3_months', 'new', 85,
 'website', ARRAY['New inquiry from website', 'Interested in family villa'], 
 '[{"date": "2025-09-28", "type": "web_inquiry", "details": "Submitted detailed inquiry form"}]'::jsonb,
 '{"match_score": 85, "interests": ["family_oriented", "modern_amenities"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '2 days'),

('Sara', 'Al-Zayani', 'sara.zayani@corporateleads.bh', '+973-3222-3333', 'English', 'commercial', 320000, 450000, 'BHD',
 ARRAY['Al Bareh', 'Premium Villa', '5 Bedroom'], '3-6_months', 'new', 90,
 'corporate_referral', ARRAY['Corporate housing request', 'Executive level accommodation'],
 '[{"date": "2025-09-29", "type": "referral", "details": "Corporate HR department referral"}]'::jsonb,
 '{"match_score": 90, "interests": ["luxury", "corporate_housing"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '1 day'),

('Khalid', 'Al-Mahmoud', 'khalid.mahmoud@investors.bh', '+973-3333-4444', 'Arabic', 'investor', 200000, 300000, 'BHD',
 ARRAY['North Islands', 'Investment Villa', '3 Bedroom'], '1-3_months', 'new', 88,
 'direct_visit', ARRAY['Hot prospect', 'Pre-qualified financing', 'Ready to purchase'],
 '[{"date": "2025-09-27", "type": "showroom_visit", "details": "Visited showroom, very interested"}]'::jsonb,
 '{"match_score": 88, "interests": ["investment", "roi_focused"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '3 days'),

('Noor', 'Al-Rashid', 'noor.rashid@newleads.bh', '+973-3444-5555', 'Arabic', 'retail', 195000, 250000, 'BHD',
 ARRAY['Al Naseem', 'Family Villa', '3 Bedroom'], '1-3_months', 'new', 75,
 'social_media', ARRAY['Facebook inquiry', 'Young family seeking first home'],
 '[{"date": "2025-09-26", "type": "social_inquiry", "details": "Contacted via Facebook page"}]'::jsonb,
 '{"match_score": 75, "interests": ["first_time_buyer", "family"], "risk_level": "medium"}'::jsonb, NOW() - INTERVAL '4 days'),

-- Contacted leads
('Mariam', 'Al-Kuwari', 'mariam.kuwari@contacted.bh', '+973-3555-6666', 'Arabic', 'retail', 250000, 350000, 'BHD',
 ARRAY['Al Noor', 'Family Villa', '4 Bedroom'], '3-6_months', 'contacted', 75,
 'social_media', ARRAY['First contact made', 'Scheduled follow-up call'],
 '[{"date": "2025-09-25", "type": "first_call", "details": "Initial contact, showed interest"}]'::jsonb,
 '{"match_score": 75, "interests": ["family_friendly", "community"], "risk_level": "medium"}'::jsonb, NOW() - INTERVAL '5 days'),

('Hassan', 'Al-Mannai', 'hassan.mannai@contacted.bh', '+973-3666-7777', 'English', 'retail', 300000, 400000, 'BHD',
 ARRAY['Jeewan', 'Modern Villa', '4 Bedroom'], '3-6_months', 'contacted', 70,
 'exhibition', ARRAY['Met at property exhibition', 'Interested in smart home features'],
 '[{"date": "2025-09-24", "type": "exhibition_meeting", "details": "Met at Bahrain Property Expo"}]'::jsonb,
 '{"match_score": 70, "interests": ["modern_design", "smart_home"], "risk_level": "medium"}'::jsonb, NOW() - INTERVAL '6 days'),

('Layla', 'Al-Thani', 'layla.thani@contacted.bh', '+973-3777-8888', 'English', 'hni', 400000, 600000, 'BHD',
 ARRAY['Al Bareh', 'Luxury Villa', '5 Bedroom'], '1-3_months', 'contacted', 85,
 'referral', ARRAY['High net worth contact', 'Seeking premium location'],
 '[{"date": "2025-09-23", "type": "vip_contact", "details": "VIP referral, premium requirements"}]'::jsonb,
 '{"match_score": 85, "interests": ["luxury", "status"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '7 days'),

-- Qualified leads
('Fatima', 'Al-Dosari', 'fatima.dosari@qualified.bh', '+973-3888-9999', 'Arabic', 'hni', 350000, 500000, 'BHD',
 ARRAY['Al Bareh', 'Premium Villa', '5 Bedroom'], '1-3_months', 'qualified', 95,
 'referral', ARRAY['Existing customer upgrade', 'High qualification score'],
 '[{"date": "2025-09-20", "type": "qualification", "details": "Fully qualified, financial approval obtained"}]'::jsonb,
 '{"match_score": 95, "interests": ["upgrade", "luxury"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '10 days'),

('Abdullah', 'Al-Sabah', 'abdullah.sabah@qualified.bh', '+973-3999-0000', 'English', 'hni', 500000, 800000, 'BHD',
 ARRAY['Deerat Al Oyoun', 'Luxury Villa', '6 Bedroom'], '1-3_months', 'qualified', 92,
 'direct_referral', ARRAY['High net worth individual', 'Seeking exclusive property'],
 '[{"date": "2025-09-18", "type": "vip_meeting", "details": "VIP customer meeting, exclusive viewing arranged"}]'::jsonb,
 '{"match_score": 92, "interests": ["exclusive", "waterfront"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '12 days'),

('Omar', 'Al-Rashid', 'omar.rashid@qualified.bh', '+973-3000-1111', 'English', 'retail', 220000, 280000, 'BHD',
 ARRAY['Al Naseem', 'Family Villa', '3 Bedroom'], 'immediate', 'qualified', 80,
 'website', ARRAY['Qualified buyer', 'Ready for viewing'],
 '[{"date": "2025-09-17", "type": "qualification", "details": "Financial pre-approval completed"}]'::jsonb,
 '{"match_score": 80, "interests": ["first_time_buyer", "immediate"], "risk_level": "medium"}'::jsonb, NOW() - INTERVAL '13 days'),

-- Viewing stage
('Aisha', 'Al-Binali', 'aisha.binali@viewing.bh', '+973-3111-2222', 'Arabic', 'retail', 280000, 380000, 'BHD',
 ARRAY['Jeewan', 'Modern Villa', '4 Bedroom'], 'immediate', 'viewing', 78,
 'phone_inquiry', ARRAY['Site visit scheduled', 'Very interested in smart features'],
 '[{"date": "2025-09-15", "type": "site_visit", "details": "Scheduled villa viewing for this weekend"}]'::jsonb,
 '{"match_score": 78, "interests": ["professional", "modern"], "risk_level": "medium"}'::jsonb, NOW() - INTERVAL '15 days'),

('Mohammed', 'Al-Khalifi', 'mohammed.khalifi@viewing.bh', '+973-3222-3333', 'English', 'investor', 180000, 280000, 'BHD',
 ARRAY['North Islands', 'Investment Villa', '3 Bedroom'], 'immediate', 'viewing', 82,
 'exhibition', ARRAY['Multiple unit viewing', 'Investment portfolio expansion'],
 '[{"date": "2025-09-14", "type": "portfolio_viewing", "details": "Viewing multiple investment properties"}]'::jsonb,
 '{"match_score": 82, "interests": ["investment", "multiple_units"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '16 days'),

-- Negotiating stage
('Yousef', 'Al-Shaikh', 'yousef.shaikh@negotiation.bh', '+973-3333-4444', 'English', 'retail', 320000, 420000, 'BHD',
 ARRAY['Al Bareh', 'Premium Villa', '4 Bedroom'], 'immediate', 'negotiating', 85,
 'referral', ARRAY['In active negotiation', 'Discussing final terms'],
 '[{"date": "2025-09-10", "type": "negotiation", "details": "Negotiating final price and payment terms"}]'::jsonb,
 '{"match_score": 85, "interests": ["upgrade", "premium"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '20 days'),

('Maryam', 'Al-Zayani', 'maryam.zayani@negotiation.bh', '+973-3444-5555', 'Arabic', 'investor', 180000, 250000, 'BHD',
 ARRAY['North Islands', 'Investment Villa', '3 Bedroom'], 'immediate', 'negotiating', 82,
 'exhibition', ARRAY['Price negotiation ongoing', 'Ready to close'],
 '[{"date": "2025-09-08", "type": "price_negotiation", "details": "Final price negotiation, very close to closing"}]'::jsonb,
 '{"match_score": 82, "interests": ["investment", "quick_close"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '22 days'),

-- Converted (successful sales)
('Rashid', 'Al-Khalifa', 'rashid.khalifa@converted.bh', '+973-3555-6666', 'English', 'hni', 450000, 650000, 'BHD',
 ARRAY['Al Bareh', 'Luxury Villa', '5 Bedroom'], 'immediate', 'converted', 95,
 'vip_referral', ARRAY['Deal closed successfully', 'Premium villa purchased'],
 '[{"date": "2025-09-05", "type": "closing", "details": "Deal closed, villa V-AB-015 purchased for BHD 485,000"}]'::jsonb,
 '{"match_score": 95, "interests": ["luxury", "completed"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '25 days'),

('Fatima', 'Al-Mannai', 'fatima.mannai@converted.bh', '+973-3666-7777', 'Arabic', 'retail', 195000, 235000, 'BHD',
 ARRAY['Al Naseem', 'Family Villa', '3 Bedroom'], 'immediate', 'converted', 88,
 'website', ARRAY['Successful first-time buyer', 'Excellent customer experience'],
 '[{"date": "2025-09-01", "type": "handover", "details": "Villa V-AN1-023 purchased, keys handed over"}]'::jsonb,
 '{"match_score": 88, "interests": ["family", "completed"], "risk_level": "low"}'::jsonb, NOW() - INTERVAL '29 days');;