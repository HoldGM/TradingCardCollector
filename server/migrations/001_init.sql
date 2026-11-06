CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(btrim(name)) > 0 AND char_length(name) <= 160),
  year INTEGER CHECK (year IS NULL OR (year >= 1860 AND year <= 2100)),
  set_name TEXT CHECK (set_name IS NULL OR char_length(set_name) <= 160),
  card_number TEXT CHECK (card_number IS NULL OR char_length(card_number) <= 40),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 2000),
  genre TEXT NOT NULL CHECK (genre IN ('Sports', 'Table Games', 'Trading Cards')),
  sport_or_game TEXT NOT NULL CHECK (
    char_length(btrim(sport_or_game)) >= 2
    AND char_length(sport_or_game) <= 80
    AND sport_or_game <> 'Other'
  ),
  condition TEXT NOT NULL CHECK (
    condition IN (
      'Gem Mint',
      'Mint',
      'Near Mint',
      'Excellent',
      'Very Good',
      'Good',
      'Fair',
      'Poor'
    )
  ),
  grading_company TEXT NOT NULL CHECK (
    grading_company IN ('Ungraded', 'PSA', 'BGS', 'SGC', 'CGC', 'TAG', 'HGA', 'Other')
  ),
  grade TEXT CHECK (
    grade IS NULL OR grade IN (
      '10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5.5',
      '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', 'Authentic'
    )
  ),
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 100000),
  value NUMERIC(12, 2) NOT NULL CHECK (value >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT grade_matches_company CHECK (
    (grading_company = 'Ungraded' AND grade IS NULL)
    OR (grading_company <> 'Ungraded' AND grade IS NOT NULL)
  )
);

CREATE INDEX cards_genre_idx ON cards (genre);
CREATE INDEX cards_sport_or_game_idx ON cards (sport_or_game);
CREATE INDEX cards_condition_idx ON cards (condition);
CREATE INDEX cards_value_idx ON cards (value);
