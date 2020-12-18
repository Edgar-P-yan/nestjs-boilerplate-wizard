import * as prompts from 'prompts';
import * as upath from 'upath';
import * as fs from 'fs';
import * as path from 'path';

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
      type: 'select',
      name: 'packageManager',
      initial: 0,
      message: 'What package manager do you prefer to use?',
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'Yarn', value: 'yarn' },
      ],
    },
    {
      type: 'confirm',
      name: 'setUpTypeOrm',
      initial: true,
      message: 'Do you want me to set up TypeORM?',
    },
  ]);

  modifyFiles({ packageName: answers.packageName });
  removePackageManagerLockFiles();

  if (answers.setUpTypeOrm) {
    setUpTypeORM({ packageManager: answers.packageManager });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setUpTypeORM(options: { packageManager: 'npm' | 'yarn' }) {
  console.log('Sorry, installation of TypeORM is not implemented yet');
}

function modifyFiles(options: { packageName: string }) {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = options.packageName;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function removePackageManagerLockFiles() {
  const lockFilePaths = [
    path.join(__dirname, '..', 'package-lock.json'),
    path.join(__dirname, '..', 'yarn.lock'),
  ];

  lockFilePaths.forEach((lockFilePath) => {
    try {
      fs.unlinkSync(lockFilePath);
    } catch (err) {
      // ignore
    }
  });
}

function getSuggestedPackageName(): string {
  return upath.joinSafe(__dirname, '..').split('/').reverse()[0];
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
