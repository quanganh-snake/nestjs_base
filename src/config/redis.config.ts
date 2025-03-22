import { config as dotenvConfig } from 'dotenv';
import { registerAs } from "@nestjs/config";
import { enumConfigRedis } from 'src/constants/redis.const';
dotenvConfig();

export default registerAs(enumConfigRedis.prefix, () => ({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT) || 6379,
}))