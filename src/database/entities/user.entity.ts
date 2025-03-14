import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

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
    type: 'varchar'
  })
  role: string

  @Column({
    type: 'boolean'
  })
  status: boolean

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
