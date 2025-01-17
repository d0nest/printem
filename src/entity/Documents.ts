import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
// import { User } from "./User";

@Entity()
export class Document extends BaseEntity{
    
    @PrimaryGeneratedColumn('uuid')
    id: string;  

    @Column()
    originalFilename: string;  

    @Column()
    newFilename: string;  

    @Column()
    mimeType: string;  

    @Column('int')
    size: number;  

    @Column()
    filePath: string;  
    
    @Column({type: 'timestamp',  default:  () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.document)  
    user: Awaited<User>;
    
    static async bringLimitedDocumentsFromUser(offset: number, limit: number, username : string) {
        try{
            const user = await User.findUser(username);
            return await this.createQueryBuilder('document').where('document.user = :userid', { userid: user.id}).orderBy('document.createdAt', 'ASC').offset(offset).limit(limit).getMany();
        }
        catch(err){
            console.log('error in bringlimiteddocumentsfromuser', err)
        }
    }
    
}