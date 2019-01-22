import 'reflect-metadata';
import {
  Column,
  createConnection,
  Entity,
  getManager,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToMany(type => Guest, guest => guest.user)
  public parties: Guest[];
}
@Entity('parties')
export class Party {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToMany(type => Guest, guest => guest.party, {
    cascade: true,
    eager: true,
    // I'm not sure if I need this
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public users: Guest[];
}

@Entity('guests')
@Index(['user', 'party'], { unique: true })
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: number;

  @ManyToOne(type => User, user => user.parties, {
    eager: true,
    // I'm not sure if I need this
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public user: User;

  @ManyToOne(type => Party, party => party.users)
  public party: Party;

  @Column({
    default: false,
  })
  public confirmed: boolean;
}

const run = async () => {
  try {
    await createConnection({
      dropSchema: true,
      entities: [User, Party, Guest],
      logging: ['error', 'query'],
      synchronize: true,
      type: 'postgres',
      url: 'postgres://postgres:postgres@database:5432/typeorm',
    });
    const manager = getManager();

    const user1 = new User();
    await manager.save(user1);
    const user2 = new User();
    await manager.save(user2);
    const user3 = new User();
    await manager.save(user3);

    const party1 = new Party();
    const guest1 = new Guest();
    // guest1.user = user1;
    guest1.user = {
      id: user1.id,
    } as any;
    const guest2 = new Guest();
    guest2.user = user3;
    party1.users = [guest1, guest2];
    const savedParty = await manager.save(party1);

    let users = await manager
      .getRepository(User)
      .findOne(user1.id, { relations: ['parties'] });
    // tslint:disable-next-line:no-console
    console.log('User relations');
    // tslint:disable-next-line:no-console
    console.log(users);
    let party = await manager.getRepository(Party).findOne(savedParty.id);
    // tslint:disable-next-line:no-console
    console.log('Parties');
    // tslint:disable-next-line:no-console
    console.log(party);
    let relation = await manager
      .getRepository(Guest)
      .find({ where: { party: { id: savedParty.id } } });
    // tslint:disable-next-line:no-console
    console.log('Relations');
    // tslint:disable-next-line:no-console
    console.log(relation);

    const dbParty = await manager.getRepository(Party).findOne(savedParty.id);
    dbParty.users = [guest2];
    const newSave = await manager.save(dbParty);

    users = await manager
      .getRepository(User)
      .findOne(user1.id, { relations: ['parties'] });
    // tslint:disable-next-line:no-console
    console.log('User relations');
    // tslint:disable-next-line:no-console
    console.log(users);
    party = await manager.getRepository(Party).findOne(newSave.id);
    // tslint:disable-next-line:no-console
    console.log('Parties');
    // tslint:disable-next-line:no-console
    console.log(party);
    relation = await manager
      .getRepository(Guest)
      .find({ where: { party: { id: newSave.id } } });
    // tslint:disable-next-line:no-console
    console.log('Relations');
    // tslint:disable-next-line:no-console
    console.log(relation);
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(`Error ${err}`);
    process.exit(1);
  }
};

run();
