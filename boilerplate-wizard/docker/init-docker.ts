import * as fs from 'fs';
import * as path from 'path';
import * as prompts from 'prompts';
import * as ejs from 'ejs';

export async function initDocker(params: {
  packageManager: 'npm' | 'yarn';
  appRootPath: string;
  answers: prompts.Answers<'typeorm'>;
}): Promise<void> {
  fs.writeFileSync(
    path.join(params.appRootPath, 'Dockerfile'),
    await ejs.renderFile(path.join(__dirname, 'Dockerfile'), {
      packageManager: params.packageManager,
    }),
  );

  fs.copyFileSync(
    path.join(__dirname, '.dockerignore'),
    path.join(__dirname, '.dockerignore'),
  );

  let dockerComposeYml = fs.readFileSync(
    path.join(__dirname, 'docker-compose.yml'),
    'utf8',
  );

  let envExample = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');

  if (params.answers.typeorm === 'postgres') {
    envExample += '$DOCKER_COMPOSE_POSTGRES_PORT=127.0.0.1:5432\n';
    dockerComposeYml += fs.readFileSync(
      path.join(__dirname, 'postgres-append.docker-compose.yml'),
      'utf8',
    );
  }

  fs.writeFileSync(
    path.join(params.appRootPath, 'docker-compose.yml'),
    dockerComposeYml,
  );

  fs.appendFileSync(path.join(params.appRootPath, '.example.env'), envExample);
}
