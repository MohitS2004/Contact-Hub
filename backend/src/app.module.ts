import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useSsl = config.get<string>('DB_SSL') === 'true';
        // Try using connection URI if provided, otherwise use individual parameters
        const connectionUri = config.get('DATABASE_URL');
        const baseConfig = {
          autoLoadEntities: true,
          synchronize: true, // set to false in production
          ssl: useSsl ? { rejectUnauthorized: false } : false,
        };

        if (connectionUri) {
          return {
            type: 'postgres',
            url: connectionUri,
            ...baseConfig,
          };
        }
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: parseInt(config.get('DB_PORT') || '5432', 10),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          ...baseConfig,
        };
      },
    }),
    AuthModule,
    AdminModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
