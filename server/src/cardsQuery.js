import {
  CONDITIONS,
  GENRES,
  GRADES,
  GRADING_COMPANIES,
} from "./taxonomy.js";

const CONDITION_RANK = CONDITIONS.map((condition, index) => {
  const rank = CONDITIONS.length - index;
  return `WHEN '${condition}' THEN ${rank}`;
}).join(" ");

const SORTS = {
  name: "name",
  genre: "genre",
  sportOrGame: "sport_or_game",
  condition: `CASE condition ${CONDITION_RANK} ELSE 0 END`,
  grade:
    "CASE WHEN grade IS NULL OR grade = '' THEN NULL WHEN grade = 'Authentic' THEN 0 ELSE grade::numeric END",
  value: "value",
  extendedValue: "(quantity * value)",
  quantity: "quantity",
  createdAt: "created_at",
};

function blank(value) {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text ? text : undefined;
}

export function parseListQuery(query = {}) {
  const fields = {};
  const filters = {};

  const genre = blank(query.genre);
  if (genre) {
    if (!GENRES.includes(genre)) fields.genre = "Unknown genre.";
    else filters.genre = genre;
  }

  const sportOrGame = blank(query.sportOrGame);
  if (sportOrGame) {
    if (sportOrGame.length > 80) fields.sportOrGame = "Sport or game is too long.";
    else filters.sportOrGame = sportOrGame;
  }

  const condition = blank(query.condition);
  if (condition) {
    if (!CONDITIONS.includes(condition)) fields.condition = "Unknown condition.";
    else filters.condition = condition;
  }

  const gradingCompany = blank(query.gradingCompany);
  if (gradingCompany) {
    if (!GRADING_COMPANIES.includes(gradingCompany)) fields.gradingCompany = "Unknown grading company.";
    else filters.gradingCompany = gradingCompany;
  }

  const grade = blank(query.grade);
  if (grade) {
    if (!GRADES.includes(grade)) fields.grade = "Unknown grade.";
    else filters.grade = grade;
  }

  const min = readPrice(query.minPrice, "Minimum price");
  if (min.error) fields.minPrice = min.error;
  else if (min.value != null) filters.minPrice = min.value;

  const max = readPrice(query.maxPrice, "Maximum price");
  if (max.error) fields.maxPrice = max.error;
  else if (max.value != null) filters.maxPrice = max.value;

  if (
    filters.minPrice != null &&
    filters.maxPrice != null &&
    filters.minPrice > filters.maxPrice
  ) {
    fields.maxPrice = "Maximum price must be at least the minimum.";
  }

  const sort = blank(query.sort) || "createdAt";
  if (!SORTS[sort]) fields.sort = "Unknown sort.";
  else filters.sort = sort;

  const order = (blank(query.order) || "desc").toLowerCase();
  if (order !== "asc" && order !== "desc") fields.order = "Order must be asc or desc.";
  else filters.order = order;

  if (Object.keys(fields).length) return { ok: false, fields };
  return { ok: true, filters };
}

function readPrice(value, label) {
  const text = blank(value);
  if (text == null) return { value: undefined };
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0) {
    return { error: `${label} must be zero or more.` };
  }
  return { value: Math.round((number + Number.EPSILON) * 100) / 100 };
}

export function buildListQuery(filters) {
  const where = [];
  const params = [];

  const add = (column, value) => {
    params.push(value);
    where.push(`${column} = $${params.length}`);
  };

  if (filters.genre) add("genre", filters.genre);
  if (filters.sportOrGame) add("sport_or_game", filters.sportOrGame);
  if (filters.condition) add("condition", filters.condition);
  if (filters.gradingCompany) add("grading_company", filters.gradingCompany);
  if (filters.grade) add("grade", filters.grade);
  if (filters.minPrice != null) {
    params.push(filters.minPrice);
    where.push(`value >= $${params.length}`);
  }
  if (filters.maxPrice != null) {
    params.push(filters.maxPrice);
    where.push(`value <= $${params.length}`);
  }

  const sortKey = SORTS[filters.sort] ? filters.sort : "createdAt";
  const direction = filters.order === "asc" ? "ASC" : "DESC";
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT id, name, year, set_name, card_number, notes, genre, sport_or_game,
           condition, grading_company, grade, quantity, value, created_at, updated_at
    FROM cards
    ${whereSql}
    ORDER BY ${SORTS[sortKey]} ${direction} NULLS LAST, id ASC
  `;

  return { sql, params, sort: sortKey, order: direction.toLowerCase() };
}
