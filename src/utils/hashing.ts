import { hash, compare } from 'bcrypt';
import { AES, enc } from 'crypto-js';

const saltRounds = 10;

export const hashWithBcrypt = (data: string): Promise<string> => {
  return hash(data, saltRounds);
}

export const compareWithBcrypt = (data: string, hash: string): Promise<boolean> => {
  return compare(data, hash);
}

export const encryptData = (plainText: string): string => {
  return AES.encrypt(plainText, process.env.KEY_SECRET_CRYPTO).toString();
}

export const decryptData = (cypherText: string): string => {
  const bytes = AES.decrypt(cypherText, process.env.KEY_SECRET_CRYPTO);
  const decryptedData = JSON.parse(bytes.toString(enc.Utf8));
  return decryptedData;
}