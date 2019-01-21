import 'reflect-metadata';
import {
  Column,
  createConnection,
  Entity,
  getManager,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;
}

@Entity()
export class Party {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToMany(type => Guests, user => user.party)
  guests: User[];
}

@Entity()
export class Guests {
  @ManyToOne(type => User, {
    cascade: true,
    nullable: false,
  })
  @PrimaryColumn('uuid')
  user: User;

  @ManyToOne(type => Party, {
    cascade: true,
    nullable: false,
  })
  @PrimaryColumn('uuid')
  party: Party;

  @Column({
    default: false
  })
  confirmed: boolean;
}

const run = async () => {
  try {
    await createConnection({
      dropSchema: true,
      entities: [
        User,
        Party,
        Guests
      ],
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

    const party = new Party();
    party.guests = [user1, user3];

    // I would expect this to create an entry
    // in Party and two entries in Guests
    await manager.save(party);
  } catch (err) {
    console.log(`Error ${err}`);
    process.exit(1);
  }
}

run();
