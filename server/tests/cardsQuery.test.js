import assert from "node:assert/strict";
import test from "node:test";
import { buildListQuery, parseListQuery } from "../src/cardsQuery.js";

test("defaults to newest cards first", () => {
  const parsed = parseListQuery({});
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.filters, { sort: "createdAt", order: "desc" });
  const query = buildListQuery(parsed.filters);
  assert.match(query.sql, /ORDER BY created_at DESC NULLS LAST/);
  assert.deepEqual(query.params, []);
});

test("ignores blank filters", () => {
  const parsed = parseListQuery({
    genre: "  ",
    sportOrGame: "",
    minPrice: " ",
    maxPrice: "",
  });
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.filters, { sort: "createdAt", order: "desc" });
});

test("builds a parameterized filter for genre, sport, condition, grade, and price", () => {
  const parsed = parseListQuery({
    genre: "Sports",
    sportOrGame: "Baseball",
    condition: "Mint",
    gradingCompany: "PSA",
    grade: "10",
    minPrice: "10",
    maxPrice: "500.5",
    sort: "value",
    order: "asc",
  });
  assert.equal(parsed.ok, true);
  const query = buildListQuery(parsed.filters);
  assert.deepEqual(query.params, ["Sports", "Baseball", "Mint", "PSA", "10", 10, 500.5]);
  assert.match(query.sql, /genre = \$1/);
  assert.match(query.sql, /sport_or_game = \$2/);
  assert.match(query.sql, /condition = \$3/);
  assert.match(query.sql, /grading_company = \$4/);
  assert.match(query.sql, /grade = \$5/);
  assert.match(query.sql, /value >= \$6/);
  assert.match(query.sql, /value <= \$7/);
  assert.match(query.sql, /ORDER BY value ASC NULLS LAST/);
});

test("sorts condition by quality and grade by numeric rank", () => {
  const condition = buildListQuery({ sort: "condition", order: "desc" });
  assert.match(condition.sql, /WHEN 'Gem Mint' THEN 8/);
  assert.match(condition.sql, /WHEN 'Poor' THEN 1/);
  assert.match(condition.sql, /DESC NULLS LAST/);

  const grade = buildListQuery({ sort: "grade", order: "asc" });
  assert.match(grade.sql, /WHEN grade = 'Authentic' THEN 0/);
  assert.match(grade.sql, /ELSE grade::numeric END ASC NULLS LAST/);

  const extended = buildListQuery({ sort: "extendedValue", order: "desc" });
  assert.match(extended.sql, /ORDER BY \(quantity \* value\) DESC NULLS LAST/);
});

test("rejects unknown filters, inverted prices, and unsafe sort fields", () => {
  const parsed = parseListQuery({
    genre: "Stickers",
    condition: "Pristine",
    gradingCompany: "BMA",
    grade: "11",
    minPrice: "20",
    maxPrice: "5",
    sort: "name; DROP TABLE cards",
    order: "sideways",
  });
  assert.equal(parsed.ok, false);
  assert.equal(parsed.fields.genre, "Unknown genre.");
  assert.equal(parsed.fields.condition, "Unknown condition.");
  assert.equal(parsed.fields.gradingCompany, "Unknown grading company.");
  assert.equal(parsed.fields.grade, "Unknown grade.");
  assert.equal(parsed.fields.maxPrice, "Maximum price must be at least the minimum.");
  assert.equal(parsed.fields.sort, "Unknown sort.");
  assert.equal(parsed.fields.order, "Order must be asc or desc.");

  const query = buildListQuery({ sort: "name; DROP TABLE cards", order: "desc" });
  assert.equal(query.sql.includes("DROP"), false);
  assert.match(query.sql, /ORDER BY created_at DESC/);
});

test("rejects a negative price", () => {
  const parsed = parseListQuery({ minPrice: "-1" });
  assert.equal(parsed.ok, false);
  assert.equal(parsed.fields.minPrice, "Minimum price must be zero or more.");
});
