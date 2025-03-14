// Configuration namespaces
// https://docs.nestjs.com/techniques/configuration#configuration-namespaces

import { registerAs } from "@nestjs/config";

export default registerAs('system', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV,
}));
