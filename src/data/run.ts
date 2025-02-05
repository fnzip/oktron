// we got list of tokens from https://tronscan.org/#/tokens/list

import { utils } from "tronweb";
// import data from "./data.json";

const file = Bun.file("token.txt");
const writer = file.writer();

// data.tokens.forEach((token) => {
//   const address = utils.address.toHex(token.contractAddress).replace(/^0x/, "");
//   // hex,abbr,decimal
//   writer.write(`${address},${token.abbr},${token.decimal}\n`);
// });

writer.flush();
