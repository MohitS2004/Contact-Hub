import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Database connection is tested automatically by TypeORM on app startup
  // If connection fails, the app will throw an error and exit
  console.log('✅ Database connection established');
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
