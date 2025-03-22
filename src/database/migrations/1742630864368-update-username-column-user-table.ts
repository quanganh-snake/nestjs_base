import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateUsernameColumnUserTable1742630864368 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('users', 'username', new TableColumn({
      name: 'username',
      type: 'varchar(50)',
      isUnique: true,
      isNullable: true,
      default: null
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('users', 'username', new TableColumn({
      name: 'username',
      type: 'varchar(50)',
      isUnique: true
    }))
  }

}
