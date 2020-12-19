import { registerAs } from '@nestjs/config';

export const typeormConfigsFactory = registerAs('typeorm', () => ({
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  keepConnectionAlive: true,
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  migrationsRun: true,
  logging: process.env.NODE_ENV === 'development',
}));
