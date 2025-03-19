import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdatePhoneNumberColumnUserTable1742393763180 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn("users", "phone_number", new TableColumn({
      name: "phone_number",
      type: "varchar",
      length: "12",
      isNullable: true,
      default: null,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn("users", "phone_number", new TableColumn({
      name: "phone_number",
      type: "varchar",
    }));
  }

}
