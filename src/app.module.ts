import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import databaseConfig from 'src/config/database.config';
import { validateEnvConfig } from 'src/validations/env.validation';
import systemConfig from 'src/config/system.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AuthModule } from './modules/auth/auth.module';
import { enumConfigDatabase } from 'src/constants/database.const';
import { RedisModule } from '@nestjs-modules/ioredis';
import { enumConfigRedis } from 'src/constants/redis.const';
import redisConfig from 'src/config/redis.config';

const APP_CONFIG = 'APP_CONFIG';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [databaseConfig, systemConfig, redisConfig],
      validate: validateEnvConfig,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync(
      {
        imports: [AppModule],
        inject: [APP_CONFIG], // Thay vì inject ConfigService
        useFactory: (appConfig) => appConfig.database, // Lấy cấu hình từ APP_CONFIG
      }
    ),
    RedisModule.forRootAsync({
      imports: [AppModule],
      inject: [APP_CONFIG],
      useFactory: (appConfig) => {
        return ({
          type: 'single',
          url: `redis://${appConfig.redis.host}:${appConfig.redis.port}`,
        })
      }, // Lấy cấu hình từ APP_CONFIG
    }),
    // modules
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      inject: [ConfigService],
      provide: APP_CONFIG, // Provider tập trung cho tất cả cấu hình
      useFactory: (configService: ConfigService) => {
        return ({
          database: configService.get(enumConfigDatabase.db),
          redis: {
            host: configService.get(enumConfigRedis.host),
            port: configService.get(enumConfigRedis.port),
          },
        })
      },

    },
  ],
  exports: [APP_CONFIG],

})
export class AppModule { }
