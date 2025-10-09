-- Migration: insert_sample_customer_management_data
-- Created at: 1759221705

-- Insert sample invoice data
INSERT INTO invoices (invoice_number, customer_id, amount, currency, status, due_date, items, total_amount, created_by)
SELECT 
    'INV-2024-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
    p.id,
    CASE 
        WHEN RANDOM() < 0.3 THEN 5000
        WHEN RANDOM() < 0.6 THEN 15000
        ELSE 25000
    END,
    'BHD',
    CASE 
        WHEN RANDOM() < 0.7 THEN 'paid'
        WHEN RANDOM() < 0.9 THEN 'sent'
        ELSE 'overdue'
    END,
    CURRENT_DATE + INTERVAL '30 days',
    '[{"description": "Property Viewing Fee", "amount": 500}, {"description": "Reservation Deposit", "amount": 2000}]'::JSONB,
    CASE 
        WHEN RANDOM() < 0.3 THEN 5000
        WHEN RANDOM() < 0.6 THEN 15000
        ELSE 25000
    END,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
FROM profiles p 
WHERE p.role = 'customer' 
LIMIT 10;

-- Insert sample financial records
INSERT INTO financial_records (type, category, amount, currency, transaction_date, description, created_by)
VALUES 
('revenue', 'property_sales', 185000, 'BHD', '2024-09-15', 'Sale of Al Bareh Villa #12', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('revenue', 'reservation_fees', 2500, 'BHD', '2024-09-20', 'Reservation fees collected', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('revenue', 'viewing_fees', 500, 'BHD', '2024-09-25', 'Property viewing fees', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('expense', 'marketing', 3500, 'BHD', '2024-09-10', 'Digital marketing campaign', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('expense', 'maintenance', 1200, 'BHD', '2024-09-12', 'Property maintenance costs', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('commission', 'sales_commission', 9250, 'BHD', '2024-09-15', 'Sales commission for villa sale', (SELECT id FROM profiles WHERE role = 'sales_rep' LIMIT 1));

-- Insert sample customer communications
INSERT INTO customer_communications (customer_id, communication_type, direction, subject, content, staff_id, completed_date, status)
SELECT 
    p.id,
    CASE 
        WHEN RANDOM() < 0.4 THEN 'phone'
        WHEN RANDOM() < 0.7 THEN 'email'
        ELSE 'in_person'
    END,
    CASE WHEN RANDOM() < 0.6 THEN 'outbound' ELSE 'inbound' END,
    'Property Inquiry Follow-up',
    'Discussed property requirements and scheduled viewing appointment.',
    (SELECT id FROM profiles WHERE role IN ('admin', 'sales_rep') ORDER BY RANDOM() LIMIT 1),
    NOW() - INTERVAL '1 day' * (RANDOM() * 30)::INT,
    'completed'
FROM profiles p 
WHERE p.role = 'customer'
LIMIT 15;

-- Insert sample unit availability data for property units
INSERT INTO unit_availability (unit_id, date, status, updated_by)
SELECT 
    pu.id,
    CURRENT_DATE + INTERVAL '1 day' * generate_series(0, 30),
    CASE 
        WHEN RANDOM() < 0.7 THEN 'available'
        WHEN RANDOM() < 0.85 THEN 'booked'
        WHEN RANDOM() < 0.95 THEN 'maintenance'
        ELSE 'reserved'
    END,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
FROM property_units pu
CROSS JOIN generate_series(0, 30)
WHERE pu.id IS NOT NULL
LIMIT 500;

-- Insert sample customer service tickets
INSERT INTO customer_tickets (ticket_number, customer_id, subject, description, priority, status, category, assigned_to, created_by)
SELECT 
    'TKT-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
    p.id,
    'Property Maintenance Request',
    'Customer requesting maintenance service for property-related issues.',
    CASE 
        WHEN RANDOM() < 0.2 THEN 'urgent'
        WHEN RANDOM() < 0.5 THEN 'high'
        WHEN RANDOM() < 0.8 THEN 'medium'
        ELSE 'low'
    END,
    CASE 
        WHEN RANDOM() < 0.3 THEN 'resolved'
        WHEN RANDOM() < 0.6 THEN 'in_progress'
        ELSE 'open'
    END,
    'maintenance',
    (SELECT id FROM profiles WHERE role IN ('admin', 'sales_rep') ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
FROM profiles p 
WHERE p.role = 'customer'
LIMIT 8;

-- Update customer profiles with enhanced data
UPDATE profiles SET 
    customer_preferences = '{"property_types": ["villa", "apartment"], "preferred_location": ["Al Muharraq"], "amenities": ["swimming_pool", "gym", "parking"]}',
    risk_level = CASE 
        WHEN RANDOM() < 0.7 THEN 'low'
        WHEN RANDOM() < 0.9 THEN 'medium'
        ELSE 'high'
    END,
    credit_score = 650 + (RANDOM() * 200)::INT,
    payment_history = '{"total_payments": 3, "on_time_payments": 2, "late_payments": 1, "average_days_late": 5}'
WHERE role = 'customer';

-- Insert sample lead conversions
INSERT INTO lead_conversions (lead_id, customer_id, conversion_stage, conversion_date, converted_by, conversion_value)
SELECT 
    l.id,
    p.id,
    'converted',
    NOW() - INTERVAL '1 week' * (RANDOM() * 4)::INT,
    (SELECT id FROM profiles WHERE role IN ('admin', 'sales_rep') ORDER BY RANDOM() LIMIT 1),
    l.budget_max * 0.9
FROM leads l
JOIN profiles p ON p.role = 'customer'
WHERE l.status = 'converted'
LIMIT 3;

-- Insert sample report templates
INSERT INTO report_templates (name, type, description, template_config, created_by)
VALUES 
('Monthly Financial Summary', 'financial', 'Comprehensive monthly financial report with revenue, expenses, and profit analysis', 
 '{"sections": ["revenue_summary", "expense_breakdown", "profit_analysis", "payment_status"], "charts": ["revenue_trend", "expense_categories"], "period": "monthly"}', 
 (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('Property Occupancy Report', 'occupancy', 'Detailed occupancy rates and availability analysis for all properties', 
 '{"sections": ["occupancy_summary", "availability_trends", "booking_patterns"], "charts": ["occupancy_rate", "seasonal_trends"], "period": "weekly"}', 
 (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('Customer Analytics Dashboard', 'customer', 'Customer behavior analysis and lead conversion tracking', 
 '{"sections": ["customer_demographics", "lead_conversion", "satisfaction_metrics"], "charts": ["conversion_funnel", "customer_segments"], "period": "quarterly"}', 
 (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1));;