import axios from "axios";
import { handleUsername, decodeUsername } from "./verify.js";

export async function getProfileBio(username) {
  try {
    const decodedUsername = await decodeUsername(username);

    if (!decodedUsername) {
      return false;
    }

    const usrname = await handleUsername(decodedUsername);
    const acc = await axios.get(`https://telegram.me/${usrname}`);
    const start = acc.data.indexOf(`<meta name="twitter:description"`);
    const end = acc.data.indexOf(
      `<meta name="twitter:app:name:iphone" content="Telegram Messenger">`
    );

    const bio = acc.data.substring(start + 42, end - 3);
    const res = bio.startsWith("ark:") ? bio.slice(4) : false;

    return res.trim();
  } catch (error) {
    console.log(error);
    return false;
  }
}
