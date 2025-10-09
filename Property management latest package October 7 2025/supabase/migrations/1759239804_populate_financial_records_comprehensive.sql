-- Migration: populate_financial_records_comprehensive
-- Created at: 1759239804

-- Populate comprehensive financial records for the CRM system
DELETE FROM financial_records;

-- Create realistic financial transaction data for sold properties and customer payments
WITH sold_properties AS (
  SELECT 
    p.id as property_id,
    p.title,
    p.project,
    p.price,
    c.id as customer_id,
    c.full_name,
    c.credit_score,
    -- Assign customers to sold properties
    ROW_NUMBER() OVER (ORDER BY RANDOM()) as assignment_order
  FROM properties p
  CROSS JOIN profiles c
  WHERE p.status = 'sold' 
    AND c.role = 'customer'
    AND c.credit_score > 700  -- Only high-credit customers for sold properties
),
assigned_sales AS (
  SELECT 
    property_id,
    title,
    project,
    price,
    customer_id,
    full_name,
    ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY assignment_order) as customer_rank
  FROM sold_properties
),
final_sales AS (
  SELECT * FROM assigned_sales WHERE customer_rank = 1
)
INSERT INTO financial_records (
  type, category, amount, currency, transaction_date, property_id, customer_id,
  description, payment_method, reference_number, created_at
)
-- Down payments for sold properties
SELECT 
  'income',
  'down_payment',
  (fs.price * 0.10)::NUMERIC,  -- 10% down payment
  'BHD',
  (NOW() - INTERVAL '32 days')::DATE,
  fs.property_id,
  fs.customer_id,
  'Down payment received for ' || fs.title || ' in ' || fs.project,
  CASE (fs.customer_id::text || fs.property_id::text)::bit(32)::int % 4
    WHEN 0 THEN 'bank_transfer'
    WHEN 1 THEN 'cheque'
    WHEN 2 THEN 'credit_card'
    ELSE 'cash'
  END,
  'DP-' || TO_CHAR(NOW() - INTERVAL '30 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() - INTERVAL '32 days'
FROM final_sales fs

UNION ALL

-- First installment payments
SELECT 
  'income',
  'installment',
  (fs.price * 0.15)::NUMERIC,  -- 15% first installment
  'BHD',
  (NOW() - INTERVAL '22 days')::DATE,
  fs.property_id,
  fs.customer_id,
  'First installment payment for ' || fs.title,
  CASE (fs.customer_id::text || fs.property_id::text)::bit(32)::int % 3
    WHEN 0 THEN 'bank_transfer'
    WHEN 1 THEN 'cheque'
    ELSE 'financing'
  END,
  'I1-' || TO_CHAR(NOW() - INTERVAL '20 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() - INTERVAL '22 days'
FROM final_sales fs

UNION ALL

-- Second installment payments  
SELECT 
  'income',
  'installment',
  (fs.price * 0.20)::NUMERIC,  -- 20% second installment
  'BHD',
  (NOW() - INTERVAL '12 days')::DATE,
  fs.property_id,
  fs.customer_id,
  'Second installment payment for ' || fs.title,
  'financing',
  'I2-' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() - INTERVAL '12 days'
FROM final_sales fs

UNION ALL

-- Service charges and fees
SELECT 
  'income',
  'service_charge',
  (200 + RANDOM() * 150)::NUMERIC,  -- BHD 200-350 service charge
  'BHD',
  (NOW() - INTERVAL '5 days')::DATE,
  NULL,
  p.id,
  'Monthly service charge for ' || TO_CHAR(NOW() - INTERVAL '1 month', 'Month YYYY'),
  'auto_debit',
  'SC-' || TO_CHAR(NOW() - INTERVAL '1 month', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() - INTERVAL '5 days'
FROM profiles p 
WHERE p.role = 'customer' 
  AND p.customer_preferences->>'existing_owner' = 'true'

UNION ALL

-- Marketing and operational expenses
SELECT 
  'expense',
  'marketing',
  (5000 + RANDOM() * 15000)::NUMERIC,  -- BHD 5K-20K marketing expenses
  'BHD',
  (NOW() - INTERVAL '15 days')::DATE,
  NULL,
  NULL,
  'Digital marketing campaign - ' || TO_CHAR(NOW() - INTERVAL '1 month', 'Month YYYY'),
  'bank_transfer',
  'MKT-' || TO_CHAR(NOW() - INTERVAL '15 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 3, '0'),
  NOW() - INTERVAL '15 days'
FROM generate_series(1, 3)

UNION ALL

-- Operational expenses
SELECT 
  'expense',
  'operations',
  (8000 + RANDOM() * 12000)::NUMERIC,  -- BHD 8K-20K operational expenses
  'BHD',
  (NOW() - INTERVAL '10 days')::DATE,
  NULL,
  NULL,
  CASE generate_series % 3
    WHEN 0 THEN 'Property maintenance and landscaping'
    WHEN 1 THEN 'Sales team commissions and bonuses'
    ELSE 'Utilities and facility management'
  END,
  'bank_transfer',
  'OPS-' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMM') || '-' || LPAD(generate_series::text, 3, '0'),
  NOW() - INTERVAL '10 days'
FROM generate_series(1, 5)

UNION ALL

-- Recent reservations and deposits
SELECT 
  'income',
  'reservation',
  (5000 + RANDOM() * 5000)::NUMERIC,  -- BHD 5K-10K reservation deposits
  'BHD',
  (NOW() - INTERVAL '3 days')::DATE,
  props.id,
  profiles.id,
  'Reservation deposit for ' || props.title,
  CASE WHEN RANDOM() > 0.5 THEN 'bank_transfer' ELSE 'cheque' END,
  'RES-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() - INTERVAL '3 days'
FROM properties props
CROSS JOIN profiles
WHERE props.status = 'reserved' 
  AND profiles.role = 'customer'
  AND profiles.customer_preferences->>'stage' IN ('lead', 'prospect')
LIMIT 8;;