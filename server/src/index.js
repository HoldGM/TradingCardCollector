import { createApp } from "./app.js";
import { migrate, pool, waitForDb } from "./db.js";

const port = Number(process.env.PORT || 3000);

await waitForDb();
await migrate();

const server = createApp().listen(port, "0.0.0.0", () => {
  console.log(`API listening on ${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    server.close();
    await pool.end();
    process.exit(0);
  });
}
