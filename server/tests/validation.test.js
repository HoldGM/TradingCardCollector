import assert from "node:assert/strict";
import test from "node:test";
import { validateCard } from "../src/validation.js";

const graded = {
  name: "Ken Griffey Jr.",
  year: 1989,
  setName: "Upper Deck",
  cardNumber: "1",
  notes: "Rookie",
  genre: "Sports",
  sportOrGame: "Baseball",
  condition: "Gem Mint",
  gradingCompany: "PSA",
  grade: "10",
  quantity: 1,
  value: 450,
};

test("accepts a graded sports card", () => {
  const result = validateCard(graded);
  assert.equal(result.ok, true);
  assert.equal(result.data.name, "Ken Griffey Jr.");
  assert.equal(result.data.grade, "10");
  assert.equal(result.data.value, 450);
});

test("accepts an ungraded card and clears empty optional text", () => {
  const result = validateCard({
    ...graded,
    gradingCompany: "Ungraded",
    grade: "",
    setName: "   ",
    notes: null,
    year: "",
    value: "12.5",
    quantity: "2",
  });
  assert.equal(result.ok, true);
  assert.equal(result.data.grade, null);
  assert.equal(result.data.setName, null);
  assert.equal(result.data.notes, null);
  assert.equal(result.data.year, null);
  assert.equal(result.data.value, 12.5);
  assert.equal(result.data.quantity, 2);
});

test("accepts a custom sport or game label", () => {
  const result = validateCard({
    ...graded,
    genre: "Sports",
    sportOrGame: " Cricket ",
  });
  assert.equal(result.ok, true);
  assert.equal(result.data.sportOrGame, "Cricket");
});

test("rejects Other as the stored sport or game", () => {
  const result = validateCard({ ...graded, sportOrGame: "Other" });
  assert.equal(result.ok, false);
  assert.equal(result.fields.sportOrGame, "Enter a name for this sport or game.");
});

test("rejects a missing name", () => {
  const result = validateCard({ ...graded, name: "   " });
  assert.equal(result.ok, false);
  assert.equal(result.fields.name, "Enter a card name.");
});

test("rejects an ungraded card that includes a grade", () => {
  const result = validateCard({
    ...graded,
    gradingCompany: "Ungraded",
    grade: "10",
  });
  assert.equal(result.ok, false);
  assert.equal(result.fields.grade, "Ungraded cards do not have a grade.");
});

test("rejects a graded card without a grade", () => {
  const result = validateCard({ ...graded, grade: null });
  assert.equal(result.ok, false);
  assert.equal(result.fields.grade, "Choose a grade.");
});

test("rejects an unknown grade", () => {
  const result = validateCard({ ...graded, grade: "11" });
  assert.equal(result.ok, false);
  assert.equal(result.fields.grade, "Choose a grade.");
});

test("rejects a quantity below 1 and fractional quantities", () => {
  assert.equal(validateCard({ ...graded, quantity: 0 }).fields.quantity, "Quantity must be at least 1.");
  assert.equal(
    validateCard({ ...graded, quantity: "1.5" }).fields.quantity,
    "Quantity must be a whole number.",
  );
});

test("rejects a negative value and an unknown genre", () => {
  assert.equal(validateCard({ ...graded, value: -1 }).fields.value, "Value cannot be negative.");
  assert.equal(validateCard({ ...graded, genre: "Stickers" }).fields.genre, "Choose a genre.");
});

test("rejects a year outside the catalog range", () => {
  const result = validateCard({ ...graded, year: "1700" });
  assert.equal(result.ok, false);
  assert.equal(result.fields.year, "Year must be between 1860 and 2100.");
});

test("trims the card name and rounds money to cents", () => {
  const result = validateCard({ ...graded, name: "  Griffey  ", value: 19.99 });
  assert.equal(result.ok, true);
  assert.equal(result.data.name, "Griffey");
  assert.equal(result.data.value, 19.99);
});
