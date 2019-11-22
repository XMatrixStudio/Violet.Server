import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity()
export class Passport {
  @PrimaryColumn()
  id!: number

  @Column()
  password!: string

  @Column()
  passwordSalt!: string
}
