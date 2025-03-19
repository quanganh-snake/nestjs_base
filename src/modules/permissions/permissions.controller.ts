import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from 'src/modules/permissions/dto/create-permission';
import { UpdatePermissionDto } from 'src/modules/permissions/dto/update-permission';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  // 1. Load danh sách permissions
  @Get()
  async findAll() {
    return this.permissionsService.findAll();
  }

  // 2. Load chi tiết permission
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findOne(id);
  }

  // 3. Tạo mới permission
  @Post()
  async create(@Body() body: CreatePermissionDto) {
    return this.permissionsService.create(body);
  }

  // 4. Cập nhật permission
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdatePermissionDto) {
    return this.permissionsService.update(id, body);
  }
}
