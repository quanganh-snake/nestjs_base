// Configuration namespaces
// https://docs.nestjs.com/techniques/configuration#configuration-namespaces

import { registerAs } from "@nestjs/config";

export default registerAs('system', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV,
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtActExpiresIn: process.env.JWT_ACT_EXPIRES_IN,
  jwtRefExpiresIn: process.env.JWT_REF_EXPIRES_IN,
  jwtResetPassExpiresIn: process.env.JWT_RESET_PASS_EXPIRES_IN,
}));
