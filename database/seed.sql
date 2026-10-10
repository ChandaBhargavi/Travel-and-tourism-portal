-- TravelGo Seed Data with Expanded Destinations, Packages, Coupons, and Reviews
USE travelgo;

-- Insert / Update Destinations
INSERT INTO destinations (id, name, description, image_url) VALUES
(1, 'Agra', 'Home to the iconic Taj Mahal, Agra offers a fascinating glimpse into Mughal grandeur and historical architecture.', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'),
(2, 'Jaipur', 'The Pink City of Rajasthan, famous for royal palaces, majestic forts, colorful bazaars, and rich heritage.', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80'),
(3, 'Goa', 'India''s premier beach destination with golden sands, nightlife, Portuguese architecture, and coastal vibe.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'),
(4, 'Kerala', 'God''s Own Country, celebrated for serene backwaters, lush tea plantations, coconut groves, and tranquil beaches.', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'),
(5, 'Manali', 'Nestled in the Himalayas, Manali offers breathtaking snow peaks, adventure sports, and scenic valleys.', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80'),
(6, 'Varanasi', 'The spiritual heart of India along the sacred Ganges, famous for ancient ghats, temples, and evening Ganga Aarti.', 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80'),
(7, 'Darjeeling', 'The Queen of the Hills, renowned for world-famous tea gardens, Kanchenjunga mountain views, and heritage Toy Train.', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'),
(8, 'Udaipur', 'The City of Lakes, known for its romantic Lake Palace, stunning architecture, and royal heritage of Rajasthan.', 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80'),
(9, 'Leh Ladakh', 'The Land of High Passes, featuring turquoise Pangong Lake, Nubra Valley sand dunes, and thrilling road trip passes.', 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80'),
(10, 'Andaman Islands', 'Tropical paradise with pristine white-sand beaches, crystal clear waters, coral reefs, and exciting water sports.', 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80')
ON DUPLICATE KEY UPDATE 
    name=VALUES(name),
    description=VALUES(description), 
    image_url=VALUES(image_url);

-- Insert / Update Packages
INSERT INTO packages (id, destination_id, title, description, duration_days, duration_nights, price, image_url, is_active) VALUES
(1, 1, 'Agra Heritage Tour', 'Explore the magnificent Taj Mahal, Agra Fort, and Mehtab Bagh with expert guided tours and comfortable hotel stays.', 2, 1, 5999.00, 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80', TRUE),
(2, 2, 'Jaipur Royal Tour', 'Experience royal Rajasthani hospitality, Amber Fort light show, City Palace, and traditional cuisine.', 3, 2, 7999.00, 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80', TRUE),
(3, 3, 'Goa Beach Holiday', 'Relax on sun-kissed beaches, enjoy water sports, spice plantation tours, and vibrant sunset cruises in North & South Goa.', 4, 3, 9999.00, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80', TRUE),
(4, 4, 'Kerala Escape', 'Unwind on a luxury houseboat cruise through Alleppey backwaters and explore the tea hills of Munnar.', 4, 3, 8999.00, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80', TRUE),
(5, 5, 'Manali Snow & Adventure', 'Enjoy snow activities in Solang Valley, visit Hadimba Temple, Rohtang Pass, and scenic pine forests.', 5, 4, 12999.00, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80', TRUE),
(6, 6, 'Varanasi Spiritual Journey', 'Witness the magical evening Ganga Aarti, morning boat ride on the Ganges, and ancient temple walking tours.', 3, 2, 6499.00, 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80', TRUE),
(7, 7, 'Darjeeling Tea & Toy Train', 'Watch sunrise over Kanchenjunga from Tiger Hill, ride the Himalayan Toy Train, and visit lush tea estates.', 4, 3, 10499.00, 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', TRUE),
(8, 8, 'Udaipur Royal Lakes', 'Boat ride on Lake Pichola, visit City Palace, Saheliyon Ki Bari, and enjoy fine lakeside dining.', 3, 2, 8999.00, 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80', TRUE),
(9, 9, 'Ladakh High Pass Expedition', 'Cross Khardung La, camp near blue Pangong Lake, and experience double-hump camel rides in Nubra Valley.', 6, 5, 18999.00, 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80', TRUE),
(10, 10, 'Andaman Island & Scuba Dive', 'Visit Havelock Island, Radhanagar Beach, Elephant Beach, and enjoy scuba diving & snorkeling in coral reefs.', 5, 4, 16499.00, 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80', TRUE)
ON DUPLICATE KEY UPDATE 
    destination_id=VALUES(destination_id),
    title=VALUES(title), 
    description=VALUES(description), 
    duration_days=VALUES(duration_days),
    duration_nights=VALUES(duration_nights),
    price=VALUES(price),
    image_url=VALUES(image_url),
    is_active=VALUES(is_active);

-- Insert Promo Coupons
INSERT INTO coupons (id, code, discount_type, discount_value, min_booking_amount, is_active) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 3000.00, TRUE),
(2, 'HOLIDAY1000', 'fixed', 1000.00, 5000.00, TRUE),
(3, 'SUMMER20', 'percentage', 20.00, 8000.00, TRUE)
ON DUPLICATE KEY UPDATE 
    discount_type=VALUES(discount_type),
    discount_value=VALUES(discount_value),
    min_booking_amount=VALUES(min_booking_amount),
    is_active=VALUES(is_active);

-- Insert Package Reviews
INSERT INTO reviews (id, package_id, user_name, rating, comment) VALUES
(1, 1, 'Priya Sharma', 5, 'The Taj Mahal sunrise tour was breathtaking! Highly recommend this package.'),
(2, 1, 'Amit Verma', 4, 'Great itinerary and comfortable hotel stays in Agra.'),
(3, 3, 'Rohan Kapoor', 5, 'Goa beaches and sunset cruise were amazing! Smooth booking process.'),
(4, 3, 'Sneha Patel', 5, 'Unforgettable beach holiday! The hotel was right next to Baga beach.'),
(5, 4, 'David Miller', 5, 'The Alleppey houseboat experience in Kerala was serene and heavenly!'),
(6, 5, 'Ananya Roy', 5, 'Solang Valley snow sports in Manali were thrilling! Best family trip ever.'),
(7, 9, 'Vikram Singh', 5, 'Pangong Lake in Ladakh is stunning beyond words! Unbelievable journey.'),
(8, 10, 'Kavita Das', 5, 'Scuba diving in Havelock Island was an unforgettable memory!')
ON DUPLICATE KEY UPDATE 
    rating=VALUES(rating),
    comment=VALUES(comment);
