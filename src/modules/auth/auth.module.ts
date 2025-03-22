import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { enumSystemConfig } from 'src/constants/system.const';
import { SocialLoginController } from 'src/modules/auth/social.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(enumSystemConfig.jwtSecret),
        signOptions: { expiresIn: configService.get<string>(enumSystemConfig.jwtActExpiresIn) },
      })
    })],
  controllers: [AuthController, SocialLoginController],
  providers: [AuthService],
})
export class AuthModule { }
