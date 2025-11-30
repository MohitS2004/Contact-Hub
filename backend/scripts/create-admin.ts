import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
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

async function createAdmin() {
  try {
    await dataSource.initialize();
    console.log('Database connected');

    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';

    // Check if user exists
    const userRepository = dataSource.getRepository(User);
    let user = await userRepository.findOne({ where: { email } });

    if (user) {
      // Update existing user to admin
      user.role = UserRole.ADMIN;
      await userRepository.save(user);
      console.log(`✅ User ${email} updated to admin role`);
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      user = userRepository.create({
        email,
        passwordHash,
        role: UserRole.ADMIN,
      });
      await userRepository.save(user);
      console.log(`✅ Admin user created: ${email}`);
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();

