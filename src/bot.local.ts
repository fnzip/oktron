import bot from "./bot";

bot.launch(() => {
  console.log("Bot started");
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));