import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class User extends BaseEntity{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    username:string;
    
    @Column()
    password:string;
    
    static async findByUsername(username:string){
        console.log('..finding the user!')
        return await this.createQueryBuilder('user').where('user.username = :username', { username }).getCount();
    }
    
    static async findUser(username: string){
        return await this.createQueryBuilder('user').where('user.username = :username', { username }).getOne();
    }
}
