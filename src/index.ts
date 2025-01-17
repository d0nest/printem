import { AppDataSource } from "./data-source";


AppDataSource.initialize().then((datasource)=>{
    console.log('data source is initialized!')
}).catch((error)=>{
    console.error('haha', error);
})