import { Permission } from "src/database/entities/permission.entity";
import { User } from "src/database/entities/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar'
  })
  name: string

  @Column({
    type: 'boolean'
  })
  status: boolean

  // START: Relationship
  /**
   * Không có @JoinTable()
   * Vì bảng trung gian chỉ được định nghĩa ở một phía (users).
   * Trong TypeORM, chỉ cần định nghĩa @JoinTable() ở một phía của quan hệ Many-to-Many, phía còn lại chỉ cần @ManyToMany().
   */
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
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
