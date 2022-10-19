import { sleepBlockCount } from "./utils/arweave/network.js";
import { getTransaction } from "./utils/evm/ethers.js";
import {
  getOracleState,
  getStats,
  getNetworkAddresses,
} from "./utils/cache-utils.js";
import { runPolling } from "./utils/polling.js";
import { getArkProfile } from "./utils/server-utils.js";
import express from "express";
import base64url from "base64url";
import cors from "cors";
import { gzip } from "node-gzip";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.use(
  cors({
    origin: "*",
  })
);

app.set("view engine", "ejs");

app.get("/v1/oracle/state", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const encodedState = (await getOracleState())?.res;
  if (!encodedState) {
    res.send(JSON.parse(`{}`));
    return;
  }
  const jsonRes = JSON.parse(base64url.decode(encodedState));
  res.send(jsonRes);
});

app.get("/v1/network/stats", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const stats = await getStats();
  res.send(stats);
});

app.get("/v1/network/addresses", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const addresses = await getNetworkAddresses();
  res.send(addresses);
});

app.get("/v1/profile/:network/:address/:compress?", async (req, res) => {
  const profile = await getArkProfile(req.params.network, req.params.address);
  if (!profile) {
    if (req.params.compress) {
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Encoding", "gzip")
      const data = await gzip(`{}`);
      res.send(data);
      return;
    }

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.parse(`{}`));
    return;
  }

  if (req.params.compress) {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Encoding", "gzip")
    const decodedRes = base64url.decode(profile)
    const data = await gzip(JSON.stringify(decodedRes));
    res.send(data);
    return;
  }
  res.setHeader("Content-Type", "application/json");
  const jsonRes = JSON.parse(base64url.decode(profile));
  res.send(jsonRes);
});

app.listen(port, async () => {
  while (true) {
    await runPolling();
    await sleepBlockCount(2);
    console.log(`listening at PORT:${port}`);
  }
});
