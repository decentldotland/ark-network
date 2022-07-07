import Arweave from "arweave";
import { green } from "../chalk.js";

export const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  port: 443,
  timeout: 60000,
  logging: false,
});

export async function getArweaveBlock() {
  try {
    const block = await arweave.blocks.getCurrent();

    return block;
  } catch (error) {
    console.log(error);
  }
}

export async function sleepBlockCount(count) {
  // default value incase count was not passed
  const blocks = count ? count : 3;
  // 1 block ~ 2min --> converted to millisecs
  console.log(green(`\n\nsleeping for ${blocks} Arweave network blocks (~${blocks * 2} minutes)\n\n`));
  return new Promise((resolve) => setTimeout(resolve, blocks * 2 * 60 * 1000));
}
