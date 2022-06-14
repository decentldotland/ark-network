import Arweave from "arweave";

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
