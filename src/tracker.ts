import { BASE_URL_MAINNET, Tron } from "./tron";

const tron = new Tron(BASE_URL_MAINNET);


// Enable graceful stop
process.once("SIGINT", () => tron.destroy());
process.once("SIGTERM", () => tron.destroy());