import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '@/base/entities';
import { Account } from '@/modules/auth/entities/account.entity';

import { Gender } from '../enums/gender.enum';

@Entity({
  schema: 'public',
  name: 'users',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(
    () => Account,
    (account: Account) => account.id
  )
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column('varchar', { length: 128, nullable: true })
  firstName: string | null = null;

  @Column('varchar', { length: 128, nullable: true })
  lastName: string | null = null;

  @Column('enum', { enum: Gender, enumName: 'Gender', nullable: true })
  gender: Gender | null = null;
}
