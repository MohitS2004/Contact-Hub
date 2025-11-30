import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Contact } from './src/entities/contact.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const useSsl = process.env.DB_SSL === 'true';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Contact],
  migrations: ['migrations/*.ts'],
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});
