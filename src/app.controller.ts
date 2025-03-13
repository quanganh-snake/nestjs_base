import { Controller, Get, Ip } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(@Ip() ip: any) {

    console.log('ip: ', ip);

    return { ip };
  }
}
