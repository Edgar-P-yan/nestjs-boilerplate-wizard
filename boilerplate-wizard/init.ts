import * as prompts from 'prompts';
import * as upath from 'upath';
import * as fs from 'fs';
import * as path from 'path';
import * as execa from 'execa';
import * as rimraf from 'rimraf';
import * as chalk from 'chalk';
import { uninstallPackages } from './utils';
import { initTypeOrm } from './typeorm/init-typeorm';
import { initDocker } from './docker/init-docker';
import { initReadme } from './readme/init-readme';
import { initSwagger } from './swagger/init-swagger';
import * as ejs from 'ejs';

const packagesToUninstallAfterWizardThing = [
  'prompts',
  '@types/prompts',
  'upath',
  'execa',
  'rimraf',
  '@types/rimraf',
  'ejs',
  '@types/ejs',
  'lodash',
  '@types/lodash',
];

async function main(): Promise<void> {
  const suggestedPackageName = getSuggestedPackageName();

  const answers = await prompts([
    {
      type: 'text',
      name: 'packageName',
      initial: suggestedPackageName,
      message: 'How are you gonna name your app?',
    },
    {
      type: 'select',
      name: 'typeorm',
      message: `Select database type of TypeORM or select ${chalk.bold(
        'None',
      )} to skip TypeORM`,
      initial: 1,
      choices: [
        { title: 'None', value: 'none' },
        { title: 'PostgreSQL', value: 'postgres' },
        { title: 'MySQL', value: 'mysql' },
        { title: 'CockroachDB', value: 'cockroachdb' },
        { title: 'MariaDB', value: 'mariadb' },
      ],
    },
    {
      type: 'select',
      name: 'addSwagger',
      message: `Do you want Swagger UI?`,
      initial: 0,
      choices: [
        { title: 'Yes!', value: true },
        { title: 'Nope', value: false },
      ],
    },
  ]);

  const appRootPath = getAppRootPath();
  const packageManager = detectPackageManager();

  modifyFiles({ packageName: answers.packageName });

  const modificationsForCommonFiles: {
    addToMainTs: { newLines: string; newImports: string };
  }[] = [];

  if (answers.typeorm !== 'none') {
    await initTypeOrm({ packageManager, appRootPath, answers });
  }

  await initDocker({ packageManager, appRootPath, answers });

  await initReadme({ packageManager, appRootPath, answers });

  if (answers.addSwagger) {
    const result = await initSwagger({ packageManager, appRootPath, answers });
    modificationsForCommonFiles.push(result);
  }

  if (modificationsForCommonFiles.length) {
    await applyModificationsForCommonFiles(modificationsForCommonFiles, {
      appRootPath,
    });
  }

  uninstallPackages(packageManager, packagesToUninstallAfterWizardThing);

  setUpTheRepository();

  removeAndClearFiles();

  formatTheCode({ packageManager });
}

async function applyModificationsForCommonFiles(
  modificationsForCommonFiles: {
    addToMainTs: { newLines: string; newImports: string };
  }[],
  params: { appRootPath: string },
): Promise<void> {
  const addToMainTsNewLines = modificationsForCommonFiles
    .map((modification) => modification.addToMainTs.newLines)
    .join('\n');

  const addToMainTsImports = modificationsForCommonFiles
    .map((modification) => modification.addToMainTs.newImports)
    .join('\n');

  fs.writeFileSync(
    path.join(params.appRootPath, 'src', 'main.ts'),
    await ejs.renderFile(path.join(__dirname, 'common-files', 'main.ts'), {
      newLines: addToMainTsNewLines,
      newImports: addToMainTsImports,
    }),
  );
}

function modifyFiles(options: { packageName: string }): void {
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

function formatTheCode(options: { packageManager: 'npm' | 'yarn' }): void {
  if (options.packageManager === 'yarn') {
    execa.commandSync('yarn format');
  } else {
    execa.commandSync('npm run format');
  }
}

function removeAndClearFiles(): void {
  // Remove /boilerplate-wizard folder
  rimraf.sync(__dirname);

  // Remove the postinstall script from package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  delete packageJson.scripts.postinstall;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
  );

  // Remove /yarn.lock and /test-dir from .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

  gitignoreContent = gitignoreContent
    .replace('\n/yarn.lock', '')
    .replace('\n/test-dir', '');

  fs.writeFileSync(gitignorePath, gitignoreContent);
}

function setUpTheRepository(): void {
  rimraf.sync(path.join(__dirname, '..', '.git'));
  execa.commandSync('git init');
  execa.commandSync('git checkout -b main');
}

function getAppRootPath(): string {
  return path.join(__dirname, '..');
}

if (!process.env.DONT_INIT_WIZARD) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
