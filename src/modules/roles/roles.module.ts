import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/database/entities/role.entity';
import { PermissionsModule } from 'src/modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    PermissionsModule
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule { }
