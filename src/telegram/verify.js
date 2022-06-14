import { getProfileBio } from "./getProfile.js";

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
  return username.replace("@", "");
}
