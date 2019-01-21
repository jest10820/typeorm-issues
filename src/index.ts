import 'reflect-metadata';
import {
  Column,
  createConnection,
  Entity,
  getManager,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;
}

@Entity({ name: 'party' })
export class Party {
	@PrimaryGeneratedColumn('uuid')
	id: string;

  @OneToMany(type => Guests, guest => guest.party, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  guests: User[] | null;
}

@Entity({ name: 'guests' })
@Index((relation: Guests) => [relation.user, relation.party], { unique: true })
export class Guests {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(type => User, user => user.id, {
    nullable: false,
    primary: true,
  })
  user: User;

  @ManyToOne(type => Party, party => party.id, {
    nullable: false,
    primary: true,
  })
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

    console.log(party);
    // I would expect this to create an entry
    // in Party and two entries in Guests
    const myParty = await manager.save(party);
    console.log(myParty);

    const myPartyGuests = await manager.findOne(Party, myParty.id, {
      relations: ['guests']
    });
    console.log(myPartyGuests);
  } catch (err) {
    console.log(`Error ${err}`);
    process.exit(1);
  }
}

run();
