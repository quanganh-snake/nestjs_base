import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port: number = configService.get('system.port');

  // Áp dụng validation-pipe cho toàn bộ ứng dụng
  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true, // Dừng kiểm tra ngay khi gặp lỗi đầu tiên của DTO
    // Tự động loại bỏ các trường không cần thiết
    transform: true,
    // Tự động loại bỏ các trường không được khai báo
    whitelist: true,
    forbidNonWhitelisted: true,
    // Tự động chuyển đổi kiểu dữ liệu của các trường
    transformOptions: {
      enableImplicitConversion: true
    },
    exceptionFactory: (errors: ValidationError[]) => {
      const formattedErrors = errors.map((err) => ({
        field: err.property,
        error: Object.values(err.constraints)[0],
      }));

      return new BadRequestException(formattedErrors);
    },

  }));

  // Cấu hình prefix cho tất cả các routes
  app.setGlobalPrefix('api/v1/');
  await app.listen(port ?? 3000);
}
bootstrap();
