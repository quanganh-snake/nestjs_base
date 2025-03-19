import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/database/entities/permission.entity';
import { Role } from 'src/database/entities/role.entity';
import { User } from 'src/database/entities/user.entity';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { hashWithBcrypt } from 'src/utils/hashing';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    private readonly dataSource: DataSource
  ) { }

  // 1. Lấy tất cả người dùng
  async findAll() {
    return await this.userRepository.find({
      where: {
        status: true
      },
      relations: {
        roles: true,
      }
    });
  }

  // 2. Lấy người dùng theo id
  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        status: true
      },
      relations: {
        roles: {
          permissions: true
        },
        permissions: false
      }
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // 3. Tạo người dùng
  async create(dataUser: CreateUserDto) {
    // 1. Kiểm tra email đã tồn tại chưa
    const emailExist = await this.checkEmailExist(dataUser.email);
    if (emailExist) {
      throw new ConflictException('Email đã tồn tại');
    }
    // 2. Kiểm tra username đã tồn tại chưa
    const usernameExist = await this.checkUsernameExist(dataUser.username);
    if (usernameExist) {
      throw new ConflictException('Username đã tồn tại');
    }

    // 3. Mở transaction
    /**
     * Vì đang xử lý nhiều bảng: users, roles, permissions
     * Nếu lỗi xảy ra giữa chừng (ví dụ: tìm role thất bại), dữ liệu sẽ bị lưu không đồng bộ.
     */
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 4. Hash password
      const { roles, permissions, ...bodyUser } = dataUser;
      const hashPassword = await hashWithBcrypt(bodyUser.password);
      const newUserWithHashPassword = { ...bodyUser, password: hashPassword };

      // 5. Tạo user
      const user = this.userRepository.create(newUserWithHashPassword);
      await queryRunner.manager.save(user);

      // 6. Xử lý roles (nếu có)
      if (roles?.length) {
        const roleList = await this.roleRepository.findBy({ id: In(roles) });
        if (roleList.length !== roles.length) {
          throw new NotFoundException('Một hoặc nhiều roles không tồn tại');
        }
        user.roles = roleList;
      }

      // 7. Xử lý permissions (nếu có)
      if (permissions?.length) {
        const permissionList = await this.permissionRepository.findBy({ id: In(permissions) });
        if (permissionList.length !== permissions.length) {
          throw new NotFoundException('Một hoặc nhiều permissions không tồn tại');
        }
        user.permissions = permissionList;
      }

      // 8. Lưu user và commit transaction
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      // 9. Trả về user an toàn (ẩn password)
      const { password, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      // Trường hợp xảy ra lỗi: Thì rollback lại transaction
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Trường hợp không xảy ra lỗi: Thì release
      await queryRunner.release();
    }
  }

  // 4. Cập nhật người dùng
  async update(id: number, body: UpdateUserDto) {
    // 1. Mở transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Kiểm tra người dùng có tồn tại không
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      // 3. Cập nhật thông tin cơ bản của user
      const { roles, permissions, ...bodyUser } = body;

      if (bodyUser.password) {
        bodyUser.password = await hashWithBcrypt(bodyUser.password);
      }
      Object.assign(user, bodyUser);

      // 4. Kiểm tra và cập nhật roles nếu có
      if (roles?.length) {
        const roleList = await this.roleRepository.findBy({ id: In(roles) });
        if (roleList.length !== roles.length) {
          throw new NotFoundException('Một hoặc nhiều roles không tồn tại');
        }
        user.roles = roleList;
      }

      // 5. Kiểm tra và cập nhật permissions nếu có
      if (permissions?.length) {
        const permissionList = await this.permissionRepository.findBy({ id: In(permissions) });
        if (permissionList.length !== permissions.length) {
          throw new NotFoundException('Một hoặc nhiều permissions không tồn tại');
        }
        user.permissions = permissionList;
      }

      // 6. Lưu thay đổi vào database
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      // 7. Trả về dữ liệu user an toàn (ẩn password)
      const { password: _, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 5. Xoá người dùng
  async delete(id: number): Promise<boolean> {
    // Tạo queryRunner và bắt đầu transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Kiểm tra user có tồn tại không
      const user = await queryRunner.manager.findOne(User, { where: { id } });
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      // 2. Xoá user (nếu quan hệ được cascade thì sẽ tự động xử lý các liên kết)
      await queryRunner.manager.remove(user);

      // 3. Commit transaction
      await queryRunner.commitTransaction();

      // 4. Trả về thông báo thành công
      return true;
    } catch (error) {
      // Nếu có lỗi, rollback transaction
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Giải phóng queryRunner
      await queryRunner.release();
    }
  }

  // 6. Kiểm tra email đã tồn tại chưa
  async checkEmailExist(email: string) {
    return await this.userRepository.findOne({
      where: {
        email
      }
    });
  }

  // 7. Kiểm tra username đã tồn tại chưa
  async checkUsernameExist(username: string) {
    return await this.userRepository.findOne({
      where: {
        username
      }
    });
  }


}
