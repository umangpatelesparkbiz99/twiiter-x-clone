import bcrypt from "bcrypt";
const SALT_ROUNDS = 12;

const hashPassword = async (plainText: string): Promise<string> => {
  return await bcrypt.hash(plainText, SALT_ROUNDS);
};

const comparePasword = async (
  plainText: string,
  hashPasswordVlaue: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainText, hashPasswordVlaue);
};

export { hashPassword, comparePasword };
