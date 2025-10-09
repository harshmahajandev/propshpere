-- Migration: populate_financial_transactions
-- Created at: 1759239769

-- Populate financial transactions for comprehensive CRM system
DELETE FROM financial_transactions;

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
INSERT INTO financial_transactions (
  customer_id, property_id, transaction_type, amount, currency,
  payment_method, status, description, invoice_number, 
  due_date, paid_date, created_at
)
-- Down payments for sold properties
SELECT 
  fs.customer_id,
  fs.property_id,
  'down_payment',
  (fs.price * 0.10)::NUMERIC,  -- 10% down payment
  'BHD',
  CASE (fs.customer_id::text || fs.property_id::text)::bit(32)::int % 4
    WHEN 0 THEN 'bank_transfer'
    WHEN 1 THEN 'cheque'
    WHEN 2 THEN 'credit_card'
    ELSE 'cash'
  END,
  'completed',
  'Down payment for ' || fs.title || ' in ' || fs.project,
  'INV-DP-' || TO_CHAR(NOW() - INTERVAL '30 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '32 days',
  NOW() - INTERVAL '32 days'
FROM final_sales fs

UNION ALL

-- First installment payments
SELECT 
  fs.customer_id,
  fs.property_id,
  'installment',
  (fs.price * 0.15)::NUMERIC,  -- 15% first installment
  'BHD',
  CASE (fs.customer_id::text || fs.property_id::text)::bit(32)::int % 3
    WHEN 0 THEN 'bank_transfer'
    WHEN 1 THEN 'cheque'
    ELSE 'financing'
  END,
  'completed',
  'First installment payment for ' || fs.title,
  'INV-I1-' || TO_CHAR(NOW() - INTERVAL '20 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '22 days',
  NOW() - INTERVAL '22 days'
FROM final_sales fs

UNION ALL

-- Second installment payments  
SELECT 
  fs.customer_id,
  fs.property_id,
  'installment',
  (fs.price * 0.20)::NUMERIC,  -- 20% second installment
  'BHD',
  'financing',
  'completed',
  'Second installment payment for ' || fs.title,
  'INV-I2-' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days'
FROM final_sales fs

UNION ALL

-- Upcoming installment payments (pending)
SELECT 
  fs.customer_id,
  fs.property_id,
  'installment',
  (fs.price * 0.25)::NUMERIC,  -- 25% third installment
  'BHD',
  'financing',
  'pending',
  'Third installment payment for ' || fs.title,
  'INV-I3-' || TO_CHAR(NOW() + INTERVAL '15 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() + INTERVAL '15 days',
  NULL,
  NOW() - INTERVAL '5 days'
FROM final_sales fs

UNION ALL

-- Final payment (due in future)
SELECT 
  fs.customer_id,
  fs.property_id,
  'final_payment',
  (fs.price * 0.30)::NUMERIC,  -- 30% final payment
  'BHD',
  'financing',
  'scheduled',
  'Final payment for ' || fs.title || ' completion',
  'INV-FP-' || TO_CHAR(NOW() + INTERVAL '90 days', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() + INTERVAL '90 days',
  NULL,
  NOW() - INTERVAL '2 days'
FROM final_sales fs;

-- Add service charges and maintenance fees for existing customers
INSERT INTO financial_transactions (
  customer_id, transaction_type, amount, currency, payment_method, 
  status, description, invoice_number, due_date, paid_date, created_at
)
SELECT 
  p.id,
  'service_charge',
  (250 + RANDOM() * 200)::NUMERIC,  -- BHD 250-450 service charge
  'BHD',
  'auto_debit',
  CASE WHEN RANDOM() > 0.8 THEN 'overdue' ELSE 'completed' END,
  'Monthly service charge - ' || TO_CHAR(NOW() - INTERVAL '1 month', 'Month YYYY'),
  'INV-SC-' || TO_CHAR(NOW() - INTERVAL '1 month', 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  NOW() - INTERVAL '35 days',
  CASE WHEN RANDOM() > 0.8 THEN NULL ELSE NOW() - INTERVAL '32 days' END,
  NOW() - INTERVAL '35 days'
FROM profiles p 
WHERE p.role = 'customer' 
  AND p.customer_preferences->>'existing_owner' = 'true'
LIMIT 8;;