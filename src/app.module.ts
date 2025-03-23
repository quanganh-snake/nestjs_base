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
import { MailerModule } from '@nestjs-modules/mailer';
import mailerConfig from 'src/config/mailer.config';
import { enumConfigMailer } from 'src/constants/mailer.const';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

const APP_CONFIG = 'APP_CONFIG';
type TAppConfig = {
  database: any,
  redis: {
    host: string,
    port: number,
  },
  mailer: {
    host: string,
    port: number,
    user: string,
    pass: string,
    from: string,
    secure: boolean,
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [databaseConfig, systemConfig, redisConfig, mailerConfig],
      validate: validateEnvConfig,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync(
      {
        imports: [AppModule],
        inject: [APP_CONFIG], // Thay vì inject ConfigService
        useFactory: (appConfig: TAppConfig) => appConfig.database, // Lấy cấu hình từ APP_CONFIG
      }
    ),
    RedisModule.forRootAsync({
      imports: [AppModule],
      inject: [APP_CONFIG],
      useFactory: ({ redis }: TAppConfig) => {
        return ({
          type: 'single',
          url: `redis://${redis.host}:${redis.port}`,
        })
      }, // Lấy cấu hình từ APP_CONFIG
    }),
    MailerModule.forRootAsync({
      imports: [AppModule],
      inject: [APP_CONFIG],
      useFactory: ({ mailer }: TAppConfig) => {
        const transportMailer = `${mailer.secure ? 'smtps' : 'smtp'}://${mailer.user}:${mailer.pass}@${mailer.host}`
        return ({
          transport: transportMailer,
          defaults: {
            from: '"TBQuangAnh NestJS Auth" <tbquanganh@gmail.com>'
          },
          template: {
            dir: __dirname + '/templates/emails/',
            adapter: new EjsAdapter({
              inlineCssEnabled: true,
            }),
            options: {
              strict: true,
            },
          },
        })
      }
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
      useFactory: (configService: ConfigService): TAppConfig => {
        return ({
          database: configService.get(enumConfigDatabase.db),
          redis: {
            host: configService.get(enumConfigRedis.host),
            port: configService.get(enumConfigRedis.port),
          },
          mailer: {
            host: configService.get(enumConfigMailer.host),
            port: configService.get(enumConfigMailer.port),
            user: configService.get(enumConfigMailer.user),
            pass: configService.get(enumConfigMailer.pass),
            from: configService.get(enumConfigMailer.from),
            secure: configService.get(enumConfigMailer.secure),
          }
        })
      },

    },
  ],
  exports: [APP_CONFIG],

})
export class AppModule { }
