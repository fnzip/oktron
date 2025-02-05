import { eq, sql } from "drizzle-orm";
import type { BigNumberish, BlockParams } from "ethers";
import { JsonRpcProvider, toBeHex } from "ethers";
import { db } from "./db";
import { addresses, users } from "./db/schema";
import { renderTemplate, type TransactionData } from "./html";
import {
  aggregateTransactionAddress,
  getTokenList
} from "./lib";
import { throttledFetch } from "./notif";
import type { Token, Transaction } from "./types";

export const BASE_URL_TESTNET = "https://api.shasta.trongrid.io/jsonrpc"; // testnet
export const BASE_URL_MAINNET = "https://api.trongrid.io/jsonrpc"; // mainnet

export class Tron extends JsonRpcProvider {
  #tokens: Map<string, Token> = new Map<string, Token>();

  constructor(url?: string) {
    super(url);

    // Set polling interval
    this.pollingInterval = 1000;

    // Subscribe to new block events
    this.on("block", async (number: BigNumberish) => {
      console.log("[I] block", number);
      await this._getTokens();
      await this._processBlock(await this._getBlock(toBeHex(number)));
    });
  }

  async _getTokens(): Promise<void> {
    const file = Bun.file("./src/data/token.csv");
    const text = await file.text();

    this.#tokens = getTokenList(text);
  }

  async _getBlock(
    blockNumber: BigNumberish | Uint8Array
  ): Promise<BlockParams> {
    return await this.send("eth_getBlockByNumber", [blockNumber, true]);
  }

  async _processBlock(block: BlockParams): Promise<void> {
    const transactions: Transaction[] = block.transactions
      .filter((v) => typeof v === "object")
      .map((trx): Transaction => {
        const _t = trx as any;

        return {
          ..._t,
          blockHash: block.hash,
          blockNumber: block.number,
        } as Transaction;
      });

    const map_address = aggregateTransactionAddress(transactions);

    db.select({
      address: addresses.address,
      label: addresses.label,
      tg_id: users.tg_id,
    })
      .from(addresses)
      .where(sql`${addresses.address} IN ${[...map_address.keys()]}`)
      .innerJoin(users, eq(addresses.user_id, users.id))
      .run()
      .then((result) => {
        result.rows.forEach((row) => {
          const address = row.address as string;
          const trxIndexes = map_address.get(address) || [];
          const _transactions = transactions.filter((_, index) =>
            trxIndexes.includes(index)
          );

          _transactions.forEach(async (trx) => {
            const address_from = trx.from.toLowerCase().replace(/^0x/, "");
            let address_to = (
              trx.to ? trx.to.toLowerCase() : ""
            ).replace(/^0x/, "");
            let amount = BigInt(trx.value)
            let token: string = "TRX";
            let decimal: number = 6;

            const isNative = trx.input === "0x";

            if (!isNative) {
              const methodId = trx.input.slice(2, 10);

              // transfer(address,uint256)
              if (methodId === "a9059cbb") {
                const _to = trx.input.slice(34, 74);
                const _value = BigInt("0x" + trx.input.slice(74));

                if (this.#tokens.has(address_to)) {
                  const _token = this.#tokens.get(address_to);
                  token = _token?.abbr || "TOKEN";
                  amount = _value
                  decimal = _token?.decimal || 0;
                }

                address_to = _to;
              }
            }

            const tx_data: TransactionData = {
              hash: trx.hash.replace(/^0x/, ""),
              amount: Number(amount),
              token: {
                address: isNative ? "0" : (trx.to ? trx.to.toLowerCase() : "").replace(/^0x/, ""),
                abbr: isNative ? "TRX" : token,
                decimals: decimal,
              },
              from: {
                address: address_from,
                label:
                  address === address_from ? (row.label as string) : null,
              },
              to: {
                address: address_to,
                label:
                  address === address_to
                    ? (row.label as string)
                    : null,
              },
            };

            // Send notification
            const html = await renderTemplate(tx_data);

            const url = `https://api.telegram.org/bot${
              process.env.TG_BOT_TOKEN
            }/sendMessage?chat_id=${row.tg_id}&text=${encodeURIComponent(
              html
            )}&parse_mode=HTML`;

            throttledFetch(url)
              .then((response) => console.log("[I] telegram sent", "chat_id", row.tg_id, "hash", tx_data.hash.slice(0, 8), response.statusText))
              // .then((response) => response.json())
              // .then((data) => console.log(`Response: ${trx.hash}`, data))
              .catch((error: Error) =>
                console.error(`[E] Error fetching: ${trx.hash}`, error.message)
              );
          });
        });
      });
  }
}

const tron = new Tron(BASE_URL_MAINNET);
