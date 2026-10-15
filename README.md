# Card Catalog

A web catalog for sports cards, table-game cards, and other trading cards. Browse the collection by category, add cards with condition, professional grade, quantity, and value, then sort and filter the results.

The catalog is a single shared collection. There are no accounts.

## Run with Docker

```bash
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). The API is also available at [http://localhost:3000](http://localhost:3000).

The first start loads a few sample cards. Data stays in the `pgdata` volume.

## Local development

Start Postgres, then run the API and the React app:

```bash
cd server
npm install
npm run dev

cd ../client
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:3000`. Copy `.env.example` if the database URL differs from the local default.

## Tests

```bash
cd server
npm test
```

## Catalog fields

Each card stores a name, optional year, set, and number, a genre, a sport or game, condition, grading company, grade, quantity, and per-card value. Total value is quantity times the per-card value.

Genres are Sports, Table Games, and Trading Cards. Choosing Other for sport or game asks for a short custom name. Ungraded cards do not store a grade.
