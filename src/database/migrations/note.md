# **Migrations** (https://docs.nestjs.com/techniques/database#migrations)

- Dùng quản lý Database, đồng bộ dữ liệu - cấu trúc

- Dùng với TypeORM: https://typeorm.io/using-cli#installing-cli

- Cấu hình script chạy lệnh tự động:

```json

    "scripts": {
      "migration:create": "npm run typeorm -- migration:create ./src/databases/migrations/%npm_config_name%",
      "migration:run": "npm run typeorm migration:run -- -d ./src/config/typeorm.ts",
      "migration:rollback": "npm run typeorm -- -d ./src/config/typeorm.ts migration:revert",
      "migration:generate": "npm run typeorm -- -d ./src/config/typeorm.ts migration:generate ./src/databases/migrations/%npm_config_name%",
      "migration:drop": "npm run typeorm schema:drop -- -d ./src/config/typeorm.ts",
      "seed:config": "ts-node -r tsconfig-paths/register ./node_modules/typeorm-seeding/dist/cli.js config",
      "seed:run": "ts-node -r tsconfig-paths/register ./node_modules/typeorm-seeding/dist/cli.js seed"
    }

```
