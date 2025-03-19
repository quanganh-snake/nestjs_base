import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from 'src/database/entities/role.entity';
import { CreateRoleDto } from 'src/modules/roles/dto/create-role.dto';
import { UpdateRoleDto } from 'src/modules/roles/dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  // 1. Load danh sách roles
  @Get()
  async findAll(): Promise<Role[]> {
    return await this.rolesService.findAll()
  }

  // 2. Load chi tiết role
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Role> {
    return await this.rolesService.findOne(id)
  }

  // 3. Tạo mới role
  @Post()
  async create(@Body() role: CreateRoleDto) {
    return await this.rolesService.create(role)
  }

  // 4. Cập nhật role
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() role: UpdateRoleDto) {
    return this.rolesService.update(id, role)
  }
}
