import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

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
