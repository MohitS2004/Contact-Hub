import { DataSource } from 'typeorm';
import { User } from './src/user.entity';
import { Contact } from './src/contact.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Contact],
  migrations: ['migrations/*.ts'],
});
