import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class User {
  @Column()
  email!: string

  @PrimaryColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  password!: string

  @Column()
  passwordSalt!: string

  @Column()
  phone!: string

  @Column()
  type!: number
}
