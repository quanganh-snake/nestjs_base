// Configuration namespaces
// https://docs.nestjs.com/techniques/configuration#configuration-namespaces

import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
  type: process.env.DATABASE_TYPE,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: ['dist/database/entities/*{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
}));
