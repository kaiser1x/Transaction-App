-- =====================================================
-- seed.sql — Demo data for Wayspend
-- NOTE: Update auth0_id for the admin user to match
--       your real Auth0 test account sub claim.
-- =====================================================

-- Admin user
INSERT INTO users (id, auth0_id, email, name, role) VALUES (
  'a1000000-0000-4000-8000-000000000001',
  'auth0|REPLACE_WITH_REAL_AUTH0_SUB',
  'admin@wayspend.dev',
  'Demo Admin',
  'admin'
);

-- Page 1: St. Luke's Medical Group (fixed $45)
INSERT INTO payment_pages (
  id, slug, title, description, header_msg, footer_msg,
  brand_color, amount_mode, fixed_amount, gl_codes, is_active, created_by
) VALUES (
  'b1000000-0000-4000-8000-000000000001',
  'st-lukes-copay',
  'St. Luke''s Medical Group',
  'Pay your medical copayment securely online.',
  'Welcome to St. Luke''s Medical Group Online Payment Portal',
  'Questions? Call our billing office at 1-800-555-0100',
  '#1a56db',
  'fixed',
  45.00,
  '["MED-001"]',
  TRUE,
  'a1000000-0000-4000-8000-000000000001'
);

-- Page 2: City Parking Authority (user-entered)
INSERT INTO payment_pages (
  id, slug, title, description, header_msg, footer_msg,
  brand_color, amount_mode, gl_codes, is_active, created_by
) VALUES (
  'b2000000-0000-4000-8000-000000000001',
  'city-parking',
  'City Parking Authority',
  'Pay your parking citation online. Avoid late fees.',
  'City of Waysville — Parking Enforcement Division',
  'Citations must be paid within 30 days of issue date.',
  '#dc2626',
  'user_entered',
  '["PARK-001","PARK-002"]',
  TRUE,
  'a1000000-0000-4000-8000-000000000001'
);

-- Custom fields: St. Luke's (page 1)
INSERT INTO custom_fields (id, page_id, label, field_type, options, required, placeholder, helper_text, display_order) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'Patient Name',       'text',     NULL,                                               TRUE,  'Jane Doe',    NULL,                        0),
  ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', 'Date of Birth',      'date',     NULL,                                               TRUE,  NULL,          NULL,                        1),
  ('c1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000001', 'Appointment Date',   'date',     NULL,                                               TRUE,  NULL,          NULL,                        2),
  ('c1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000001', 'Insurance Provider', 'dropdown', '["Aetna","BlueCross","Cigna","UHC","Self-Pay"]',    TRUE,  NULL,          'Select your primary insurance', 3);

-- Custom fields: City Parking (page 2)
INSERT INTO custom_fields (id, page_id, label, field_type, options, required, placeholder, helper_text, display_order) VALUES
  ('c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'License Plate',   'text', NULL, TRUE,  'ABC-1234',    'As shown on your vehicle',   0),
  ('c2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 'Citation Number', 'text', NULL, TRUE,  'CIT-000000',  'Found on your citation slip', 1),
  ('c2000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000001', 'Vehicle Make',    'text', NULL, FALSE, 'e.g. Toyota', NULL,                          2);

-- Transactions: St. Luke's (7 total: 5 success, 1 failed, 1 pending)
INSERT INTO transactions (id, page_id, amount, payment_method, status, stripe_intent_id, payer_name, payer_email, gl_code, created_at) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 45.00, 'credit_card', 'success', 'pi_test_seed_001', 'Alice Johnson',  'alice@example.com',  'MED-001', DATE_SUB(NOW(), INTERVAL 27 DAY)),
  ('d1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', 45.00, 'credit_card', 'success', 'pi_test_seed_002', 'Bob Martinez',   'bob@example.com',    'MED-001', DATE_SUB(NOW(), INTERVAL 21 DAY)),
  ('d1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000001', 45.00, 'credit_card', 'failed',  'pi_test_seed_003', 'Carol White',    'carol@example.com',  'MED-001', DATE_SUB(NOW(), INTERVAL 18 DAY)),
  ('d1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000001', 45.00, 'credit_card', 'success', 'pi_test_seed_004', 'David Lee',      'david@example.com',  'MED-001', DATE_SUB(NOW(), INTERVAL 14 DAY)),
  ('d1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000001', 45.00, 'credit_card', 'success', 'pi_test_seed_005', 'Emma Brown',     'emma@example.com',   'MED-001', DATE_SUB(NOW(), INTERVAL 9 DAY)),
  ('d1000000-0000-4000-8000-000000000006', 'b1000000-0000-4000-8000-000000000001', 45.00, 'credit_card', 'success', 'pi_test_seed_006', 'Frank Garcia',   'frank@example.com',  'MED-001', DATE_SUB(NOW(), INTERVAL 4 DAY)),
  ('d1000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000001', 45.00, 'credit_card', 'pending', NULL,               'Grace Kim',      'grace@example.com',  'MED-001', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Transactions: City Parking (5 total: 4 success, 1 failed)
INSERT INTO transactions (id, page_id, amount, payment_method, status, stripe_intent_id, payer_name, payer_email, gl_code, created_at) VALUES
  ('d2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 75.00,  'credit_card', 'success', 'pi_test_seed_007', 'Henry Chen',    'henry@example.com',   'PARK-001', DATE_SUB(NOW(), INTERVAL 25 DAY)),
  ('d2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 50.00,  'credit_card', 'success', 'pi_test_seed_008', 'Isabel Torres', 'isabel@example.com',  'PARK-002', DATE_SUB(NOW(), INTERVAL 19 DAY)),
  ('d2000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000001', 125.00, 'credit_card', 'failed',  'pi_test_seed_009', 'James Wilson',  'james@example.com',   'PARK-001', DATE_SUB(NOW(), INTERVAL 13 DAY)),
  ('d2000000-0000-4000-8000-000000000004', 'b2000000-0000-4000-8000-000000000001', 75.00,  'credit_card', 'success', 'pi_test_seed_010', 'Karen Scott',   'karen@example.com',   'PARK-002', DATE_SUB(NOW(), INTERVAL 7 DAY)),
  ('d2000000-0000-4000-8000-000000000005', 'b2000000-0000-4000-8000-000000000001', 50.00,  'credit_card', 'success', 'pi_test_seed_011', 'Liam Nguyen',   'liam@example.com',    'PARK-001', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Field responses: St. Luke's transactions
INSERT INTO field_responses (id, transaction_id, field_id, value) VALUES
  (UUID(), 'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Alice Johnson'),
  (UUID(), 'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', '1985-03-12'),
  (UUID(), 'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', '2026-03-26'),
  (UUID(), 'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000004', 'Aetna'),

  (UUID(), 'd1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'Bob Martinez'),
  (UUID(), 'd1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000002', '1990-07-22'),
  (UUID(), 'd1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000003', '2026-04-01'),
  (UUID(), 'd1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000004', 'BlueCross'),

  (UUID(), 'd1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'Carol White'),
  (UUID(), 'd1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002', '1978-11-05'),
  (UUID(), 'd1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000003', '2026-04-05'),
  (UUID(), 'd1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000004', 'Cigna'),

  (UUID(), 'd1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'David Lee'),
  (UUID(), 'd1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000002', '1995-01-30'),
  (UUID(), 'd1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000003', '2026-04-09'),
  (UUID(), 'd1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000004', 'UHC'),

  (UUID(), 'd1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000001', 'Emma Brown'),
  (UUID(), 'd1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000002', '1988-06-14'),
  (UUID(), 'd1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000003', '2026-04-14'),
  (UUID(), 'd1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000004', 'Aetna'),

  (UUID(), 'd1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', 'Frank Garcia'),
  (UUID(), 'd1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000002', '1972-09-03'),
  (UUID(), 'd1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000003', '2026-04-19'),
  (UUID(), 'd1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000004', 'Self-Pay'),

  (UUID(), 'd1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000001', 'Grace Kim'),
  (UUID(), 'd1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000002', '1993-04-18'),
  (UUID(), 'd1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000003', '2026-04-22'),
  (UUID(), 'd1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000004', 'BlueCross');

-- Field responses: City Parking transactions
INSERT INTO field_responses (id, transaction_id, field_id, value) VALUES
  (UUID(), 'd2000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'XYZ-9821'),
  (UUID(), 'd2000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000002', 'CIT-004421'),
  (UUID(), 'd2000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000003', 'Honda'),

  (UUID(), 'd2000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000001', 'ABC-1123'),
  (UUID(), 'd2000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'CIT-005502'),
  (UUID(), 'd2000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000003', 'Toyota'),

  (UUID(), 'd2000000-0000-4000-8000-000000000003', 'c2000000-0000-4000-8000-000000000001', 'DEF-3344'),
  (UUID(), 'd2000000-0000-4000-8000-000000000003', 'c2000000-0000-4000-8000-000000000002', 'CIT-006613'),

  (UUID(), 'd2000000-0000-4000-8000-000000000004', 'c2000000-0000-4000-8000-000000000001', 'GHI-7765'),
  (UUID(), 'd2000000-0000-4000-8000-000000000004', 'c2000000-0000-4000-8000-000000000002', 'CIT-007724'),
  (UUID(), 'd2000000-0000-4000-8000-000000000004', 'c2000000-0000-4000-8000-000000000003', 'Ford'),

  (UUID(), 'd2000000-0000-4000-8000-000000000005', 'c2000000-0000-4000-8000-000000000001', 'JKL-5512'),
  (UUID(), 'd2000000-0000-4000-8000-000000000005', 'c2000000-0000-4000-8000-000000000002', 'CIT-008835'),
  (UUID(), 'd2000000-0000-4000-8000-000000000005', 'c2000000-0000-4000-8000-000000000003', 'Chevrolet');
