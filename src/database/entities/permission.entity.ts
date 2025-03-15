import { Role } from "src/database/entities/role.entity";
import { User } from "src/database/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50
  })
  name: string;

  @Column({
    type: 'boolean',
    default: true
  })
  status: boolean;

  // START: Relationship
  // Many-to-Many với bảng Roles thông qua bảng trung gian roles_permissions
  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: 'roles_permissions', // Tên bảng trung gian
    // join cột permission_id trong bảng trung gian đại diện cho bảng permissions
    // referencedColumnName: 'id' => Cột id của bảng permissions được ánh xạ vào permission_id trong roles_permissions.
    joinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    // inverseJoinColumn: Cột role_id trong bảng trung gian đại diện cho bảng roles
    // referencedColumnName: 'id' => Cột id của bảng roles được ánh xạ vào role_id trong roles_permissions.
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role

  @ManyToMany(() => User, (user) => user.permissions)
  users: User[];
  // END: Relationship

  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updated_at: Date;
}
