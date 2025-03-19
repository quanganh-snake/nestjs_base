import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/database/entities/permission.entity';
import { CreatePermissionDto } from 'src/modules/permissions/dto/create-permission';
import { UpdatePermissionDto } from 'src/modules/permissions/dto/update-permission';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) { }

  // 1. Load danh sách permissions
  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find({
      where: {
        status: true,
      }
    });
  }

  // 2. Load chi tiết permission
  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({
      where: {
        id,
        status: true,
      }
    });
    if (!permission) {
      throw new NotFoundException('Không tìm thấy permission');
    }
    return permission;
  }

  // 3. Tạo mới permission
  async create(data: CreatePermissionDto): Promise<Permission> {
    const permissionExist = await this.permissionsRepository.findOne({
      where: {
        name: data.name.trim(),
        status: true,
      }
    })

    if (permissionExist) {
      throw new NotFoundException('Permission đã tồn tại');
    }

    const permission = this.permissionsRepository.create(data);
    return this.permissionsRepository.save(permission);
  }

  // 4. Cập nhật permission
  async update(id: number, data: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    this.permissionsRepository.merge(permission, data);
    return this.permissionsRepository.save(permission);
  }
}
