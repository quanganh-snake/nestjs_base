import { Permission } from "src/database/entities/permission.entity"
import { Role } from "src/database/entities/role.entity"
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar'
  })
  username: string

  @Column({
    type: 'varchar'
  })
  password: string

  @Column({
    type: 'varchar'
  })
  email: string

  @Column({
    type: 'varchar',
    length: 15
  })
  phone_number: string

  @Column({
    type: 'boolean'
  })
  status: boolean

  // START: Relationship
  // Many-to-Many với bảng Roles thông qua bảng trung gian users_roles
  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'users_roles', // Tên bảng trung gian
    // joinColumn: Cột user_id trong bảng trung gian đại diện cho bảng users
    // referencedColumnName: 'id' => Cột id của bảng users được ánh xạ vào user_id trong users_roles.
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    // inverseJoinColumn: Cột role_id trong bảng trung gian đại diện cho bảng roles
    // referencedColumnName: 'id' => Cột id của bảng roles được ánh xạ vào role_id trong users_roles.
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[];

  @ManyToMany(() => Permission, (permission) => permission.users, { cascade: true })
  @JoinTable({
    name: 'users_permissions', // Tên bảng trung gian
    // joinColumn: Cột user_id trong bảng trung gian đại diện cho bảng users
    // referencedColumnName: 'id' => Cột id của bảng users được ánh xạ vào user_id trong users_roles.
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    // inverseJoinColumn: Cột role_id trong bảng trung gian đại diện cho bảng roles
    // referencedColumnName: 'id' => Cột id của bảng roles được ánh xạ vào role_id trong users_roles.
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  // END: Relationship

  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at: Date

  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updated_at: Date
}
