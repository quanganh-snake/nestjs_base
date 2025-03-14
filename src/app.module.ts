import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import databaseConfig from 'src/config/database.config';
import { validateEnvConfig } from 'src/validations/env.validation';
import systemConfig from 'src/config/system.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [databaseConfig, systemConfig],
      validate: validateEnvConfig,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync(
      {
        // inject: [ConfigService],
        // useFactory: async (configService: ConfigService) => configService.get('database')
        useFactory: () => ({
          type: 'mysql',
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT) || 5432,
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          entities: ['dist/database/entities/*{.ts,.js}'],
          migrations: ['dist/database/migrations/*{.ts,.js}'],
          autoLoadEntities: true,
          synchronize: false,
        })
      }
    ),
    // Import the UsersModule
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
