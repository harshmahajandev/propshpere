-- Migration: populate_leads_sales_pipeline
-- Created at: 1759239597

-- Clear existing leads and populate comprehensive sales pipeline
DELETE FROM leads;

-- Get customer IDs for leads creation
WITH customer_leads AS (
  SELECT 
    id,
    full_name,
    email,
    phone,
    customer_preferences,
    customer_requirements,
    credit_score,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM profiles 
  WHERE role = 'customer'
)
INSERT INTO leads (
  customer_id, status, lead_source, interest_level, budget_range, 
  property_preferences, interaction_history, next_follow_up, 
  assigned_agent, notes, created_at
)
SELECT 
  cl.id,
  CASE 
    WHEN cl.rn <= 8 THEN 'new'
    WHEN cl.rn <= 15 THEN 'contacted' 
    WHEN cl.rn <= 22 THEN 'qualified'
    WHEN cl.rn <= 26 THEN 'proposal_sent'
    WHEN cl.rn <= 28 THEN 'negotiation'
    ELSE 'closed_won'
  END as status,
  CASE cl.rn % 6
    WHEN 0 THEN 'website'
    WHEN 1 THEN 'referral'
    WHEN 2 THEN 'social_media'
    WHEN 3 THEN 'exhibition'
    WHEN 4 THEN 'direct_visit'
    ELSE 'phone_inquiry'
  END as lead_source,
  CASE 
    WHEN cl.credit_score > 750 THEN 'hot'
    WHEN cl.credit_score > 650 THEN 'warm'
    ELSE 'cold'
  END as interest_level,
  COALESCE((cl.customer_preferences->>'budget_range')::text, 'medium'),
  cl.customer_preferences,
  CASE cl.rn % 3
    WHEN 0 THEN '[{"date": "' || (cl.created_at)::date || '", "type": "initial_call", "notes": "First contact made, customer showed strong interest"}]'::jsonb
    WHEN 1 THEN '[{"date": "' || (cl.created_at)::date || '", "type": "site_visit", "notes": "Customer visited showroom, requested property brochures"}]'::jsonb
    ELSE '[{"date": "' || (cl.created_at)::date || '", "type": "email_inquiry", "notes": "Submitted online inquiry form with specific requirements"}]'::jsonb
  END as interaction_history,
  CASE 
    WHEN cl.rn <= 15 THEN cl.created_at + INTERVAL '2 days'
    WHEN cl.rn <= 25 THEN cl.created_at + INTERVAL '1 week'
    ELSE cl.created_at + INTERVAL '2 weeks'
  END as next_follow_up,
  CASE cl.rn % 4
    WHEN 0 THEN 'Ahmed Al-Rashid'
    WHEN 1 THEN 'Sara Al-Mannai' 
    WHEN 2 THEN 'Mohammed Al-Khalifi'
    ELSE 'Fatima Al-Dosari'
  END as assigned_agent,
  CASE 
    WHEN cl.rn <= 8 THEN 'New lead - initial contact required'
    WHEN cl.rn <= 15 THEN 'First contact made - follow up scheduled'
    WHEN cl.rn <= 22 THEN 'Qualified buyer - property recommendations sent'
    WHEN cl.rn <= 26 THEN 'Proposal submitted - awaiting customer response'
    WHEN cl.rn <= 28 THEN 'In negotiation - finalizing terms'
    ELSE 'Deal closed successfully'
  END as notes,
  cl.created_at
FROM customer_leads cl
LIMIT 30;;