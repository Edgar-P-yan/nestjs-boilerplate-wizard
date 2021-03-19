import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import ejs from 'ejs';

export async function initReadme(params: {
  packageManager: 'npm' | 'yarn';
  appRootPath: string;
  answers: prompts.Answers<'typeorm' | 'packageName'>;
}): Promise<void> {
  fs.writeFileSync(
    path.join(params.appRootPath, 'README.md'),
    await ejs.renderFile(path.join(__dirname, 'README.md'), {
      packageManager: params.packageManager,
      packageName: params.answers.packageName,
    }),
  );
}
