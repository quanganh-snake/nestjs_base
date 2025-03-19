import { hash, compare } from 'bcrypt';
const saltRounds = 10;

export const hashWithBcrypt = (data: string): Promise<string> => {
  return hash(data, saltRounds);
}

export const compareWithBcrypt = (data: string, hash: string): Promise<boolean> => {
  return compare(data, hash);
}