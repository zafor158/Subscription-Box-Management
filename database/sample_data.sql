-- Sample data for testing the Subscription Box Management Platform
-- Run this after creating the schema

-- Sample users (passwords are hashed versions of 'password123')
INSERT INTO users (email, password_hash, first_name, last_name, stripe_customer_id) VALUES
('john.doe@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K5K5K.', 'John', 'Doe', 'cus_sample1'),
('jane.smith@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K5K5K.', 'Jane', 'Smith', 'cus_sample2'),
('bob.wilson@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K5K5K.', 'Bob', 'Wilson', 'cus_sample3')
ON CONFLICT (email) DO NOTHING;

-- Sample subscriptions
INSERT INTO subscriptions (user_id, plan_id, stripe_subscription_id, status, current_period_start, current_period_end) VALUES
(1, 1, 'sub_sample1', 'active', '2024-01-01 00:00:00', '2024-02-01 00:00:00'),
(2, 2, 'sub_sample2', 'active', '2024-01-15 00:00:00', '2024-02-15 00:00:00'),
(3, 3, 'sub_sample3', 'canceled', '2024-01-01 00:00:00', '2024-02-01 00:00:00')
ON CONFLICT (stripe_subscription_id) DO NOTHING;

-- Sample payments
INSERT INTO payments (user_id, subscription_id, stripe_payment_intent_id, amount, currency, status, payment_method) VALUES
(1, 1, 'pi_sample1', 29.99, 'usd', 'succeeded', 'card'),
(2, 2, 'pi_sample2', 49.99, 'usd', 'succeeded', 'card'),
(3, 3, 'pi_sample3', 79.99, 'usd', 'succeeded', 'card')
ON CONFLICT DO NOTHING;

-- Sample box history
INSERT INTO box_history (user_id, subscription_id, box_date, items, tracking_number, status) VALUES
(1, 1, '2024-01-15', '["Premium Coffee Beans", "Artisan Chocolate", "Tea Selection", "Snack Mix"]', 'TRK001', 'delivered'),
(2, 2, '2024-01-20', '["Gourmet Coffee", "Premium Chocolate", "Tea Collection", "Nuts Mix", "Cookies", "Coffee Mug"]', 'TRK002', 'delivered'),
(3, 3, '2024-01-10', '["Luxury Coffee", "Artisan Chocolate", "Premium Tea", "Gourmet Nuts", "Biscuits", "Coffee Grinder", "Tea Infuser", "Gift Box"]', 'TRK003', 'delivered')
ON CONFLICT DO NOTHING;
