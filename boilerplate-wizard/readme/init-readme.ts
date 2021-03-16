import * as fs from 'fs';
import * as path from 'path';
import * as prompts from 'prompts';
import * as ejs from 'ejs';

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
