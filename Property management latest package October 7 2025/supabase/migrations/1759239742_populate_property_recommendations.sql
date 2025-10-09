-- Migration: populate_property_recommendations
-- Created at: 1759239742

-- Clear existing recommendations and populate AI-powered villa recommendations
DELETE FROM property_recommendations;

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
INSERT INTO property_recommendations (
  customer_id, property_id, match_score, recommendation_reason, 
  compatibility_factors, status, created_at
)
SELECT 
  tr.customer_id,
  tr.property_id,
  tr.compatibility_score,
  CASE 
    WHEN tr.compatibility_score >= 90 THEN 
      'Perfect match based on your budget preferences and location choice for ' || tr.project || 
      '. This ' || tr.bedrooms || '-bedroom villa offers exceptional value and aligns perfectly with your requirements.'
    WHEN tr.compatibility_score >= 85 THEN
      'Excellent match for your needs. Located in ' || tr.project || 
      ', this villa matches your budget range and size preferences with premium amenities.'
    WHEN tr.compatibility_score >= 80 THEN
      'Great option in ' || tr.project || '. While slightly different from your initial criteria, ' ||
      'this property offers excellent features, location benefits, and strong investment potential.'
    ELSE
      'Good alternative worth considering. This ' || tr.bedrooms || '-bedroom villa in ' || tr.project || 
      ' offers solid value and may appeal to your lifestyle preferences.'
  END as recommendation_reason,
  json_build_object(
    'budget_alignment', 
      CASE 
        WHEN tr.price < 250000 THEN 95
        WHEN tr.price < 400000 THEN 85
        ELSE 75
      END,
    'location_preference', (70 + RANDOM() * 25)::INT,
    'size_match', 
      CASE 
        WHEN tr.bedrooms >= 4 THEN 90
        WHEN tr.bedrooms = 3 THEN 85
        ELSE 75
      END,
    'lifestyle_compatibility', (80 + RANDOM() * 15)::INT,
    'investment_potential', 
      CASE 
        WHEN tr.project LIKE '%Islands%' THEN 85
        WHEN tr.project LIKE '%Bareh%' THEN 90
        WHEN tr.project LIKE '%Naseem%' THEN 88
        ELSE 80
      END,
    'amenities_score', (75 + RANDOM() * 20)::INT,
    'financing_suitability', 
      CASE 
        WHEN tr.price < 300000 THEN 95
        WHEN tr.price < 500000 THEN 85
        ELSE 75
      END
  ) as compatibility_factors,
  CASE 
    WHEN tr.rank = 1 THEN 'priority'
    WHEN tr.rank <= 3 THEN 'recommended'
    ELSE 'suggested'
  END as status,
  NOW() - (tr.rank || ' days')::INTERVAL
FROM top_recommendations tr
WHERE tr.rank <= 5  -- Top 5 recommendations per customer
ORDER BY tr.customer_id, tr.compatibility_score DESC;;