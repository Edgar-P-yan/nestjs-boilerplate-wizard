import * as prompts from 'prompts';
import * as upath from 'upath';
import * as fs from 'fs';
import * as path from 'path';
import * as execa from 'execa';

async function main() {
  const suggestedPackageName = getSuggestedPackageName();

  const answers = await prompts([
    {
      type: 'text',
      name: 'packageName',
      initial: suggestedPackageName,
      message: 'How are you gonna name your app?',
    },
    {
      type: 'confirm',
      name: 'setUpTypeOrm',
      initial: true,
      message: 'Do you want me to set up TypeORM?',
    },
  ]);

  const packageManager = detectPackageManager();
  modifyFiles({ packageName: answers.packageName });

  if (answers.setUpTypeOrm) {
    setUpTypeORM({ packageManager });
  }

  formatTheCode({ packageManager });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setUpTypeORM(options: { packageManager: 'npm' | 'yarn' }) {
  if (options.packageManager === 'yarn') {
    execa.commandSync('yarn add typeorm @nestjs/typeorm pg');
  } else {
    execa.commandSync('npm install --save @nestjs/typeorm typeorm pg');
  }

  fs.copyFileSync(
    path.join(__dirname, 'typeorm', 'ormconfig.ts'),
    path.join(__dirname, '..', 'ormconfig.ts'),
  );
  fs.copyFileSync(
    path.join(__dirname, 'typeorm', 'typeorm.config.ts'),
    path.join(__dirname, '..', 'src', 'config', 'typeorm.config.ts'),
  );
  fs.appendFileSync(
    path.join(__dirname, '..', '.env.example'),
    fs.readFileSync(path.join(__dirname, 'typeorm', '.env.example')),
  );

  const configIndexPath = path.join(__dirname, '..', 'src/config/index.ts');
  let configIndexContent = fs.readFileSync(configIndexPath, 'utf8');
  configIndexContent =
    `import { typeormConfigsFactory } from './typeorm.config';\n` +
    configIndexContent;

  configIndexContent = configIndexContent.replace(
    /load:\s*\[/g,
    `load: [typeormConfigsFactory, `,
  );
  fs.writeFileSync(configIndexPath, configIndexContent);

  const appModulePath = path.join(__dirname, '..', 'src/app/app.module.ts');
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
}

function modifyFiles(options: { packageName: string }) {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = options.packageName;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
  );
}

function getSuggestedPackageName(): string {
  return upath.joinSafe(__dirname, '..').split('/').reverse()[0];
}

function detectPackageManager(): 'yarn' | 'npm' {
  try {
    fs.statSync(path.join(__dirname, '..', 'yarn.lock'));
    return 'yarn';
  } catch {
    return 'npm';
  }
}

function formatTheCode(options: { packageManager: 'npm' | 'yarn' }) {
  if (options.packageManager === 'yarn') {
    execa.commandSync('yarn format');
  } else {
    execa.commandSync('npm run format');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
