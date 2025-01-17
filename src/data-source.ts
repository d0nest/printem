import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Document } from "./entity/Documents"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "d0nest",
    password: "1234",
    database: "printem",
    synchronize: true,
    logging: false,
    entities: [User,Document],
    migrations: [],
    subscribers: [],
})
