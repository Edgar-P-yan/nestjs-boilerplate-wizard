import { registerAs } from '@nestjs/config';
import { ConnectionOptions } from 'typeorm';

export const typeormConfigsFactory = registerAs(
  'typeorm',
  (): ConnectionOptions => ({
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    migrationsRun: true,
    logging: process.env.NODE_ENV === 'development',
  }),
);
