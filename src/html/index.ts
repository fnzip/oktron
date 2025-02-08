import { compile } from "tempura";
import { utils } from "tronweb";
import { formattedNumber } from "../lib";

const file = Bun.file("./src/html/new-trx.hbs");
const template = await file.text();

const render = compile(template);

export type TransactionData = {
  hash: string;
  amount: number;
  token: {
    address: string;
    abbr: string;
    decimals: number;
  };
  from: {
    address: string;
    label: string | null;
  };
  to: {
    address: string;
    label: string | null;
  };
};

export const renderTemplate = async (data: TransactionData) => await render({
  ...data,
  get formattedAmount() {
    return formattedNumber(this.amount / Math.pow(10, this.token.decimals));
  },
  token: {
    ...data.token,
    get address58() {
      return utils.address.fromHex("41" + this.address);
    },
  },
  from: {
    ...data.from,
    get address58() {
      return utils.address.fromHex("41" + this.address);
    },
    get address58Ellipsis() {
      return this.address58.slice(0, 4) + "..." + this.address58.slice(-4);
    },
    get addressWithLabel() {
      return this.label ? `${this.address58Ellipsis} (${this.label})` : this.address58Ellipsis;
    },
  },
  to: {
    ...data.to,
    get address58() {
      return utils.address.fromHex("41" + this.address);
    },
    get address58Ellipsis() {
      return this.address58.slice(0, 4) + "..." + this.address58.slice(-4);
    },
    get addressWithLabel() {
      return this.label ? `${this.address58Ellipsis} (${this.label})` : this.address58Ellipsis;
    },
  },
});
