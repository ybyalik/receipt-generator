-- =============================================
-- SUPABASE MIGRATION SCRIPT
-- Receipt Generator Database Setup
-- =============================================

-- 1. CREATE TABLES
-- =============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_plan TEXT,
  subscription_status TEXT,
  subscription_ends_at TIMESTAMP,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sections JSONB NOT NULL,
  settings JSONB NOT NULL,
  seo_content TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User templates table
CREATE TABLE IF NOT EXISTS user_templates (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  base_template_id INTEGER,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sections JSONB NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  featured_image TEXT,
  tags JSONB,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. INSERT USERS DATA
-- =============================================

INSERT INTO users (id, firebase_uid, email, display_name, photo_url, stripe_customer_id, stripe_subscription_id, subscription_plan, subscription_status, subscription_ends_at, is_premium, created_at, updated_at) VALUES
(1, '3i1tP9cHKYY7WEkRf3FGKspoDK63', 'ybyalik@gmail.com', 'Yury Byalik', 'https://lh3.googleusercontent.com/a/ACg8ocI5Ahml7kLbERiCpZqC63SyKeNXXZd2RbUdhXicT91b8acCXuk=s96-c', NULL, NULL, NULL, NULL, NULL, TRUE, '2025-10-29T03:01:59.825Z', '2025-10-29T03:03:02.242Z'),
(2, 'T9Ix7uMwxtdDKsntehG4Y4WEtN33', 'info@onbiz.com', 'Yury Byalik', 'https://lh3.googleusercontent.com/a/ACg8ocILWGBCLw5DodISZT4RIZyaajOzXYO1cYTb-UbBwzfMJBgafw=s96-c', 'cus_TK6WAsMXdANI2w', NULL, NULL, NULL, NULL, FALSE, '2025-10-29T03:02:23.268Z', '2025-11-25T04:26:59.064Z'),
(3, '5JNhhMqSICR8Pb5cisaNBl4xuu93', 'contact@bridgethegap.ai', 'Yury Byalik', 'https://lh3.googleusercontent.com/a/ACg8ocIIGtjeQQT4K3uLFvgMA2fQ4qDijCzjhrb1G5DeEI0qKs0ccw=s96-c', 'cus_TUCF9lF7ggllm9', 'sub_1SXI16E8GlgR6v5NQvVQOqps', 'weekly', 'canceled', NULL, FALSE, '2025-11-25T04:27:36.364Z', '2025-11-25T10:02:30.119Z'),
(5, 'T6A8lG4v9BfrH9UO6Z582DKRDJ52', 'sales@faithandglory.com', 'Yury Byalik', 'https://lh3.googleusercontent.com/a/ACg8ocIRTwj8FJ9rYcyEIS4u8Pm0AZjeo4X4JLrCytUhtPcvDzxfag=s96-c', 'cus_TUH7XyJYpjpcU7', 'sub_1SXIZUE8GlgR6v5NefG91QWd', 'weekly', 'canceled', NULL, FALSE, '2025-11-25T09:29:05.582Z', '2025-11-25T09:33:43.585Z'),
(6, 'eC0720y0M1QQbAzGWiFvwRswNX52', 'xx153800800@gmail.com', 'griz', 'https://lh3.googleusercontent.com/a/ACg8ocLOTHA-yTyi_SjTqcsGRq2TdzHuJQrUw3w-Rii_ZLGGn-q9704w=s96-c', 'cus_TYIjEvYgLslO9u', 'sub_1SbC8wE8GlgR6v5NN9htd7PH', 'weekly', 'active', NULL, TRUE, '2025-12-06T03:26:17.075Z', '2026-01-31T03:29:23.128Z'),
(7, 'ABGH6LeVExQ635cJDNvO3GE8bn02', 'eidmalik330@gmail.com', 'Malik Eid', 'https://lh3.googleusercontent.com/a/ACg8ocLqfJqToun6OOrQuljxe9o5Uv_EIU0E8AsiLmirBmAfFXYs=s96-c', NULL, NULL, NULL, NULL, NULL, FALSE, '2025-12-15T09:21:32.778Z', '2025-12-15T09:21:32.778Z'),
(8, 'nGjpYQleQiSSq44mAFvacxkcYZB2', 'blakopsbiz@gmail.com', 'ten gordon', 'https://lh3.googleusercontent.com/a/ACg8ocINfe5iEQ8ZQFw6c4xhovKwJAoREnkFJ1YApfQWZcGN6_PZxQ=s96-c', 'cus_TdWvF1PeblKOPK', 'sub_1SgFteE8GlgR6v5NoU58RGVi', 'monthly', 'active', NULL, TRUE, '2025-12-20T02:26:13.029Z', '2026-01-20T02:27:53.316Z'),
(9, 'pSYwpLLTdbbokXJ6vblixxVTp8p1', 'codemen.almubin@gmail.com', 'Abdullah al mubin', 'https://lh3.googleusercontent.com/a/ACg8ocIkQcsYix5Do0jMzYbPwVPtJ0ej3XF9RsKvk5J-ukdggiu3Cw=s96-c', NULL, NULL, NULL, NULL, NULL, FALSE, '2025-12-26T21:45:44.502Z', '2025-12-26T21:45:44.502Z'),
(10, 'xRWNEH5H7CUaEVCB1EAD8Okvqp82', 'voxpuppylie@gmail.com', 'Vox Puppy lie', 'https://lh3.googleusercontent.com/a/ACg8ocJTYGo2a5w7-BM-e3nN0qHNE5WkKPT3K27iUTxT0WYDH15exA=s96-c', NULL, NULL, NULL, NULL, NULL, FALSE, '2026-01-03T11:30:52.827Z', '2026-01-03T11:30:52.827Z'),
(11, 'y1AVBa60BmSlTjJeFyQsWtjKvOp2', 'leelouleelou7@gmail.com', 'Leelou', 'https://lh3.googleusercontent.com/a/ACg8ocKIxtMrmu0H26uTmUjzE8FFGyuFSONx4fcqNf77_3hd-O4JgA=s96-c', NULL, NULL, NULL, NULL, NULL, FALSE, '2026-01-06T10:36:46.748Z', '2026-01-06T10:36:46.748Z'),
(12, 'tOiRid7uGIaniyMiFK5ZdhR1DkQ2', 'stinkerella17@gmail.com', 'Lux Lisbonn', 'https://lh3.googleusercontent.com/a/ACg8ocLmH3m1wjgT1JJFsb8hR48q8I7-ErkM0T771LLii4fCC218Hw=s96-c', 'cus_TnJv8sASk8D1BI', 'sub_1SpjICE8GlgR6v5NChbHXnOV', 'weekly', 'active', NULL, TRUE, '2026-01-15T05:39:45.442Z', '2026-02-05T05:41:05.662Z');

-- Reset users sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- =============================================
-- 3. INSERT USER_TEMPLATES DATA
-- =============================================

INSERT INTO user_templates (id, user_id, base_template_id, name, slug, sections, settings, created_at, updated_at) VALUES
(1, 'T9Ix7uMwxtdDKsntehG4Y4WEtN33', 16, 'onbiz test 1', 'onbiz-test-1-1761702944387', '[{"id":"header-1","type":"header","logoSize":50,"alignment":"center","dividerStyle":"dashed","businessDetails":"ONBIZ TEST 1","dividerAtBottom":true},{"id":"message-1","type":"custom_message","message":"Computer Repair Receipt\nReceipt #: QRP-2047","alignment":"left","dividerStyle":"dashed","dividerAtBottom":true},{"id":"items-1","tax":{"title":"Tax","value":8.25},"type":"items_list","items":[{"item":"Laptop Virus Removal","price":120,"quantity":1},{"item":"SSD Upgrade (500GB)","price":150,"quantity":1},{"item":"System Tune-up & Diagnostics","price":75,"quantity":1}],"total":{"price":373.46,"title":"Total"},"totalLines":[{"title":"Subtotal","value":345},{"title":"Tax (8.25%)","value":28.46}],"dividerStyle":"dashed","dividerAtBottom":true},{"id":"payment-1","type":"payment","cardFields":[{"title":"Card number","value":"**** **** **** 4922"},{"title":"Card type","value":"Debit"},{"title":"Card entry","value":"Chip"},{"title":"Date/time","value":"11/20/2019 11:09 AM"},{"title":"Reference #","value":"62845289260246240685C"},{"title":"Status","value":"APPROVED"}],"cashFields":[{"title":"Cash Tendered","value":"$400.00"},{"title":"Change","value":"$26.54"}],"paymentType":"card","dividerStyle":"dashed","dividerAtBottom":true},{"id":"datetime-1","date":"5/24/2025, 8:02:48 AM","type":"date_time","alignment":"left","dividerStyle":"dashed","dividerAtBottom":false},{"id":"barcode-1","size":2,"type":"barcode","value":"1234567890128","length":13,"dividerStyle":"dashed","dividerAtBottom":false}]', '{"font":"mono","currency":"$","textColor":"#000000","currencyFormat":"symbol_before","backgroundTexture":"texture1"}', '2025-10-29T01:55:45.335Z', '2025-10-29T01:55:45.335Z'),
(2, 'tOiRid7uGIaniyMiFK5ZdhR1DkQ2', 40, 'My Mechanic Receipt', 'my-mechanic-receipt-1768458205343', '[{"id":"header-1763106272649","logo":"https://receipt-generator-net.s3.us-east-1.amazonaws.com/logos/mechanic-receipt.png","type":"header","logoSize":50,"alignment":"center","dividerStyle":"stars","businessDetails":"AutoFix Garage\n1234 Elm Street\nSpringfield, IL 62704\nUSA\n(217) 555-7890\nsupport@autofixgarage.com","dividerAtBottom":true},{"id":"title-1763106272649","type":"custom_message","message":"Mechanic Receipt","alignment":"center","dividerStyle":"dotted","dividerAtBottom":true},{"id":"barcode-middle-1763106272649","size":2,"type":"barcode","value":"1234567890123","length":13,"dividerStyle":"dotted","dividerAtBottom":false},{"id":"customer-1763106272649","type":"custom_message","message":"Customer Information:\nName: Lauren Mitchell \nAddress: 1282 west Clark Street Upland CA 91784\nVehicle: 2021 Toyota Camry (Tan)\nMileage In: 78,463\nMileage Out: 78,464","alignment":"right","dividerStyle":"stars","dividerAtBottom":true},{"id":"items_list-1763106272649","tax":null,"type":"items_list","items":[{"item":"Oil Change","price":39.99,"quantity":1},{"item":"Brake Pad Replacement","price":129.99,"quantity":1},{"item":"Wheel Alignment","price":89.99,"quantity":1},{"item":"Battery Replacement","price":119.99,"quantity":1}],"total":{"price":411.30670000000003,"title":"Total"},"totalLines":[{"title":"Subtotal","value":379.96000000000004},{"title":"Tax","value":31.346700000000006}],"dividerAfterItems":true,"dividerAfterTotal":true,"dividerAfterItemsStyle":"double","dividerAfterTotalStyle":"dotted"},{"id":"payment-1763106272649","type":"payment","cardFields":[{"title":"Card number","value":"**** **** **** 4822"},{"title":"Card type","value":"Debit"},{"title":"Card entry","value":"Chip"},{"title":"Date/time","value":"11/14/2025, 07:44 AM"},{"title":"Reference #","value":"REF534792235"},{"title":"Status","value":"APPROVED"}],"cashFields":[{"title":"Cash Tendered","value":"$431.31"},{"title":"Change","value":"$20.00"}],"paymentType":"card","dividerStyle":"double","dividerAtBottom":true},{"id":"website-1763106272649","type":"custom_message","message":"www.autofixgarage.com","alignment":"center","dividerStyle":"double","dividerAtBottom":true},{"id":"footer-1763106272649","type":"custom_message","message":"Customers are encouraged to review their receipts immediately and report any discrepancies within 7 days.\n\nThank you for choosing AutoFix Garage.","alignment":"right","dividerStyle":"dashed","dividerAtBottom":true},{"id":"barcode-1768458129244","size":2,"type":"barcode","value":"1234567890123","length":60,"dividerStyle":"dashed","dividerAtBottom":true}]', '{"font":"courier-new","currency":"$","textColor":"#000000","currencyFormat":"symbol_before","backgroundTexture":"none"}', '2026-01-15T06:23:26.294Z', '2026-01-15T06:23:26.294Z'),
(3, 'tOiRid7uGIaniyMiFK5ZdhR1DkQ2', 16, 'My Computer Repair Receipt998', 'my-computer-repair-receipt998-1768825925948', '[{"id":"header-1","type":"header","logoSize":50,"alignment":"center","dividerStyle":"dashed","businessDetails":"Bob''s CB Radio Shop\n21232 Route 322\nStrattanville, PA 16258\n814-980-2013 \nReceipt #93578","dividerAtBottom":true},{"id":"items-1","tax":{"title":"Tax","value":8.25},"type":"items_list","items":[{"item":"Garmin DEZL Bluetooth Headset 110 ","price":345,"quantity":1}],"total":{"price":373.46,"title":"Total"},"totalLines":[{"title":"Subtotal","value":345},{"title":"Tax (8.25%)","value":28.46}],"dividerStyle":"dashed","dividerAtBottom":true},{"id":"payment-1","type":"payment","cardFields":[{"title":"Card number","value":"**** **** **** 9583"},{"title":"Card type","value":"VISA CREDIT"},{"title":"Card entry","value":"Chip"},{"title":"Date/time","value":"01/07/2026 9:56AM"},{"title":"Status","value":"APPROVED"}],"cashFields":[{"title":"Cash Tendered","value":"$400.00"},{"title":"Change","value":"$26.54"}],"paymentType":"card","dividerStyle":"dashed","dividerAtBottom":true},{"id":"datetime-1","date":"2026-01-07T17:56:00.000Z","type":"date_time","alignment":"left","dividerStyle":"dashed","dividerAtBottom":false},{"id":"barcode-1","size":3.6,"type":"barcode","value":"1234567890128","length":110,"dividerStyle":"dashed","dividerAtBottom":false}]', '{"font":"mono","currency":"$","textColor":"#000000","currencyFormat":"symbol_before","backgroundTexture":"texture1"}', '2026-01-19T12:32:06.683Z', '2026-01-19T12:41:15.695Z'),
(4, 'tOiRid7uGIaniyMiFK5ZdhR1DkQ2', 63, 'Ere', 'ere-1769307914757', '[{"id":"header-1764043746057","logo":"https://receipt-generator-net.s3.us-east-1.amazonaws.com/logos/sears-receipt.png","type":"header","logoSize":50,"alignment":"center","dividerStyle":"dashed","businessDetails":"Sears Home & Appliance Center\n1234 Mall Drive\nSpringfield, IL 62701\nUSA\n(217) 555-7890\nsupport@searsappliance.com","dividerAtBottom":true},{"id":"title-1764043746057","type":"custom_message","message":"Sears Receipt","alignment":"right","dividerStyle":"dashed","dividerAtBottom":true},{"id":"barcode-middle-1764043746057","size":2,"type":"barcode","value":"1234567890123","length":13,"dividerStyle":"dotted","dividerAtBottom":false},{"id":"customer-1764043746057","type":"custom_message","message":"Customer: Customer Name\nPhone: (555) 987-6543","alignment":"center","dividerStyle":"dotted","dividerAtBottom":true},{"id":"items_list-1764043746057","tax":null,"type":"items_list","items":[{"item":"Kenmore Washer","price":399.99,"quantity":1},{"item":"Craftsman Tool Set","price":89.99,"quantity":1},{"item":"Refrigerator Water Filter","price":29.99,"quantity":2},{"item":"Whirlpool Dryer Belt","price":15.99,"quantity":1}],"total":{"price":612.640875,"title":"Total"},"totalLines":[{"title":"Subtotal","value":565.95},{"title":"Tax","value":46.690875000000005}],"dividerAfterItems":true,"dividerAfterTotal":true,"dividerAfterItemsStyle":"dotted","dividerAfterTotalStyle":"dotted"},{"id":"payment-1764043746057","type":"payment","cardFields":[{"title":"Card number","value":"**** **** **** 4822"},{"title":"Card type","value":"Debit"},{"title":"Card entry","value":"Chip"},{"title":"Date/time","value":"11/25/2025, 04:09 AM"},{"title":"Reference #","value":"REF760886564"},{"title":"Status","value":"APPROVED"}],"cashFields":[{"title":"Cash Tendered","value":"$632.64"},{"title":"Change","value":"$20.00"}],"paymentType":"card","dividerStyle":"dashed","dividerAtBottom":true},{"id":"website-1764043746057","type":"custom_message","message":"www.searsappliance.com","alignment":"center","dividerStyle":"double","dividerAtBottom":false},{"id":"footer-1764043746057","type":"custom_message","message":"We appreciate your business!\nVisit us again soon.","alignment":"center","dividerStyle":"dotted","dividerAtBottom":true},{"id":"date_time-1764043746057","date":"2025-11-25T04:09:06.058Z","type":"date_time","alignment":"center","dateFormat":"MMMM d, yyyy h:mm a","dividerStyle":"stars","dividerAtBottom":false}]', '{"font":"ocrb-receipt","currency":"$","textColor":"#000000","currencyFormat":"symbol_before","backgroundTexture":"none"}', '2026-01-25T02:25:14.408Z', '2026-01-25T02:25:14.408Z'),
(5, 'tOiRid7uGIaniyMiFK5ZdhR1DkQ2', 24, 'My Bookstore Receipta', 'my-bookstore-receipta-1769458714674', '[{"id":"header-1761840090184","type":"header","logoSize":76,"alignment":"center","dividerStyle":"dashed","businessDetails":"L&M Fleet Supply\n10680 State Hwy 27/77\nHayward WI 54843\n719-934-2300","dividerAtBottom":true},{"id":"items_list-1761840090184","tax":null,"type":"items_list","items":[{"item":"Hardcover - ''The Great Gatsby''","price":24.99,"quantity":3}],"total":{"price":73.5667,"title":"Total"},"totalLines":[{"title":"Subtotale","value":67.96},{"title":"Tax","value":5.6067}],"dividerAfterItems":true,"dividerAfterTotal":false,"dividerAfterItemsStyle":"double","dividerAfterTotalStyle":"dotted"},{"id":"payment-1761840090184","type":"payment","cardFields":[{"title":"Card number","value":"**** **** **** 4822"},{"title":"Card type","value":"Debit"},{"title":"Card entry","value":"Chip"},{"title":"Date/time","value":"10/30/2025, 04:01 PM"},{"title":"Reference #","value":"REF409352202"},{"title":"Status","value":"APPROVED"}],"cashFields":[{"title":"Cash Tendered","value":"$93.57"},{"title":"Change","value":"$20.00"}],"paymentType":"card","dividerStyle":"dotted","dividerAtBottom":false},{"id":"website-1761840090184","type":"custom_message","message":"www.literarycorner.com","alignment":"center","dividerStyle":"dashed","dividerAtBottom":false},{"id":"footer-1761840090184","type":"custom_message","message":"Thank you for your business!\nTransaction # 897468","alignment":"left","dividerStyle":"dotted","dividerAtBottom":false},{"id":"date_time-1761840090184","date":"2026-01-11T08:01:00.000Z","type":"date_time","alignment":"left","dateFormat":"M/d/yyyy, h:mm:ss a","dividerStyle":"dashed","dividerAtBottom":false}]', '{"font":"receipt","currency":"$","textColor":"#000000","currencyFormat":"symbol_before","backgroundTexture":"none"}', '2026-01-26T20:18:33.776Z', '2026-01-26T20:30:02.696Z');

-- Reset user_templates sequence
SELECT setval('user_templates_id_seq', (SELECT MAX(id) FROM user_templates));

-- =============================================
-- TEMPLATES DATA NEEDS TO BE IMPORTED SEPARATELY
-- Due to the large SEO content, please use the
-- Node.js import script: import-templates.js
-- =============================================

-- After running this SQL, run:
-- node import-templates.js

