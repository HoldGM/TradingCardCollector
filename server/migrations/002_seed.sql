INSERT INTO cards (
  name, year, set_name, card_number, notes, genre, sport_or_game,
  condition, grading_company, grade, quantity, value
)
SELECT
  name, year, set_name, card_number, notes, genre, sport_or_game,
  condition, grading_company, grade, quantity, value
FROM (VALUES
  (
    'Ken Griffey Jr.'::text, 1989::integer, 'Upper Deck'::text, '1'::text,
    'Upper Deck rookie.'::text, 'Sports'::text, 'Baseball'::text,
    'Gem Mint'::text, 'PSA'::text, '10'::text, 1::integer, 450.00::numeric
  ),
  (
    'LeBron James'::text, 2003::integer, 'Topps Chrome'::text, '111'::text,
    'Chrome rookie.'::text, 'Sports'::text, 'Basketball'::text,
    'Mint'::text, 'BGS'::text, '9.5'::text, 1::integer, 1200.00::numeric
  ),
  (
    'Patrick Mahomes'::text, 2017::integer, 'Panini Prizm'::text, '269'::text,
    'Base prizm.'::text, 'Sports'::text, 'Football'::text,
    'Near Mint'::text, 'Ungraded'::text, NULL::text, 2::integer, 85.00::numeric
  ),
  (
    'Wayne Gretzky'::text, 1979::integer, 'O-Pee-Chee'::text, '18'::text,
    'Rookie card.'::text, 'Sports'::text, 'Hockey'::text,
    'Excellent'::text, 'SGC'::text, '7'::text, 1::integer, 900.00::numeric
  ),
  (
    'Black Lotus'::text, 1993::integer, 'Unlimited'::text, NULL::text,
    'Power nine.'::text, 'Table Games'::text, 'Magic: The Gathering'::text,
    'Excellent'::text, 'PSA'::text, '8'::text, 1::integer, 15000.00::numeric
  ),
  (
    'Charizard'::text, 1999::integer, 'Base Set'::text, '4'::text,
    'Base set holo.'::text, 'Table Games'::text, 'Pokémon'::text,
    'Near Mint'::text, 'Ungraded'::text, NULL::text, 1::integer, 350.00::numeric
  ),
  (
    'Blue-Eyes White Dragon'::text, 2002::integer, 'Legend of Blue Eyes White Dragon'::text, 'LOB-001'::text,
    'Starter collection.'::text, 'Table Games'::text, 'Yu-Gi-Oh!'::text,
    'Very Good'::text, 'Ungraded'::text, NULL::text, 1::integer, 25.00::numeric
  ),
  (
    'Elsa, Spirit of Winter'::text, 2023::integer, 'The First Chapter'::text, '207'::text,
    'Enchanted.'::text, 'Table Games'::text, 'Disney Lorcana'::text,
    'Mint'::text, 'CGC'::text, '9'::text, 1::integer, 180.00::numeric
  ),
  (
    'Luke Skywalker'::text, 1977::integer, 'Topps Star Wars'::text, '1'::text,
    'Original series.'::text, 'Trading Cards'::text, 'Entertainment'::text,
    'Very Good'::text, 'SGC'::text, '6'::text, 1::integer, 95.00::numeric
  ),
  (
    'Spider-Man'::text, 1990::integer, 'Marvel Universe'::text, '1'::text,
    'First series.'::text, 'Trading Cards'::text, 'Comics'::text,
    'Good'::text, 'Ungraded'::text, NULL::text, 3::integer, 12.00::numeric
  )
) AS seed (
  name, year, set_name, card_number, notes, genre, sport_or_game,
  condition, grading_company, grade, quantity, value
)
WHERE NOT EXISTS (SELECT 1 FROM cards);
