# **Migrations** (https://docs.nestjs.com/techniques/database#migrations)

- Dùng quản lý Database, đồng bộ dữ liệu - cấu trúc

- Dùng với TypeORM: https://typeorm.io/using-cli#installing-cli

## Quan trọng:

1. Migration của TypeORM cần cấu hình chạy theo DataSource

2. Lệnh của Migration TypeORM cần chạy các file migration đã được build ở folder `dist`

VD: `npm run typeorm migration:run -- -d ./src/config/database.config.ts`

- Cấu hình script chạy lệnh tự động:

```json

    "scripts": {
      "migration:create": "npm run typeorm -- migration:create ./src/databases/migrations/%npm_config_name%",
      "migration:run": "npm run typeorm migration:run -- -d ./src/config/database.config.ts",
      "migration:rollback": "npm run typeorm -- -d ./src/config/database.config.ts migration:revert",
      "migration:generate": "npm run typeorm -- -d ./src/config/database.config.ts migration:generate ./src/databases/migrations/%npm_config_name%",
      "migration:drop": "npm run typeorm schema:drop -- -d ./src/config/database.config.ts",
      "seed:config": "ts-node -r tsconfig-paths/register ./node_modules/typeorm-seeding/dist/cli.js config",
      "seed:run": "ts-node -r tsconfig-paths/register ./node_modules/typeorm-seeding/dist/cli.js seed"
    }

```
