import {
  Keypair,
  PublicKey,
  VersionedTransaction,
  Connection,
} from "@solana/web3.js";
import { createPaymentHandler } from "@faremeter/payment-solana/exact";
import { wrap } from "@faremeter/fetch";
import { lookupKnownSPLToken } from "@faremeter/info/solana";
import bs58 from "bs58";
import "dotenv/config";

const secretKeyBase58 = process.env.SECRET_KEY!;
const secretKey = bs58.decode(secretKeyBase58); // ←ここが大事
const keypair = Keypair.fromSecretKey(secretKey);

const network = "mainnet-beta";
const connection = new Connection("https://api.mainnet-beta.solana.com");
const usdcInfo = lookupKnownSPLToken(network, "USDC");
const usdcMint = new PublicKey(usdcInfo.address);

const wallet = {
  network,
  publicKey: keypair.publicKey,
  updateTransaction: async (tx: VersionedTransaction) => {
    tx.sign([keypair]);
    return tx;
  },
};

const handler = createPaymentHandler(wallet, usdcMint, connection);
const fetchWithPayer = wrap(fetch, { handlers: [handler] });

const response1 = await fetch("https://api.mainnet-beta.solana.com", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "getHealth",
  }),
});

const data1 = await response1.json();
console.log(data1);

const response2 = await fetch("https://helius.api.corbits.dev", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "getBlockHeight",
  }),
});

const data2 = await response2.json();
console.log(data2);

const response3 = await fetchWithPayer("https://helius.api.corbits.dev", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "getBlockHeight",
  }),
});
const data3 = await response3.json();
console.log(data3);
