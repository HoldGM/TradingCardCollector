import assert from "node:assert/strict";
import test from "node:test";
import { mapCard } from "../src/mapCard.js";

test("maps a database row and computes the extended value", () => {
  const card = mapCard({
    id: "6f1e2c4a-6a0d-4e8a-9c1b-123456789abc",
    name: "Charizard",
    year: 1999,
    set_name: "Base Set",
    card_number: "4",
    notes: null,
    genre: "Table Games",
    sport_or_game: "Pokémon",
    condition: "Near Mint",
    grading_company: "Ungraded",
    grade: null,
    quantity: 2,
    value: "12.50",
    created_at: "2020-01-01T00:00:00.000Z",
    updated_at: "2020-01-02T00:00:00.000Z",
  });

  assert.equal(card.setName, "Base Set");
  assert.equal(card.sportOrGame, "Pokémon");
  assert.equal(card.value, 12.5);
  assert.equal(card.extendedValue, 25);
  assert.equal(card.grade, null);
});
