# Seeder

- Dùng để tự sinh dữ liệu vào database

- Thư viện dùng:

```bash

npm i typeorm-seeding

```

## Example

```typescript
import { User } from 'src/entities/user.entity';
import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await factory(User)().createMany(10);
  }
}
```
