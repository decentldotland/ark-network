import chalk from "chalk";

chalk.enabled = true;
chalk.level = 3;

export function green(text) {
  return chalk.green(text);
}

export function red(text) {
  return chalk.red(text);
}
