-- Migration: populate_diyar_islands_comprehensive
-- Created at: 1759239224

-- Clear existing islands data and populate with comprehensive Diyar developments
DELETE FROM islands;

-- Insert all 7 Diyar islands with comprehensive data
INSERT INTO islands (name, display_name, description, total_area, status, coordinates) VALUES 
('al_naseem', 'Al Naseem', 'Flagship residential development with waterfront villas starting from BD 199,000. Multiple phases including Sabah El-Nasayem, Duha El-Nasayem, and Layl El-Nasayem with comprehensive family amenities', 2.1, 'active', '{"lat": 26.2540, "lng": 50.6480, "bounds": {"north": 26.2580, "south": 26.2500, "east": 50.6520, "west": 50.6440}}'),

('al_bareh', 'Al Bareh', 'Premium mixed villa and plot development featuring luxury finishes, modern amenities, and landscaped gardens. Offers both completed villas and custom development plots', 1.8, 'active', '{"lat": 26.2580, "lng": 50.6520, "bounds": {"north": 26.2620, "south": 26.2540, "east": 50.6560, "west": 50.6480}}'),

('deerat_al_oyoun', 'Deerat Al Oyoun', 'Exclusive premium villa community with private beach access, waterfront views, and resort-style amenities. Limited collection of luxury villas for discerning buyers', 1.5, 'planning', '{"lat": 26.2620, "lng": 50.6560, "bounds": {"north": 26.2660, "south": 26.2580, "east": 50.6600, "west": 50.6520}}'),

('al_noor_al_sherooq', 'Al Noor & Al Sherooq', 'Twin villa developments designed for family living with community amenities, playgrounds, and shared facilities. Emphasis on neighborhood connectivity and social spaces', 2.2, 'active', '{"lat": 26.2480, "lng": 50.6440, "bounds": {"north": 26.2520, "south": 26.2440, "east": 50.6480, "west": 50.6400}}'),

('jeewan', 'Jeewan', 'Contemporary villa development featuring cutting-edge architecture, smart home integration, and sustainable design principles. Modern lifestyle with traditional Bahraini touches', 1.4, 'construction', '{"lat": 26.2520, "lng": 50.6400, "bounds": {"north": 26.2560, "south": 26.2480, "east": 50.6440, "west": 50.6360}}'),

('north_islands', 'North Islands', 'Investment-focused development with high rental potential. Strategic location for property investors seeking steady returns and capital appreciation', 1.9, 'active', '{"lat": 26.2660, "lng": 50.6600, "bounds": {"north": 26.2700, "south": 26.2620, "east": 50.6640, "west": 50.6560}}'),

('commercial_district', 'Commercial District', 'Mixed-use commercial development featuring showroom plots, warehousing facilities, and business centers. Strategic location for enterprises and retail operations', 1.1, 'planning', '{"lat": 26.2440, "lng": 50.6360, "bounds": {"north": 26.2480, "south": 26.2400, "east": 50.6400, "west": 50.6320}}');;