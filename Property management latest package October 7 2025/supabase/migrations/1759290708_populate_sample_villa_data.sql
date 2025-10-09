-- Migration: populate_sample_villa_data
-- Created at: 1759290708

-- Insert sample villas for Amwaj Floating City project
INSERT INTO villas (unit_number, status, size_sqft, price, project, title, bedrooms, bathrooms, description, position_x, position_y) VALUES
-- Row 1 (Waterfront Villas)
('A101', 'available', 2500, 180000, 'Amwaj Floating City', 'Waterfront Villa A101', 3, 3, 'Luxury waterfront villa with private beach access', 1, 1),
('A102', 'sold', 2500, 180000, 'Amwaj Floating City', 'Waterfront Villa A102', 3, 3, 'Luxury waterfront villa with private beach access', 2, 1),
('A103', 'available', 2500, 180000, 'Amwaj Floating City', 'Waterfront Villa A103', 3, 3, 'Luxury waterfront villa with private beach access', 3, 1),
('A104', 'reserved', 2500, 180000, 'Amwaj Floating City', 'Waterfront Villa A104', 3, 3, 'Luxury waterfront villa with private beach access', 4, 1),
('A105', 'available', 2500, 180000, 'Amwaj Floating City', 'Waterfront Villa A105', 3, 3, 'Luxury waterfront villa with private beach access', 5, 1),

-- Row 2 (Garden Villas)
('B201', 'available', 2200, 165000, 'Amwaj Floating City', 'Garden Villa B201', 3, 2, 'Spacious garden villa with landscaped yard', 1, 2),
('B202', 'available', 2200, 165000, 'Amwaj Floating City', 'Garden Villa B202', 3, 2, 'Spacious garden villa with landscaped yard', 2, 2),
('B203', 'sold', 2200, 165000, 'Amwaj Floating City', 'Garden Villa B203', 3, 2, 'Spacious garden villa with landscaped yard', 3, 2),
('B204', 'available', 2200, 165000, 'Amwaj Floating City', 'Garden Villa B204', 3, 2, 'Spacious garden villa with landscaped yard', 4, 2),
('B205', 'reserved', 2200, 165000, 'Amwaj Floating City', 'Garden Villa B205', 3, 2, 'Spacious garden villa with landscaped yard', 5, 2),

-- Row 3 (Executive Villas)
('C301', 'available', 3000, 220000, 'Amwaj Floating City', 'Executive Villa C301', 4, 4, 'Premium executive villa with home office', 1, 3),
('C302', 'available', 3000, 220000, 'Amwaj Floating City', 'Executive Villa C302', 4, 4, 'Premium executive villa with home office', 2, 3),
('C303', 'available', 3000, 220000, 'Amwaj Floating City', 'Executive Villa C303', 4, 4, 'Premium executive villa with home office', 3, 3),
('C304', 'sold', 3000, 220000, 'Amwaj Floating City', 'Executive Villa C304', 4, 4, 'Premium executive villa with home office', 4, 3),
('C305', 'available', 3000, 220000, 'Amwaj Floating City', 'Executive Villa C305', 4, 4, 'Premium executive villa with home office', 5, 3),

-- Row 4 (Deluxe Villas)
('D401', 'available', 2800, 200000, 'Amwaj Floating City', 'Deluxe Villa D401', 4, 3, 'Deluxe villa with pool and outdoor kitchen', 1, 4),
('D402', 'reserved', 2800, 200000, 'Amwaj Floating City', 'Deluxe Villa D402', 4, 3, 'Deluxe villa with pool and outdoor kitchen', 2, 4),
('D403', 'available', 2800, 200000, 'Amwaj Floating City', 'Deluxe Villa D403', 4, 3, 'Deluxe villa with pool and outdoor kitchen', 3, 4),
('D404', 'available', 2800, 200000, 'Amwaj Floating City', 'Deluxe Villa D404', 4, 3, 'Deluxe villa with pool and outdoor kitchen', 4, 4),
('D405', 'sold', 2800, 200000, 'Amwaj Floating City', 'Deluxe Villa D405', 4, 3, 'Deluxe villa with pool and outdoor kitchen', 5, 4),

-- Row 5 (Standard Villas)
('E501', 'available', 2000, 145000, 'Amwaj Floating City', 'Standard Villa E501', 2, 2, 'Comfortable standard villa perfect for families', 1, 5),
('E502', 'available', 2000, 145000, 'Amwaj Floating City', 'Standard Villa E502', 2, 2, 'Comfortable standard villa perfect for families', 2, 5),
('E503', 'available', 2000, 145000, 'Amwaj Floating City', 'Standard Villa E503', 2, 2, 'Comfortable standard villa perfect for families', 3, 5),
('E504', 'reserved', 2000, 145000, 'Amwaj Floating City', 'Standard Villa E504', 2, 2, 'Comfortable standard villa perfect for families', 4, 5),
('E505', 'available', 2000, 145000, 'Amwaj Floating City', 'Standard Villa E505', 2, 2, 'Comfortable standard villa perfect for families', 5, 5),

-- Additional Diyar Al Muharraq Villas
('F601', 'under_construction', 3500, 280000, 'Diyar Al Muharraq', 'Luxury Villa F601', 5, 5, 'Ultra-luxury villa with private marina access', 1, 6),
('F602', 'under_construction', 3500, 280000, 'Diyar Al Muharraq', 'Luxury Villa F602', 5, 5, 'Ultra-luxury villa with private marina access', 2, 6),
('F603', 'available', 3500, 280000, 'Diyar Al Muharraq', 'Luxury Villa F603', 5, 5, 'Ultra-luxury villa with private marina access', 3, 6),
('F604', 'available', 3500, 280000, 'Diyar Al Muharraq', 'Luxury Villa F604', 5, 5, 'Ultra-luxury villa with private marina access', 4, 6),
('F605', 'reserved', 3500, 280000, 'Diyar Al Muharraq', 'Luxury Villa F605', 5, 5, 'Ultra-luxury villa with private marina access', 5, 6),

-- Diyar Islands Premium Villas
('G701', 'available', 4000, 350000, 'Diyar Islands', 'Premium Island Villa G701', 6, 6, 'Exclusive island villa with panoramic views', 1, 7),
('G702', 'available', 4000, 350000, 'Diyar Islands', 'Premium Island Villa G702', 6, 6, 'Exclusive island villa with panoramic views', 2, 7),
('G703', 'sold', 4000, 350000, 'Diyar Islands', 'Premium Island Villa G703', 6, 6, 'Exclusive island villa with panoramic views', 3, 7),
('G704', 'available', 4000, 350000, 'Diyar Islands', 'Premium Island Villa G704', 6, 6, 'Exclusive island villa with panoramic views', 4, 7),
('G705', 'available', 4000, 350000, 'Diyar Islands', 'Premium Island Villa G705', 6, 6, 'Exclusive island villa with panoramic views', 5, 7);;