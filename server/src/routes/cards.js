import { Router } from "express";
import { buildListQuery, parseListQuery } from "../cardsQuery.js";
import { pool } from "../db.js";
import { mapCard } from "../mapCard.js";
import { GENRES } from "../taxonomy.js";
import { validateCard } from "../validation.js";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const cardsRouter = Router();

const columns = `
  id, name, year, set_name, card_number, notes, genre, sport_or_game,
  condition, grading_company, grade, quantity, value, created_at, updated_at
`;

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function values(card) {
  return [
    card.name,
    card.year,
    card.setName,
    card.cardNumber,
    card.notes,
    card.genre,
    card.sportOrGame,
    card.condition,
    card.gradingCompany,
    card.grade,
    card.quantity,
    card.value,
  ];
}

cardsRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const parsed = parseListQuery(req.query);
    if (!parsed.ok) {
      return res.status(400).json({ error: "Check the filters.", fields: parsed.fields });
    }

    const { sql, params } = buildListQuery(parsed.filters);
    const [list, counts, sports] = await Promise.all([
      pool.query(sql, params),
      pool.query("SELECT genre, COUNT(*)::int AS count FROM cards GROUP BY genre"),
      pool.query(`
        SELECT genre, sport_or_game AS name
        FROM cards
        GROUP BY genre, sport_or_game
        ORDER BY genre, sport_or_game
      `),
    ]);

    const byGenre = Object.fromEntries(GENRES.map((genre) => [genre, 0]));
    for (const row of counts.rows) {
      if (row.genre in byGenre) byGenre[row.genre] = row.count;
    }
    const all = Object.values(byGenre).reduce((sum, count) => sum + count, 0);

    res.json({
      cards: list.rows.map(mapCard),
      total: list.rows.length,
      counts: { All: all, ...byGenre },
      sportOrGames: sports.rows,
    });
  }),
);

cardsRouter.get(
  "/:id",
  asyncRoute(async (req, res) => {
    if (!UUID.test(req.params.id)) {
      return res.status(400).json({ error: "Unknown card." });
    }
    const result = await pool.query(`SELECT ${columns} FROM cards WHERE id = $1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: "This card is not in the catalog." });
    res.json(mapCard(result.rows[0]));
  }),
);

cardsRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const parsed = validateCard(req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: "Check the highlighted fields.", fields: parsed.fields });
    }
    const result = await pool.query(
      `INSERT INTO cards (
         name, year, set_name, card_number, notes, genre, sport_or_game,
         condition, grading_company, grade, quantity, value
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING ${columns}`,
      values(parsed.data),
    );
    res.status(201).json(mapCard(result.rows[0]));
  }),
);

cardsRouter.put(
  "/:id",
  asyncRoute(async (req, res) => {
    if (!UUID.test(req.params.id)) {
      return res.status(400).json({ error: "Unknown card." });
    }
    const parsed = validateCard(req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: "Check the highlighted fields.", fields: parsed.fields });
    }
    const result = await pool.query(
      `UPDATE cards SET
         name = $1,
         year = $2,
         set_name = $3,
         card_number = $4,
         notes = $5,
         genre = $6,
         sport_or_game = $7,
         condition = $8,
         grading_company = $9,
         grade = $10,
         quantity = $11,
         value = $12,
         updated_at = now()
       WHERE id = $13
       RETURNING ${columns}`,
      [...values(parsed.data), req.params.id],
    );
    if (!result.rowCount) return res.status(404).json({ error: "This card is not in the catalog." });
    res.json(mapCard(result.rows[0]));
  }),
);

cardsRouter.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    if (!UUID.test(req.params.id)) {
      return res.status(400).json({ error: "Unknown card." });
    }
    const result = await pool.query("DELETE FROM cards WHERE id = $1", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: "This card is not in the catalog." });
    res.status(204).end();
  }),
);
