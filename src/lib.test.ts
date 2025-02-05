import { describe, it, expect } from "bun:test";
import { aggregateTransactionAddress, getTokenList, formattedNumber } from "./lib";
import type { Transaction } from "./types";

describe("aggregateTransactionAddress", () => {
  it("should map addresses correctly", () => {
    const transactions: Transaction[] = [
      {
        blockHash:
          "0x0000000004221e489b879d367b134be3edd4b4c819587856a0852c475ec95b95",
        blockNumber: "0x4221e48",
        from: "0x276ef67e556a7f89bc7124fb18b2c679888806bf",
        gas: "0xfb1d",
        gasPrice: "0xd2",
        hash: "0xa281816095413df41c93250c57a31654af6a7a392f2150354fc6e81582e40ccf",
        input:
          "0xa9059cbb000000000000000000000000e8441455263bfc93f8e07ecb38425bd0454025ff000000000000000000000000000000000000000000000000000000019bb074c0",
        nonce: "0x0000000000000000",
        r: "0x670410c7fb4c82dfff100a183d575b2791bb220561e1f4150220e7096c5d66eb",
        s: "0x3f79cd534f20e43c96081158fb8debb0435ea055b94770359ea76ce4b8bcc914",
        to: "0xa614f803b6fd780986a42c78ec9c7f77e6ded13c",
        transactionIndex: "0x0",
        type: "0x0",
        v: "0x1b",
        value: "0x0",
      },
      {
        blockHash:
          "0x0000000004221e489b879d367b134be3edd4b4c819587856a0852c475ec95b95",
        blockNumber: "0x4221e48",
        from: "0x214b6f7acdd958e4eb937fbf9cf18dc1e5510a5b",
        gas: "0x1fced",
        gasPrice: "0xd2",
        hash: "0xcf18690a470bd2efc6453f70972c8eb5f68e0a53fb20deec4c2540bbf9c9563a",
        input:
          "0xa9059cbb000000000000000000000000ce6a05517efbab7c74e1c501c0204fa0362c98a200000000000000000000000000000000000000000000000000000000093c0b50",
        nonce: "0x0000000000000000",
        r: "0x54c1c036b0ce4babf39ac2db8c55adec0f009250700bdc749a31a396e8d87261",
        s: "0x3013226e30be85be7ed7a4cc87d24d167ee046ec261b7c83ae8f53316be3f1ad",
        to: "0xa614f803b6fd780986a42c78ec9c7f77e6ded13c",
        transactionIndex: "0x1",
        type: "0x0",
        v: "0x1c",
        value: "0x0",
      },
      {
        blockHash:
          "0x0000000004221e489b879d367b134be3edd4b4c819587856a0852c475ec95b95",
        blockNumber: "0x4221e48",
        from: "0x214b6f7acdd958e4eb937fbf9cf18dc1e5510a5b",
        gas: "0x0",
        gasPrice: "0xd2",
        hash: "0x4d63c4a9bd536cc477493330cd306961e8796fd467c01832232b744f36165857",
        input: "0x",
        nonce: "0x0000000000000000",
        r: "0xe426a6cc0ef2dbafbd54cb260824cd806be6bd181f801148e672f08751826534",
        s: "0x4c7ee60b193d1113170d44dd85ca99a07d5303dd0b08765e202b4bab85492a36",
        to: "0xe7c936913131e20cb1298b067eb8460d84aeb64a",
        transactionIndex: "0xa3",
        type: "0x0",
        v: "0x1b",
        value: "0xa28",
      },
    ];

    const result = aggregateTransactionAddress(transactions);

    expect(result.get("276ef67e556a7f89bc7124fb18b2c679888806bf")).toEqual([0]);
    expect(result.get("214b6f7acdd958e4eb937fbf9cf18dc1e5510a5b")).toEqual([
      1, 2,
    ]);
    expect(result.get("ce6a05517efbab7c74e1c501c0204fa0362c98a2")).toEqual([1]);
  });

  it("should handle transactions with no 'to' address", () => {
    const transactions: Transaction[] = [
      {
        blockHash:
          "0x0000000004221e489b879d367b134be3edd4b4c819587856a0852c475ec95b95",
        blockNumber: "0x4221e48",
        from: "0x276ef67e556a7f89bc7124fb18b2c679888806bf",
        gas: "0xfb1d",
        gasPrice: "0xd2",
        hash: "0xa281816095413df41c93250c57a31654af6a7a392f2150354fc6e81582e40ccf",
        input: "0x",
        nonce: "0x0000000000000000",
        r: "0x670410c7fb4c82dfff100a183d575b2791bb220561e1f4150220e7096c5d66eb",
        s: "0x3f79cd534f20e43c96081158fb8debb0435ea055b94770359ea76ce4b8bcc914",
        to: "null",
        transactionIndex: "0x0",
        type: "0x0",
        v: "0x1b",
        value: "0x0",
      },
    ];

    const result = aggregateTransactionAddress(transactions);

    expect(result.get("276ef67e556a7f89bc7124fb18b2c679888806bf")).toEqual([0]);
  });
});

describe("getTokenList", () => {
  it("should parse token list correctly", () => {
    const text = `1234567890abcdef,ABC,18\nfedcba0987654321,XYZ,8
`.trim();

    const result = getTokenList(text);

    expect(result.size).toBe(2);
    expect(result.get("1234567890abcdef")).toEqual({
      contract: "1234567890abcdef",
      abbr: "ABC",
      decimal: 18,
    });
    expect(result.get("fedcba0987654321")).toEqual({
      contract: "fedcba0987654321",
      abbr: "XYZ",
      decimal: 8,
    });
  });
});

describe("formattedNumber", () => {
  it("should format numbers correctly", () => {
    expect(formattedNumber(1234.567)).toBe("1,234.567");
    expect(formattedNumber(0)).toBe("0.00");
    expect(formattedNumber(1000000)).toBe("1,000,000.00");
    expect(formattedNumber(987654321.123)).toBe("987,654,321.123");
  });
});


