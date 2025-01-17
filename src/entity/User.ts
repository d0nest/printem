import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { Document } from "./Documents";
// import { Document } from "./Documents";
// import { Document } from "./Documents";

@Entity()
export class User extends BaseEntity{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    username:string;
    
    @Column()
    password:string;
    
    @OneToMany(() => Document, document => document.user) 
    document: Awaited<Document[]>;
    
    static async findByUsername(username:string){
        console.log('..finding the user!')
        return await this.createQueryBuilder('user').where('user.username = :username', { username }).getCount();
    }
    
    static async findUser(username: string){
        return await this.createQueryBuilder('user').where('user.username = :username', { username }).getOne();
    }
    
}
