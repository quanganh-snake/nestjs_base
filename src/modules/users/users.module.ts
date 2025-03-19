import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/database/entities/role.entity';
import { Permission } from 'src/database/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission])
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
