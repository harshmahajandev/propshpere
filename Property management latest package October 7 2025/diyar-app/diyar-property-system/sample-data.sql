-- Insert sample properties
INSERT INTO properties (
  title, project, type, status, price, currency, size, bedrooms, bathrooms, location, description, 
  images, amenities, features, total_units, available_units
) VALUES 
(
  'Al Bareh Villa #12',
  'Al Bareh',
  'villa',
  'available',
  185000,
  'BHD',
  183,
  3,
  2,
  'Al Muharraq',
  'Beautiful villa in the prestigious Al Bareh development featuring modern design, spacious living areas, and premium finishes. Perfect for families looking for a luxurious lifestyle in a prime location.',
  ARRAY['/placeholder-property.jpg'],
  ARRAY['Swimming Pool', 'Gym', 'Garden', 'Parking', 'Security', 'Playground'],
  ARRAY['Modern Design', 'Premium Finishes', 'Spacious Layout', 'Natural Light'],
  1,
  1
),
(
  'Suhail Commercial Plot #8',
  'Suhail',
  'commercial_plot',
  'available',
  125000,
  'BHD',
  400,
  NULL,
  NULL,
  'North Islands',
  'Prime commercial plot in the new Suhail development, ideal for retail or office buildings. High visibility location with excellent access to major roads and public transportation.',
  ARRAY['/placeholder-property.jpg'],
  ARRAY['Commercial Zoning', 'High Traffic Area', 'Utilities Ready', 'Parking Available'],
  ARRAY['Prime Location', 'Investment Opportunity', 'Development Ready'],
  1,
  1
),
(
  'Jeewan Villa #5',
  'Jeewan',
  'villa',
  'available',
  220000,
  'BHD',
  250,
  4,
  3,
  'Al Muharraq',
  'Luxury villa with premium finishes and sea views. This stunning property offers the perfect blend of modern comfort and traditional elegance, with spacious rooms and high-end amenities.',
  ARRAY['/placeholder-property.jpg'],
  ARRAY['Sea View', 'Private Beach Access', 'Premium Finishes', 'Smart Home', 'Garage', 'Maid Room'],
  ARRAY['Sea Views', 'Smart Home Technology', 'Premium Materials', 'Private Beach'],
  1,
  1
),
(
  'Al Bareh Apartment #24',
  'Al Bareh',
  'apartment',
  'available',
  95000,
  'BHD',
  120,
  2,
  2,
  'Al Muharraq',
  'Modern 2-bedroom apartment in Al Bareh with contemporary design and city views. Perfect for young professionals or small families seeking a comfortable urban lifestyle.',
  ARRAY['/placeholder-property.jpg'],
  ARRAY['City Views', 'Modern Kitchen', 'Balcony', 'Parking', 'Gym Access', 'Pool Access'],
  ARRAY['Modern Design', 'City Views', 'Quality Finishes'],
  1,
  1
),
(
  'Jeewan Townhouse #18',
  'Jeewan',
  'villa',
  'available',
  165000,
  'BHD',
  200,
  3,
  2,
  'Al Muharraq',
  'Spacious townhouse in the exclusive Jeewan community. Features open-plan living, private garden, and access to world-class amenities.',
  ARRAY['/placeholder-property.jpg'],
  ARRAY['Private Garden', 'Community Pool', 'Gym', 'Parking', 'Security', 'Kids Area'],
  ARRAY['Open Plan Living', 'Private Garden', 'Community Amenities'],
  1,
  1
),
(
  'Suhail Office Complex Unit A',
  'Suhail',
  'office',
  'available',
  80000,
  'BHD',
  150,
  NULL,
  NULL,
  'North Islands',
  'Modern office space in the heart of Suhail business district. Ideal for companies looking for a prestigious address with excellent connectivity.',
  ARRAY['/placeholder-property.jpg'],
  ARRAY['Business Center', 'Conference Rooms', 'High Speed Internet', 'Parking', 'Security', 'Reception'],
  ARRAY['Business Location', 'Modern Facilities', 'Professional Environment'],
  1,
  1
);

-- Insert admin user profiles (matching the demo credentials)
INSERT INTO profiles (id, email, full_name, role, phone, company, nationality) VALUES 
('admin-user-id-1', 'admin@diyar.bh', 'Ahmed Al-Mansouri', 'admin', '+973 1234 5678', 'Diyar Al Muharraq', 'Bahraini'),
('sales-user-id-1', 'sales@diyar.bh', 'Sarah Johnson', 'sales_rep', '+973 1234 5679', 'Diyar Al Muharraq', 'British');

-- Insert sample customer profiles
INSERT INTO profiles (id, email, full_name, role, phone, nationality) VALUES 
('customer-1', 'customer1@email.com', 'Mohammed Al-Rashid', 'customer', '+973 3334 5555', 'Bahraini'),
('customer-2', 'customer2@email.com', 'Emily Smith', 'customer', '+973 3334 6666', 'American'),
('customer-3', 'customer3@email.com', 'Omar Al-Mansouri', 'customer', '+973 3334 7777', 'Bahraini');

-- Insert sample reservations
INSERT INTO reservations (
  property_id, customer_id, customer_name, customer_email, customer_phone, customer_nationality,
  status, reservation_date, viewing_date, preferred_contact_time, budget_min, budget_max,
  financing_needed, special_requirements
) 
SELECT 
  p.id,
  'customer-1',
  'Mohammed Al-Rashid',
  'customer1@email.com',
  '+973 3334 5555',
  'Bahraini',
  'pending',
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '3 days',
  'morning',
  150000,
  200000,
  false,
  'Interested in viewing multiple units in the project'
FROM properties p WHERE p.title = 'Al Bareh Villa #12';

INSERT INTO reservations (
  property_id, customer_id, customer_name, customer_email, customer_phone, customer_nationality,
  status, reservation_date, viewing_date, preferred_contact_time, budget_min, budget_max,
  financing_needed, special_requirements
) 
SELECT 
  p.id,
  'customer-2',
  'Emily Smith',
  'customer2@email.com',
  '+973 3334 6666',
  'American',
  'confirmed',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '1 day',
  'afternoon',
  200000,
  250000,
  true,
  'Looking for sea view properties with financing options'
FROM properties p WHERE p.title = 'Jeewan Villa #5';

INSERT INTO reservations (
  property_id, customer_id, customer_name, customer_email, customer_phone, customer_nationality,
  status, reservation_date, viewing_date, preferred_contact_time, budget_min, budget_max,
  financing_needed, special_requirements
) 
SELECT 
  p.id,
  'customer-3',
  'Omar Al-Mansouri',
  'customer3@email.com',
  '+973 3334 7777',
  'Bahraini',
  'completed',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '5 days',
  'weekend',
  80000,
  120000,
  false,
  'First-time buyer, need guidance on the process'
FROM properties p WHERE p.title = 'Al Bareh Apartment #24';

-- Insert activity logs
INSERT INTO activity_logs (entity_type, entity_id, activity_type, description, performed_by)
SELECT 
  'property',
  id,
  'created',
  'Property listing created: ' || title,
  'admin-user-id-1'
FROM properties;

INSERT INTO activity_logs (entity_type, entity_id, activity_type, description, performed_by)
SELECT 
  'reservation',
  id,
  'created',
  'Reservation created for ' || customer_name,
  customer_id
FROM reservations;