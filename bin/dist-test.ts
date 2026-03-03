import { cp, mkdir, mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

async function run(command: string, args: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', rejectPromise);
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function runDistTest(): Promise<void> {
  const repositoryRoot = resolve('.');
  const tempRoot = await mkdtemp(join(tmpdir(), 'simplespec-dist-test-'));
  const sandboxRoot = join(tempRoot, 'workspace');
  const packRoot = join(sandboxRoot, 'pack');
  const smokeRoot = join(sandboxRoot, 'smoke');

  process.stdout.write(`\n[dist-test] Creating sandbox at ${sandboxRoot}\n`);

  await mkdir(packRoot, { recursive: true });
  await mkdir(smokeRoot, { recursive: true });

  await cp(join(repositoryRoot, 'package.json'), join(packRoot, 'package.json'));
  await cp(join(repositoryRoot, 'package-lock.json'), join(packRoot, 'package-lock.json'));
  await cp(join(repositoryRoot, 'README.md'), join(packRoot, 'README.md'));
  await cp(join(repositoryRoot, 'LICENSE'), join(packRoot, 'LICENSE'));
  await cp(join(repositoryRoot, '.simplespec'), join(packRoot, '.simplespec'), { recursive: true });
  await cp(join(repositoryRoot, 'commands'), join(packRoot, 'commands'), { recursive: true });
  await cp(join(repositoryRoot, 'assets'), join(packRoot, 'assets'), { recursive: true });
  await cp(join(repositoryRoot, 'dist'), join(packRoot, 'dist'), { recursive: true });

  await run('npm', ['pack', '--ignore-scripts', '--pack-destination', packRoot], packRoot);

  const packEntries = await readdir(packRoot);
  const tarballs = packEntries.filter((entry) => /^simplespec-.*\.tgz$/.test(entry));

  if (tarballs.length !== 1) {
    throw new Error(`Expected exactly one tarball in sandbox pack dir, found: ${tarballs.join(', ') || 'none'}`);
  }

  const tarball = tarballs[0];
  const tarballPath = join(packRoot, tarball);

  process.stdout.write(`[dist-test] Installing ${basename(tarballPath)} in smoke project\n`);

  const smokePackageJson = {
    name: 'simplespec-dist-smoke',
    private: true,
    version: '0.0.0',
  };

  await writeFile(join(smokeRoot, 'package.json'), `${JSON.stringify(smokePackageJson, null, 2)}\n`, 'utf8');
  await run('npm', ['install', '--no-fund', '--no-audit', tarballPath], smokeRoot);
  await run('npx', ['simplespec', '--help'], smokeRoot);

  process.stdout.write(`[dist-test] ✅ Success. Sandbox retained at ${tempRoot}\n`);
}

await run('npm', ['run', 'prepack'], resolve('.'));
await runDistTest();
