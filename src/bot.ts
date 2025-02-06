import { eq } from "drizzle-orm";
import { Telegraf } from "telegraf";
import { db } from "./db";
import { addresses, users } from "./db/schema";

const bot = new Telegraf(process.env.TG_BOT_TOKEN!);

bot.use(async (ctx, next) => {
  if (
    ctx.message &&
    "text" in ctx.message &&
    ctx.message.text === "/start" &&
    ctx.from
  ) {
    const userId = ctx.from.id;

    // find the user
    const isRegistered = await db
      .select({ _: users.id })
      .from(users)
      .where(eq(users.tg_id, userId))
      .run()
      .then((result) => {
        const count = result.rows.length;
        return count > 0;
      });

    // if not found, create a new user
    if (!isRegistered) {
      await db.insert(users).values({
        tg_id: userId,
      });
    }
  }

  return next();
});

bot.start((ctx) => ctx.reply("Welcome"));

bot.command("addresses", async (ctx) => {
  const userId = ctx.from.id;

  // find the user
  const userPrimaryId = await db
    .select({ _: users.id })
    .from(users)
    .where(eq(users.tg_id, userId))
    .run();

  if (userPrimaryId.rows.length === 0) {
    ctx.reply("User not found, please use /start to register");
    return;
  }

  const result = await db
    .select({ address: addresses.address, label: addresses.label })
    .from(addresses)
    .where(eq(addresses.user_id, userPrimaryId.rows[0].id as number))
    .run();

  if (result.rows.length === 0) {
    ctx.reply("No address found");
    return;
  }

  const message = result.rows
    .map(
      (row) =>
        `<a href="https://tronscan.org/#/address/${row.address}">🚀</a> <code>${row.address}</code>: ${row.label}`
    )
    .join("\n");

  ctx.reply("Your addresses:\n\n" + message, {
    parse_mode: "HTML",
  });
});

bot.on("text", async (ctx) => {
  console.log(ctx.message.text);

  const tronAddressRegex = /(T[A-Za-z0-9]{33,34})\s+([A-Za-z0-9 ]+)/g;

  const matches = ctx.message.text.matchAll(tronAddressRegex);
  const map = new Map<string, string>();

  for (const match of matches) {
    if (match) map.set(match[1], match[2]);
  }

  if (map.size === 0) {
    ctx.reply("No address found");
    return;
  }

  const userId = ctx.from.id;

  // find the user
  const userPrimaryId = await db
    .select({ _: users.id })
    .from(users)
    .where(eq(users.tg_id, userId))
    .run();

  if (userPrimaryId.rows.length === 0) {
    ctx.reply("User not found, please use /start to register");
    return;
  }

  const result = await db
    .insert(addresses)
    .values(
      [...map.entries()].map(([address, label]) => ({
        user_id: userPrimaryId.rows[0].id as number,
        address,
        label,
      }))
    )
    .run();

  ctx.reply(
    `we got ${map.size} addresses and success inserted ${result.rowsAffected} addresses`
  );
});

export default bot
