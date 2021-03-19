import prompts from 'prompts';
import { installPackages } from '../utils';

export async function initValidationPipe(params: {
  packageManager: 'npm' | 'yarn';
  appRootPath: string;
  answers: prompts.Answers<'packageName' | 'typeorm'>;
}): Promise<{ addToMainTs: { newLines: string; newImports: string } }> {
  installPackages(params.packageManager, [
    'class-validator',
    'class-transformer',
  ]);

  return {
    addToMainTs: {
      newImports: `import { ValidationPipe } from '@nestjs/common';`,
      newLines:
        `  app.useGlobalPipes(\n` +
        `    new ValidationPipe({\n` +
        `      whitelist: true,\n` +
        `      transform: true,\n` +
        `    }),\n` +
        `  );`,
    },
  };
}
