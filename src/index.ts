import 'reflect-metadata';
import {
  Column,
  createConnection,
  Entity,
  getManager,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity({ name: 'users', schema: 'admin' })
@Tree('nested-set')
class UserModel {
  @PrimaryColumn('uuid')
  public id: string;
  @Column({ nullable: false })
  public email: string;

  @TreeParent()
  public manager: UserModel;

  @TreeChildren()
  public managerOf: UserModel[];
}

const run = async () => {
  try {
    const connection = await createConnection({
      entities: [
        UserModel,
      ],
      logging: ['error', 'query', 'schema'],
      type: 'postgres',
      url: 'postgres://postgres:postgres@database:5432/typeorm',
    });
    await connection.query('CREATE SCHEMA IF NOT EXISTS admin');
    await connection.synchronize();
    const manager = getManager();

    const a1 = new UserModel();
    a1.id = uuid();
    a1.email = 'a1@test.com';
    await manager.save(a1);

    const a11 = new UserModel();
    a11.id = uuid();
    a11.email = 'a11@test.com';
    a11.manager = a1;
    await manager.save(a11);

    const a12 = new UserModel();
    a12.id = uuid();
    a12.email = 'a12@test.com';
    a12.manager = a1;
    await manager.save(a12);

    const a111 = new UserModel();
    a111.id = uuid();
    a111.email = 'a111@test.com';
    a111.manager = a11;
    await manager.save(a111);

    const a112 = new UserModel();
    a112.id = uuid();
    a112.email = 'a112@test.com';
    a112.manager = a11;
    await manager.save(a112);
  } catch (err) {
    console.log(`Error ${err}`);
    process.exit(1);
  }
}

run();
