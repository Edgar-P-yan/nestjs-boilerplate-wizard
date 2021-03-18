import * as fs from 'fs';
import * as path from 'path';
import * as prompts from 'prompts';
import * as ejs from 'ejs';
import { installPackages } from '../utils';

export async function initSwagger(params: {
  packageManager: 'npm' | 'yarn';
  appRootPath: string;
  answers: prompts.Answers<'packageName' | 'typeorm'>;
}): Promise<{ addToMainTs: { newLines: string; newImports: string } }> {
  installPackages(params.packageManager, [
    '@nestjs/swagger',
    'swagger-ui-express',
  ]);

  try {
    fs.mkdirSync(path.join(params.appRootPath, 'src', 'lib'));
  } catch (err) {}

  fs.writeFileSync(
    path.join(params.appRootPath, 'src', 'lib', 'setup-swagger.ts'),
    await ejs.renderFile(path.join(__dirname, 'files', 'setup-swagger.ts'), {
      packageName: params.answers.packageName,
    }),
  );

  return {
    addToMainTs: {
      newImports: `import { setupSwagger } from './lib/setup-swagger';`,
      newLines: `  setupSwagger(app);`,
    },
  };
}
