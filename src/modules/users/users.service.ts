import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { enumConfigDatabase } from 'src/constants/database.const';

@Injectable()
export class UsersService {

  constructor(
    private readonly configService: ConfigService
  ) { }

  getHello(): string {
    const dbUser = this.configService.get('database');
    return dbUser;
  }
}
