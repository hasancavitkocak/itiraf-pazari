-- Test reklamları ekle
INSERT INTO ads (title, content, image_url, link_url, position, is_active, priority) VALUES
(
  'Örnek Header Reklamı',
  'Bu bir örnek header reklamıdır. Sitenizin üst kısmında görünür.',
  'https://via.placeholder.com/800x200/4f46e5/ffffff?text=Header+Reklam',
  'https://example.com',
  'header',
  true,
  5
),
(
  'Örnek Footer Reklamı',
  'Bu bir örnek footer reklamıdır. Sitenizin alt kısmında görünür.',
  'https://via.placeholder.com/800x150/10b981/ffffff?text=Footer+Reklam',
  'https://example.com',
  'footer',
  true,
  3
),
(
  'Premium Üyelik',
  'Premium üyelik ile özel kategorilere erişim sağlayın!',
  null,
  '/premium',
  'header',
  true,
  8
);