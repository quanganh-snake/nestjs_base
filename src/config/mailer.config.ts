import { config as dotenvConfig } from 'dotenv';
import { registerAs } from "@nestjs/config";
import { enumConfigMailer } from 'src/constants/mailer.const';
dotenvConfig();

export default registerAs(enumConfigMailer.prefix, () => ({
  host: process.env.MAILER_HOST,
  port: parseInt(process.env.MAILER_PORT) || 465,
  user: process.env.MAILER_AUTH_USER,
  pass: process.env.MAILER_AUTH_PASS,
  from: process.env.MAILER_FROM,
  secure: process.env.MAILER_SECURE === 'true',
}))