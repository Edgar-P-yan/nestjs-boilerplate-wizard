import * as prompts from 'prompts';
import * as upath from 'upath';
import * as fs from 'fs';
import * as path from 'path';
import * as execa from 'execa';
import * as rimraf from 'rimraf';
import * as chalk from 'chalk';
import { uninstallPackages } from './utils';
import { initTypeOrm } from './typeorm/init-typeorm';

const packagesToUninstallAfterWizardThing = [
  'prompts',
  '@types/prompts',
  'upath',
  'execa',
  'rimraf',
  '@types/rimraf',
  'ejs',
  '@types/ejs',
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
  ]);

  const appRootPath = getAppRootPath();
  const packageManager = detectPackageManager();

  modifyFiles({ packageName: answers.packageName });

  if (answers.typeorm !== 'none') {
    await initTypeOrm({ packageManager, appRootPath, answers });
  }

  uninstallPackages(packageManager, packagesToUninstallAfterWizardThing);

  removePackageManagerLockFilesFromGitIgnore();

  setUpTheRepository();

  removeAndClearFiles();

  formatTheCode({ packageManager });
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
  rimraf.sync(__dirname);

  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  delete packageJson.scripts.postinstall;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
  );
}

function setUpTheRepository(): void {
  rimraf.sync(path.join(__dirname, '..', '.git'));
  execa.commandSync('git init');
}

function removePackageManagerLockFilesFromGitIgnore(): void {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

  gitignoreContent = gitignoreContent.replace('\n/yarn.lock\n', '\n');

  fs.writeFileSync(gitignorePath, gitignoreContent);
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
