import { createRequire } from "module"; // Bring in the ability to create the 'require' method
export const require = createRequire(import.meta.url); // construct the require method