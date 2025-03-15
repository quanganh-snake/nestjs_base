import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateUsersPermissionsTable1742047216550 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users_permissions',
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'user_id',
          type: 'int',
          isNullable: true
        },
        {
          name: 'permission_id',
          type: 'int',
          isNullable: true
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()',
          onUpdate: 'now()'
        }
      ]
    }));
    // Tạo khoá phụ uesr_id cho bảng users_permissions
    await queryRunner.createForeignKey('users_permissions', new TableForeignKey({
      name: 'users_permissions_user_id_foreign_key',
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE'
    }))
    // Tạo khoá phụ permission_id cho bảng users_permissions
    await queryRunner.createForeignKey('users_permissions', new TableForeignKey({
      name: 'users_permissions_permission_id_foreign_key',
      columnNames: ['permission_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'permissions',
      onDelete: 'CASCADE'
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users_permissions', true, true, true);
  }

}
