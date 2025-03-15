import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRolesPermissionsTable1742053273268 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'roles_permissions',
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'role_id',
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
    // Tạo khoá phụ role_id cho bảng roles_permissions
    await queryRunner.createForeignKey('roles_permissions', new TableForeignKey({
      name: 'roles_permissions_role_id_foreign_key',
      columnNames: ['role_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'roles',
      onDelete: 'CASCADE'
    }))
    // Tạo khoá phụ permission_id cho bảng roles_permissions
    await queryRunner.createForeignKey('roles_permissions', new TableForeignKey({
      name: 'roles_permissions_permission_id_foreign_key',
      columnNames: ['permission_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'permissions',
      onDelete: 'CASCADE'
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roles_permissions', true, true, true);
  }

}
