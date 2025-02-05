import { renderTemplate, type TransactionData } from "./index";
import { expect, test } from "bun:test";

test("renderTemplate should render the transaction template correctly (1)", async () => {
  const templateData: TransactionData = {
    hash: "61a7ae6ff26255894264bf0ba582513cb4c4f2f166e40514eb01d2bfbd839b6d",
    amount: 1000000000,
    token: {
      address: "a614f803b6fd780986a42c78ec9c7f77e6ded13c",
      abbr: "USDT",
      decimals: 6,
    },
    from: {
      address: "103b784ffdd6195e3c3c58094e693a9978ca78a4",
      label: "Label",
    },
    to: {
      address: "ae8775ef247137636857f65d209ba72e0eeedd9a",
      label: null,
    },
  };

  const expectedOutput = `
<a href="https://tronscan.org/#/transaction/61a7ae6ff26255894264bf0ba582513cb4c4f2f166e40514eb01d2bfbd839b6d">💸 TRANSFER</a>

<code>TBT3...V2Du (Label) transferred 1,000.00 USDT to TRt2...vYgT</code>

📝 <a href="https://tronscan.org/#/address/TBT34B4Y2CUF2LSUBFdUdNud2CndWuV2Du">TBT3...V2Du (Label)</a> transferred 1,000.00 USDT to <a href="https://tronscan.org/#/address/TRt2rQmNzBi2vMNN98KdAWPfXfRZavvYgT">TRt2...vYgT</a>

📝 (Label) TBT3...V2Du:
<a href="https://tronscan.org/#/token20/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t">USDT</a>: -1,000.00
`.trim();

  const renderedOutput = (await renderTemplate(templateData)).trim();
  expect(renderedOutput).toBe(expectedOutput);
});

test("renderTemplate should render the transaction template correctly (2)", async () => {
  const templateData: TransactionData = {
    hash: "61a7ae6ff26255894264bf0ba582513cb4c4f2f166e40514eb01d2bfbd839b6d",
    amount: 1000000000,
    token: {
      address: "a614f803b6fd780986a42c78ec9c7f77e6ded13c",
      abbr: "USDT",
      decimals: 6,
    },
    from: {
      address: "103b784ffdd6195e3c3c58094e693a9978ca78a4",
      label: null,
    },
    to: {
      address: "ae8775ef247137636857f65d209ba72e0eeedd9a",
      label: "Label",
    },
  };

  const expectedOutput = `
<a href="https://tronscan.org/#/transaction/61a7ae6ff26255894264bf0ba582513cb4c4f2f166e40514eb01d2bfbd839b6d">💸 TRANSFER</a>

<code>TBT3...V2Du transferred 1,000.00 USDT to TRt2...vYgT (Label)</code>

📝 <a href="https://tronscan.org/#/address/TBT34B4Y2CUF2LSUBFdUdNud2CndWuV2Du">TBT3...V2Du</a> transferred 1,000.00 USDT to <a href="https://tronscan.org/#/address/TRt2rQmNzBi2vMNN98KdAWPfXfRZavvYgT">TRt2...vYgT (Label)</a>

📝 (Label) TRt2...vYgT:
<a href="https://tronscan.org/#/token20/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t">USDT</a>: +1,000.00
`.trim();

  const renderedOutput = (await renderTemplate(templateData)).trim();
  expect(renderedOutput).toBe(expectedOutput);
});
