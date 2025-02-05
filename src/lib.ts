import type { Token, Transaction } from "./types";

export const aggregateTransactionAddress = (
  transactions: Transaction[]
): Map<string, number[]> => {
  const map = new Map<string, number[]>();
  const update_map = (address: string, index: number) => {
    address = address.toLowerCase().replace(/^0x/, "");
    if (!map.has(address)) {
      map.set(address, []);
    }

    map.get(address)?.push(index);
  };

  transactions.forEach(async (trx, index) => {
    // map address by source
    update_map(trx.from, index);

    const isNative = trx.input === "0x";

    if (isNative) {
      // map address by destination
      if (trx.to) {
        update_map(trx.to, index);
      }
    } else {
      const methodId = trx.input.slice(2, 10);

      if (methodId === "a9059cbb") {
        const _to = "0x" + trx.input.slice(34, 74);
        // const _value = BigInt("0x" + input.slice(74));

        // map address destination from transfer method
        update_map(_to, index);
      }
    }
  });

  return map;
};

export const getTokenList = (text: string): Map<string, Token> => {
  const map = new Map<string, Token>();
  const lines = text.split("\n");

  lines.forEach((line) => {
    const [contract, abbr, decimal] = line.split(",");
    const token = {
      contract: contract.trim().replace(/^0x/, ""),
      abbr: abbr.trim(),
      decimal: parseInt(decimal.trim()),
    };

    if (!map.has(contract)) {
      map.set(contract, token);
    }
  });

  return map;
};

export const formattedNumber = (number: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(number);
