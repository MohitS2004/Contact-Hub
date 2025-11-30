import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function setAdmin() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const email = 'admin@gmail.com';
    const userRepository = dataSource.getRepository(User);
    
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      console.error(`❌ User with email ${email} not found. Please register first.`);
      await dataSource.destroy();
      process.exit(1);
    }

    // Update user to admin
    user.role = UserRole.ADMIN;
    await userRepository.save(user);
    
    console.log(`✅ User ${email} has been set to ADMIN role`);
    console.log('You can now log in and access the admin dashboard at /admin');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setAdmin();

