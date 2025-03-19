import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/database/entities/permission.entity';
import { Role } from 'src/database/entities/role.entity';
import { PermissionsService } from 'src/modules/permissions/permissions.service';
import { CreateRoleDto } from 'src/modules/roles/dto/create-role.dto';
import { UpdateRoleDto } from 'src/modules/roles/dto/update-role.dto';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class RolesService {

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionService: PermissionsService,
  ) { }

  // 1. Load danh sách roles
  async findAll(): Promise<Role[]> {
    const role = await this.roleRepository.find({
      where: {
        status: true
      },
      relations: {
        permissions: true
      }
    });
    if (!role) {
      throw new NotFoundException('Không có role nào');
    }
    return role
  }

  // 2. Load chi tiết role
  findOne(id: number): Promise<Role> {
    return this.roleRepository.findOne({
      where: {
        id,
        status: true
      },
      relations: {
        permissions: true
      }
    });
  }

  // Chung
  async checkPermissionExist(permissionIds: number[]): Promise<Permission[]> {
    let dataPermissions: Permission[] = [];
    if (permissionIds && permissionIds.length > 0) {
      dataPermissions = await Promise.all(
        permissionIds.map((permissionId: number) => {
          return this.permissionService.findOne(permissionId);
        }),
      );
    }
    return dataPermissions
  }

  // 3. Tạo mới role
  async create(body: CreateRoleDto): Promise<Role> {
    // TODO: 1. Kiểm tra role đã tồn tại chưa
    const roleExist = await this.roleRepository.findOne({
      where: {
        name: ILike(body.name.trim())
      },
      relations: {
        permissions: true
      }
    })
    if (roleExist) {
      throw new ConflictException('Role đã tồn tại');
    }

    // TODO: 2. Tạo mới role
    const { permissions, ...dataRoleFromBody } = body;

    // Kiểm tra permissions có tồn tại không
    let permissionList = await this.checkPermissionExist(permissions);

    const roleCreate = this.roleRepository.create({
      ...dataRoleFromBody,
      permissions: permissionList
    });
    await this.roleRepository.save(roleCreate);
    return roleCreate
  }

  // 4. Cập nhật role
  async update(id: number, body: UpdateRoleDto): Promise<Role> {
    const roleExist = await this.roleRepository.findOne({
      where: {
        id
      }
    });
    if (!roleExist) {
      throw new NotFoundException('Role không tồn tại');
    }

    const { permissions, ...dataRoleFromBody } = body;

    // Kiểm tra permissions có tồn tại không
    let permissionList = await this.checkPermissionExist(permissions);

    roleExist.permissions = permissionList;

    if (roleExist.name) {
      roleExist.name = roleExist.name.trim();
    }

    const roleUpdate = {
      ...roleExist,
      ...dataRoleFromBody,
      permissions: permissionList
    }

    this.roleRepository.merge(roleExist, roleUpdate);
    await this.roleRepository.save(roleUpdate);
    return roleExist
  }
}
