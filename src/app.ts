import { BASE_URL_MAINNET, Tron } from "./tracker";

// const tron = new Tron(BASE_URL_MAINNET);

import { Hono } from "hono";
import { logger } from "hono/logger";
import process from "process";
import type { Update } from "telegraf/types";
import bot from "./bot";

// Define the AppConfig type
interface AppConfig {
  port: string | number;
  fetch: (req: Request) => Response | Promise<Response>;
}

const { APP_PORT = 3000 } = process.env;

const app = new Hono();
app.use("*", logger());

// Define routes
app.get("/", (c) => c.json({ code: 0, msg: "ok" }));

app.post("/webhook", async (c) => {
  const body: Update = (await c.req.json()) as Update;

  // Handle the incoming update
  bot.handleUpdate(body);

  return c.json({ code: 0, msg: "ok" });
});

// Define server configuration with the AppConfig type
const h: AppConfig = {
  port: APP_PORT,
  fetch: app.fetch,
};

export default h;
