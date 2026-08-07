-- =============================================================
--  KidaMerch – Database Seed
--  Matches the hardcoded catalog in src/data/products.ts
-- =============================================================

-- Use a fixed namespace UUID so seeds are deterministic / idempotent.
-- Namespace: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' (URL namespace from RFC 4122)

-- Clean existing seed data (order matters for FK constraints)
truncate order_items, orders, product_images, product_variants, products cascade;

-- ─────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────

insert into products (id, name, description, base_price, category, anime_series, is_active, created_at) values
  -- Apparel
  ('a0000001-0000-0000-0000-000000000001', 'Ronin Heavyweight Hoodie',
   '480gsm loopback cotton, boxed shoulder, and a single hand-pulled brushstroke across the chest. Garment-dyed in small batches so no two drops match exactly.',
   128.00, 'Apparel', NULL, true, '2026-07-28T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000005', 'Nightfall Boxy Tee',
   'Heavy 260gsm jersey with a dropped shoulder and cropped body. Screen-printed back panel, minimal front hit.',
   68.00, 'Apparel', NULL, true, '2026-07-26T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000009', 'Shadowline Work Jacket',
   'Waxed cotton chore jacket with corozo buttons, storm cuffs, and a crimson bar-tack at the hem.',
   218.00, 'Apparel', NULL, true, '2026-06-30T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000013', 'Duel Panel Crewneck',
   'Brushed-back fleece crewneck with a spliced panel construction and ribbed side gussets.',
   112.00, 'Apparel', NULL, true, '2026-06-14T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000017', 'Drop Zero Cargo Pant',
   'Relaxed ripstop cargo with articulated knees, cinch hems, and six pockets.',
   164.00, 'Apparel', NULL, true, '2026-05-28T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000022', 'Sentinel Varsity Jacket',
   'Melton wool body, leather sleeves, chenille patchwork, and a quilted satin lining.',
   298.00, 'Apparel', NULL, true, '2026-05-08T00:00:00Z'),

  -- Figures
  ('a0000001-0000-0000-0000-000000000002', 'Crimson Blade 1/7 Statue',
   'Hand-painted polystone statue on a machined base. 24cm tall with dual-blade stance and a matte lacquer finish that holds shadow beautifully.',
   289.00, 'Figures', NULL, true, '2026-07-30T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000006', 'Silent Vigil Deluxe Figure',
   'Articulated 1/9 scale collector figure with three swappable hands, a fabric cape, and a display stand milled from aluminium.',
   214.00, 'Figures', NULL, false, '2026-07-12T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000010', 'Wandering Scholar Mini',
   '10cm hand-cast resin mini with a hand-finished patina. Weighted base, no assembly required.',
   74.00, 'Figures', NULL, true, '2026-06-26T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000014', 'Oni Mask Wall Bust',
   'Wall-mounted resin bust with a hand-lacquered finish. Includes flush-mount hardware.',
   168.00, 'Figures', NULL, true, '2026-06-10T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000018', 'Twin Blade Diorama',
   'Full diorama scene with LED underlighting, two figures, and a sculpted rock base. Assembled to order.',
   342.00, 'Figures', NULL, true, '2026-05-24T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000023', 'Ember Lantern Figure',
   '1/12 scale figure holding a translucent resin lantern that catches warm light.',
   132.00, 'Figures', NULL, true, '2026-05-04T00:00:00Z'),

  -- Prints
  ('a0000001-0000-0000-0000-000000000003', 'Impact Frame Risograph Print',
   'Two-colour risograph on 300gsm cotton rag. Halftone speed lines and one confident stroke of crimson. Signed and numbered on the reverse.',
   46.00, 'Prints', NULL, true, '2026-07-20T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000008', 'Ink Study Triptych',
   'Three-panel giclée set exploring negative space and single-stroke composition. Sold as a matched edition of 150.',
   92.00, 'Prints', NULL, true, '2026-07-04T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000012', 'Speedline Offset Poster',
   'Large-format offset poster on uncoated stock. Ships rolled in a rigid tube.',
   28.00, 'Prints', NULL, true, '2026-06-18T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000016', 'Quiet City Screenprint',
   'Four-layer screenprint of an empty midnight street. Deep blacks, one crimson streetlight.',
   58.00, 'Prints', NULL, true, '2026-06-02T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000020', 'Storyboard Zine Vol. 2',
   '64-page saddle-stitched zine of process sketches, layouts, and panel studies.',
   24.00, 'Prints', NULL, true, '2026-05-16T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000024', 'Grid Study Letterpress',
   'Blind-deboss letterpress on heavy cotton stock. Sculptural, almost textless.',
   68.00, 'Prints', NULL, true, '2026-04-30T00:00:00Z'),

  -- Accessories
  ('a0000001-0000-0000-0000-000000000004', 'Sigil Enamel Pin Set',
   'Six hard-enamel pins in blackened brass with rubber clutch backs. Comes carded on recycled board.',
   32.00, 'Accessories', NULL, true, '2026-07-18T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000007', 'Brushwork 6-Panel Cap',
   'Unstructured washed twill cap with tonal embroidery and a woven inner label. Adjustable metal clasp.',
   54.00, 'Accessories', NULL, true, '2026-07-08T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000011', 'Keeper Canvas Tote',
   '16oz natural canvas tote with reinforced webbing handles, interior pocket, and a discreet screen print.',
   48.00, 'Accessories', NULL, true, '2026-06-22T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000015', 'Cast Chain Necklace',
   'Stainless steel curb chain with a cast pendant and a lobster clasp. 55cm length.',
   88.00, 'Accessories', NULL, false, '2026-06-06T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000019', 'Utility Belt Bag',
   'Cordura belt bag with a magnetic buckle, three internal dividers, and a webbing strap.',
   96.00, 'Accessories', NULL, true, '2026-05-20T00:00:00Z'),

  ('a0000001-0000-0000-0000-000000000021', 'Monochrome Knit Scarf',
   'Lambswool scarf with a fine intarsia stripe and hand-knotted fringe.',
   76.00, 'Accessories', NULL, true, '2026-05-12T00:00:00Z');


-- ─────────────────────────────────────────────
-- PRODUCT VARIANTS
-- ─────────────────────────────────────────────

-- Ronin Heavyweight Hoodie — Apparel sizes
insert into product_variants (id, product_id, size, color, design, sku, price_override, stock) values
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'XS', NULL, NULL, 'RONIN-HOODIE-XS', NULL, 8),
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'S',  NULL, NULL, 'RONIN-HOODIE-S',  NULL, 15),
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'M',  NULL, NULL, 'RONIN-HOODIE-M',  NULL, 22),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'L',  NULL, NULL, 'RONIN-HOODIE-L',  NULL, 18),
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'XL', NULL, NULL, 'RONIN-HOODIE-XL', NULL, 10),
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 'XXL',NULL, NULL, 'RONIN-HOODIE-XXL',NULL, 5);

-- Nightfall Boxy Tee — Apparel sizes
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000005', 'XS', 'NIGHTFALL-TEE-XS', 12),
  ('b0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000005', 'S',  'NIGHTFALL-TEE-S',  20),
  ('b0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000005', 'M',  'NIGHTFALL-TEE-M',  25),
  ('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000005', 'L',  'NIGHTFALL-TEE-L',  20),
  ('b0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000005', 'XL', 'NIGHTFALL-TEE-XL', 14),
  ('b0000001-0000-0000-0000-000000000016', 'a0000001-0000-0000-0000-000000000005', 'XXL','NIGHTFALL-TEE-XXL',6);

-- Shadowline Work Jacket — Apparel sizes
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000021', 'a0000001-0000-0000-0000-000000000009', 'XS', 'SHADOW-JACKET-XS', 5),
  ('b0000001-0000-0000-0000-000000000022', 'a0000001-0000-0000-0000-000000000009', 'S',  'SHADOW-JACKET-S',  10),
  ('b0000001-0000-0000-0000-000000000023', 'a0000001-0000-0000-0000-000000000009', 'M',  'SHADOW-JACKET-M',  15),
  ('b0000001-0000-0000-0000-000000000024', 'a0000001-0000-0000-0000-000000000009', 'L',  'SHADOW-JACKET-L',  12),
  ('b0000001-0000-0000-0000-000000000025', 'a0000001-0000-0000-0000-000000000009', 'XL', 'SHADOW-JACKET-XL', 8),
  ('b0000001-0000-0000-0000-000000000026', 'a0000001-0000-0000-0000-000000000009', 'XXL','SHADOW-JACKET-XXL',3);

-- Duel Panel Crewneck — Apparel sizes
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000031', 'a0000001-0000-0000-0000-000000000013', 'XS', 'DUEL-CREW-XS', 10),
  ('b0000001-0000-0000-0000-000000000032', 'a0000001-0000-0000-0000-000000000013', 'S',  'DUEL-CREW-S',  18),
  ('b0000001-0000-0000-0000-000000000033', 'a0000001-0000-0000-0000-000000000013', 'M',  'DUEL-CREW-M',  22),
  ('b0000001-0000-0000-0000-000000000034', 'a0000001-0000-0000-0000-000000000013', 'L',  'DUEL-CREW-L',  16),
  ('b0000001-0000-0000-0000-000000000035', 'a0000001-0000-0000-0000-000000000013', 'XL', 'DUEL-CREW-XL', 9),
  ('b0000001-0000-0000-0000-000000000036', 'a0000001-0000-0000-0000-000000000013', 'XXL','DUEL-CREW-XXL',4);

-- Drop Zero Cargo Pant — Waist sizes
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000041', 'a0000001-0000-0000-0000-000000000017', '28', 'CARGO-28', 8),
  ('b0000001-0000-0000-0000-000000000042', 'a0000001-0000-0000-0000-000000000017', '30', 'CARGO-30', 14),
  ('b0000001-0000-0000-0000-000000000043', 'a0000001-0000-0000-0000-000000000017', '32', 'CARGO-32', 20),
  ('b0000001-0000-0000-0000-000000000044', 'a0000001-0000-0000-0000-000000000017', '34', 'CARGO-34', 16),
  ('b0000001-0000-0000-0000-000000000045', 'a0000001-0000-0000-0000-000000000017', '36', 'CARGO-36', 7);

-- Sentinel Varsity Jacket — Apparel sizes
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000051', 'a0000001-0000-0000-0000-000000000022', 'XS', 'SENTINEL-VARS-XS', 4),
  ('b0000001-0000-0000-0000-000000000052', 'a0000001-0000-0000-0000-000000000022', 'S',  'SENTINEL-VARS-S',  8),
  ('b0000001-0000-0000-0000-000000000053', 'a0000001-0000-0000-0000-000000000022', 'M',  'SENTINEL-VARS-M',  12),
  ('b0000001-0000-0000-0000-000000000054', 'a0000001-0000-0000-0000-000000000022', 'L',  'SENTINEL-VARS-L',  10),
  ('b0000001-0000-0000-0000-000000000055', 'a0000001-0000-0000-0000-000000000022', 'XL', 'SENTINEL-VARS-XL', 6),
  ('b0000001-0000-0000-0000-000000000056', 'a0000001-0000-0000-0000-000000000022', 'XXL','SENTINEL-VARS-XXL',2);

-- Crimson Blade 1/7 Statue — No variant (single default)
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000060', 'a0000001-0000-0000-0000-000000000002', 'CRIMSON-BLADE', 30);

-- Silent Vigil Deluxe Figure — No variant, out of stock (is_active = false)
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000061', 'a0000001-0000-0000-0000-000000000006', 'SILENT-VIGIL', 0);

-- Wandering Scholar Mini
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000062', 'a0000001-0000-0000-0000-000000000010', 'WANDER-SCHOLAR', 45);

-- Oni Mask Wall Bust
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000063', 'a0000001-0000-0000-0000-000000000014', 'ONI-MASK-BUST', 18);

-- Twin Blade Diorama
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000064', 'a0000001-0000-0000-0000-000000000018', 'TWIN-BLADE-DIO', 12);

-- Ember Lantern Figure
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000065', 'a0000001-0000-0000-0000-000000000023', 'EMBER-LANTERN', 25);

-- Impact Frame Risograph Print — Print sizes
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000070', 'a0000001-0000-0000-0000-000000000003', 'A3', 'IMPACT-RISO-A3', 40),
  ('b0000001-0000-0000-0000-000000000071', 'a0000001-0000-0000-0000-000000000003', 'A2', 'IMPACT-RISO-A2', 30),
  ('b0000001-0000-0000-0000-000000000072', 'a0000001-0000-0000-0000-000000000003', 'A1', 'IMPACT-RISO-A1', 15);

-- Ink Study Triptych — Print sizes
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000073', 'a0000001-0000-0000-0000-000000000008', 'A3', 'INK-TRIP-A3', 25),
  ('b0000001-0000-0000-0000-000000000074', 'a0000001-0000-0000-0000-000000000008', 'A2', 'INK-TRIP-A2', 20),
  ('b0000001-0000-0000-0000-000000000075', 'a0000001-0000-0000-0000-000000000008', 'A1', 'INK-TRIP-A1', 10);

-- Speedline Offset Poster — A2, A1 only
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000076', 'a0000001-0000-0000-0000-000000000012', 'A2', 'SPEED-POST-A2', 50),
  ('b0000001-0000-0000-0000-000000000077', 'a0000001-0000-0000-0000-000000000012', 'A1', 'SPEED-POST-A1', 30);

-- Quiet City Screenprint — Print sizes
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000078', 'a0000001-0000-0000-0000-000000000016', 'A3', 'QUIET-CITY-A3', 20),
  ('b0000001-0000-0000-0000-000000000079', 'a0000001-0000-0000-0000-000000000016', 'A2', 'QUIET-CITY-A2', 15),
  ('b0000001-0000-0000-0000-000000000080', 'a0000001-0000-0000-0000-000000000016', 'A1', 'QUIET-CITY-A1', 8);

-- Storyboard Zine — No variant
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000081', 'a0000001-0000-0000-0000-000000000020', 'STORYBOARD-ZINE', 60);

-- Grid Study Letterpress — A3, A2 only
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000082', 'a0000001-0000-0000-0000-000000000024', 'A3', 'GRID-LETTER-A3', 18),
  ('b0000001-0000-0000-0000-000000000083', 'a0000001-0000-0000-0000-000000000024', 'A2', 'GRID-LETTER-A2', 12);

-- Sigil Enamel Pin Set — No variant
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000090', 'a0000001-0000-0000-0000-000000000004', 'SIGIL-PIN-SET', 80);

-- Brushwork 6-Panel Cap — One Size
insert into product_variants (id, product_id, size, sku, stock) values
  ('b0000001-0000-0000-0000-000000000091', 'a0000001-0000-0000-0000-000000000007', 'One Size', 'BRUSH-CAP-OS', 35);

-- Keeper Canvas Tote — No variant
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000092', 'a0000001-0000-0000-0000-000000000011', 'KEEPER-TOTE', 42);

-- Cast Chain Necklace — No variant, out of stock (is_active = false)
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000093', 'a0000001-0000-0000-0000-000000000015', 'CAST-CHAIN', 0);

-- Utility Belt Bag — No variant
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000094', 'a0000001-0000-0000-0000-000000000019', 'UTIL-BELT-BAG', 28);

-- Monochrome Knit Scarf — No variant
insert into product_variants (id, product_id, sku, stock) values
  ('b0000001-0000-0000-0000-000000000095', 'a0000001-0000-0000-0000-000000000021', 'MONO-SCARF', 22);


-- ─────────────────────────────────────────────
-- PRODUCT IMAGES
-- Using placeholder URLs mapped to the local asset names.
-- Replace these with your actual Supabase Storage / CDN URLs.
-- ─────────────────────────────────────────────

-- Ronin Heavyweight Hoodie
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000001', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 0),
  ('a0000001-0000-0000-0000-000000000001', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129610/kidamerch/seed/hero-figure.jpg', 1);

-- Crimson Blade 1/7 Statue
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000002', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129605/kidamerch/seed/p-figure.jpg', 0),
  ('a0000001-0000-0000-0000-000000000002', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129610/kidamerch/seed/hero-figure.jpg', 1);

-- Impact Frame Risograph Print
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000003', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 0),
  ('a0000001-0000-0000-0000-000000000003', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 1);

-- Sigil Enamel Pin Set
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000004', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 0),
  ('a0000001-0000-0000-0000-000000000004', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 1);

-- Nightfall Boxy Tee
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000005', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 0),
  ('a0000001-0000-0000-0000-000000000005', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 1);

-- Silent Vigil Deluxe Figure
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000006', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129605/kidamerch/seed/p-figure.jpg', 0),
  ('a0000001-0000-0000-0000-000000000006', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 1);

-- Brushwork 6-Panel Cap
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000007', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 0),
  ('a0000001-0000-0000-0000-000000000007', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 1);

-- Ink Study Triptych
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000008', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 0),
  ('a0000001-0000-0000-0000-000000000008', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129605/kidamerch/seed/p-figure.jpg', 1);

-- Shadowline Work Jacket
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000009', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 0),
  ('a0000001-0000-0000-0000-000000000009', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129610/kidamerch/seed/hero-figure.jpg', 1);

-- Wandering Scholar Mini
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000010', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129605/kidamerch/seed/p-figure.jpg', 0),
  ('a0000001-0000-0000-0000-000000000010', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 1);

-- Keeper Canvas Tote
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000011', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 0),
  ('a0000001-0000-0000-0000-000000000011', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 1);

-- Speedline Offset Poster
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000012', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 0),
  ('a0000001-0000-0000-0000-000000000012', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 1);

-- Duel Panel Crewneck
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000013', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 0),
  ('a0000001-0000-0000-0000-000000000013', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129605/kidamerch/seed/p-figure.jpg', 1);

-- Oni Mask Wall Bust
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000014', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129605/kidamerch/seed/p-figure.jpg', 0),
  ('a0000001-0000-0000-0000-000000000014', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129610/kidamerch/seed/hero-figure.jpg', 1);

-- Cast Chain Necklace
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000015', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 0),
  ('a0000001-0000-0000-0000-000000000015', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 1);

-- Quiet City Screenprint
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000016', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 0),
  ('a0000001-0000-0000-0000-000000000016', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 1);

-- Drop Zero Cargo Pant
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000017', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 0),
  ('a0000001-0000-0000-0000-000000000017', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 1);

-- Twin Blade Diorama
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000018', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129605/kidamerch/seed/p-figure.jpg', 0),
  ('a0000001-0000-0000-0000-000000000018', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129610/kidamerch/seed/hero-figure.jpg', 1);

-- Utility Belt Bag
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000019', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 0),
  ('a0000001-0000-0000-0000-000000000019', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 1);

-- Storyboard Zine Vol. 2
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000020', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 0),
  ('a0000001-0000-0000-0000-000000000020', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129605/kidamerch/seed/p-figure.jpg', 1);

-- Monochrome Knit Scarf
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000021', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 0),
  ('a0000001-0000-0000-0000-000000000021', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 1);

-- Sentinel Varsity Jacket
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000022', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 0),
  ('a0000001-0000-0000-0000-000000000022', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129610/kidamerch/seed/hero-figure.jpg', 1);

-- Ember Lantern Figure
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000023', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129605/kidamerch/seed/p-figure.jpg', 0),
  ('a0000001-0000-0000-0000-000000000023', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129607/kidamerch/seed/p-accessory.jpg', 1);

-- Grid Study Letterpress
insert into product_images (product_id, url, position) values
  ('a0000001-0000-0000-0000-000000000024', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129606/kidamerch/seed/p-print.jpg', 0),
  ('a0000001-0000-0000-0000-000000000024', 'https://res.cloudinary.com/m7sfebwp/image/upload/v1786129601/kidamerch/seed/p-apparel.jpg', 1);
