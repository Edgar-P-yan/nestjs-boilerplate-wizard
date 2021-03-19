import { ConfigType, registerAs } from '@nestjs/config';

export const appConfigsFactory = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || 'localhost',
}));

export const APP_CONFIGS_KEY = appConfigsFactory.KEY;

export type TAppConfigs = ConfigType<typeof appConfigsFactory>;
