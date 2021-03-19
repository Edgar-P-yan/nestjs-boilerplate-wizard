import execa from 'execa';

export function installPackages(
  packageManager: 'npm' | 'yarn',
  packageNames: string[],
): void {
  if (packageManager === 'yarn') {
    execa.commandSync(`yarn add ${packageNames.join(' ')}`);
  } else {
    execa.commandSync(`npm install --save ${packageNames.join(' ')}`);
  }
}

export function uninstallPackages(
  packageManager: 'npm' | 'yarn',
  packageNames: string[],
): void {
  if (packageManager === 'yarn') {
    execa.commandSync(`yarn remove ${packageNames.join(' ')}`);
  } else {
    execa.commandSync(`npm uninstall ${packageNames.join(' ')}`);
  }
}
