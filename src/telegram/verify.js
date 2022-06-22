import { getProfileBio } from "./getProfile.js";
import CryptoJS from "crypto-js";
import "../utils/setEnv.js";

export async function verifyUser(identity_id, username) {
  try {
    const bio = await getProfileBio(username);
    if (bio) {
      return bio === identity_id ? true : false;
    }

    return false;
  } catch (error) {
    console.log(error);
  }
}

export async function handleUsername(username) {
  const trimmed = username
    .trim()
    .split("")
    .filter((char) => char !== " ")
    .join("");

  const isValid = /.*\B@(?=\w{5,32}\b)[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*.*/gm.test(
    trimmed
  );

  if (!isValid) {
    return false;
  }
  return trimmed.replace("@", "");
}

export async function decodeUsername(encoded_username) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encoded_username, process.env.JWK);
    const username = decrypted.toString(CryptoJS.enc.Utf8);
    if (!username) {
      return false;
    }
    return username;
  } catch (error) {
    console.log(error);
    return false;
  }
}
