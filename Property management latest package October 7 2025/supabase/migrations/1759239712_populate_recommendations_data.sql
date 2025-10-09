-- Migration: populate_recommendations_data
-- Created at: 1759239712

-- Clear existing recommendations and populate AI-powered villa recommendations
DELETE FROM recommendations;

-- Create realistic AI recommendations based on customer profiles and property matching
WITH customer_property_matches AS (
  SELECT 
    p.id as customer_id,
    p.full_name,
    p.customer_preferences,
    props.id as property_id,
    props.title as property_title,
    props.project,
    props.price,
    props.bedrooms,
    props.size,
    props.status,
    -- Calculate compatibility score based on preferences
    CASE 
      WHEN props.status != 'available' THEN 0 -- Not available
      WHEN (p.customer_preferences->>'budget_range') LIKE '%500000%' AND props.price > 400000 THEN 90 + (RANDOM() * 10)::INT
      WHEN (p.customer_preferences->>'budget_range') LIKE '%400000%' AND props.price BETWEEN 300000 AND 500000 THEN 85 + (RANDOM() * 10)::INT
      WHEN (p.customer_preferences->>'budget_range') LIKE '%300000%' AND props.price BETWEEN 250000 AND 400000 THEN 80 + (RANDOM() * 10)::INT
      WHEN (p.customer_preferences->>'budget_range') LIKE '%200000%' AND props.price BETWEEN 180000 AND 300000 THEN 75 + (RANDOM() * 15)::INT
      WHEN (p.customer_preferences->>'preferred_location') = props.project THEN 85 + (RANDOM() * 10)::INT
      WHEN (p.customer_preferences->>'bedrooms')::INT = props.bedrooms THEN 80 + (RANDOM() * 10)::INT
      ELSE 60 + (RANDOM() * 20)::INT
    END as compatibility_score
  FROM profiles p
  CROSS JOIN properties props
  WHERE p.role = 'customer' 
    AND p.customer_preferences IS NOT NULL
    AND props.status = 'available'
),
top_recommendations AS (
  SELECT 
    customer_id,
    full_name,
    property_id,
    property_title,
    project,
    price,
    bedrooms,
    size,
    compatibility_score,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY compatibility_score DESC) as rank
  FROM customer_property_matches 
  WHERE compatibility_score >= 70
)
INSERT INTO recommendations (
  customer_id, property_id, compatibility_score, recommendation_reason, 
  ai_analysis, campaign_type, created_at
)
SELECT 
  tr.customer_id,
  tr.property_id,
  tr.compatibility_score,
  CASE 
    WHEN tr.compatibility_score >= 90 THEN 
      'Perfect match based on your budget range of ' || (SELECT customer_preferences->>'budget_range' FROM profiles WHERE id = tr.customer_id) || 
      ' and preference for ' || tr.project || '. This ' || tr.bedrooms || '-bedroom villa offers excellent value.'
    WHEN tr.compatibility_score >= 85 THEN
      'Excellent match for your requirements. Located in ' || tr.project || 
      ', this villa aligns with your budget and size preferences.'
    WHEN tr.compatibility_score >= 80 THEN
      'Great option in ' || tr.project || '. While slightly different from your initial criteria, ' ||
      'this property offers excellent features and value.'
    ELSE
      'Good alternative option. This ' || tr.bedrooms || '-bedroom villa in ' || tr.project || 
      ' may interest you based on your overall preferences.'
  END as recommendation_reason,
  json_build_object(
    'price_analysis', 
      CASE 
        WHEN tr.price < 250000 THEN 'Excellent value for money in current market'
        WHEN tr.price < 400000 THEN 'Competitive pricing for premium location'
        ELSE 'Premium property with exclusive features'
      END,
    'location_score', (70 + RANDOM() * 25)::INT,
    'investment_potential', 
      CASE 
        WHEN tr.project LIKE '%Islands%' THEN 'High rental yield potential'
        WHEN tr.project LIKE '%Bareh%' THEN 'Strong appreciation expected'
        ELSE 'Stable long-term investment'
      END,
    'lifestyle_match', 
      CASE 
        WHEN tr.bedrooms >= 4 THEN 'Perfect for large families'
        WHEN tr.bedrooms = 3 THEN 'Ideal for growing families'
        ELSE 'Suitable for couples or small families'
      END
  ) as ai_analysis,
  CASE 
    WHEN tr.rank = 1 THEN 'personalized'
    WHEN tr.rank <= 3 THEN 'targeted'
    ELSE 'general'
  END as campaign_type,
  NOW() - (tr.rank || ' days')::INTERVAL
FROM top_recommendations tr
WHERE tr.rank <= 5  -- Top 5 recommendations per customer
ORDER BY tr.customer_id, tr.compatibility_score DESC;;