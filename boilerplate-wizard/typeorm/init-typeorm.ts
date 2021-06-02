import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import ejs from 'ejs';
import { installPackages } from '../utils';
import _ from 'lodash';

const dbTypeToDriverPackageName = {
  postgres: 'pg',
  cockroachdb: 'pg',
  mysql: 'mysql',
  mariadb: 'mysql',
};

const dbTypeToDefaultPort = {
  postgres: 5432,
  cockroachdb: 5432,
  mysql: 3306,
  mariadb: 3306,
};

export async function initTypeOrm(options: {
  packageManager: 'npm' | 'yarn';
  appRootPath: string;
  answers: prompts.Answers<'packageName' | 'typeorm'>;
}): Promise<void> {
  const dbDriverPackageName =
    dbTypeToDriverPackageName[options.answers.typeorm];

  installPackages(options.packageManager, [
    '@nestjs/typeorm',
    'typeorm',
    dbDriverPackageName,
  ]);

  fs.writeFileSync(
    path.join(options.appRootPath, 'ormconfig.js'),
    await ejs.renderFile(path.join(__dirname, 'ormconfig.js'), {
      dbType: options.answers.typeorm,
    }),
  );

  fs.writeFileSync(
    path.join(options.appRootPath, 'src', 'config', 'typeorm.config.ts'),
    await ejs.renderFile(path.join(__dirname, 'typeorm.config.ts'), {
      dbType: options.answers.typeorm,
    }),
  );

  fs.appendFileSync(
    path.join(options.appRootPath, '.env.example'),
    await ejs.renderFile(path.join(__dirname, '.env.example'), {
      dbType: options.answers.typeorm,
      dbPort: dbTypeToDefaultPort[options.answers.typeorm],
      dbUsername: options.answers.typeorm,
      dbPassword: options.answers.typeorm,
      dbName: _.snakeCase(options.answers.packageName),
    }),
  );

  const configIndexPath = path.join(
    options.appRootPath,
    'src',
    'config',
    'index.ts',
  );

  let configIndexContent = fs.readFileSync(configIndexPath, 'utf8');

  configIndexContent =
    `import { typeormConfigsFactory } from './typeorm.config';\n` +
    configIndexContent;

  configIndexContent = configIndexContent.replace(
    /load:\s*\[/g,
    `load: [typeormConfigsFactory, `,
  );

  fs.writeFileSync(configIndexPath, configIndexContent);

  const appModulePath = path.join(
    options.appRootPath,
    'src',
    'app',
    'app.module.ts',
  );

  let appModuleContent = fs.readFileSync(appModulePath, 'utf8');

  // import the ConfigService from @nestjs/config
  appModuleContent =
    `import { ConfigService } from '@nestjs/config';\n` + appModuleContent;

  // import the TypeOrmModule from @nestjs/typeorm
  appModuleContent =
    `import { TypeOrmModule } from '@nestjs/typeorm';\n` + appModuleContent;

  appModuleContent = appModuleContent.replace(
    /imports:\s*\[/g,
    `imports: [
      TypeOrmModule.forRootAsync({
        useFactory: (configService: ConfigService) => configService.get('typeorm'),
        inject: [ConfigService],
      }),
    `,
  );

  fs.writeFileSync(appModulePath, appModuleContent);

  fs.mkdirSync(path.join(options.appRootPath, 'src', 'migrations'));
  fs.writeFileSync(
    path.join(options.appRootPath, 'src', 'migrations', '.gitkeep'),
    '',
  );
}
