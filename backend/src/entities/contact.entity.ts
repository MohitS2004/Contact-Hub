import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  photo?: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.contacts, { eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => "timezone('utc', now())",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => "timezone('utc', now())",
    onUpdate: "timezone('utc', now())",
  })
  updatedAt: Date;
}

