import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Script to clone and sanitize a project folder for sharing/production.
 * - Respects .gitignore rules.
 * - Strips sensitive data from .env files.
 * - Removes logs, build artifacts, and system files.
 */

const DEFAULT_EXCLUSIONS = [
  '.git',
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  'tmp',
  '.DS_Store',
  'Thumbs.db',
  '*.log',
  '*.tmp',
  'tsconfig.tsbuildinfo',
  '.vscode',
  '.idea',
];

async function getGitignorePatterns(src) {
  try {
    const gitignorePath = path.join(src, '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(pattern => {
        // Simple conversion from .gitignore format to regex-like or glob-ish
        // (This is a simplified version; in production, you might use 'ignore' package)
        return pattern.replace(/\/$/, ''); // Remove trailing slashes
      });
  } catch (e) {
    return [];
  }
}

function shouldExclude(filePath, patterns) {
  const fileName = path.basename(filePath);
  
  // Hardcoded exclusions
  for (const pattern of DEFAULT_EXCLUSIONS) {
    if (pattern.startsWith('*.')) {
      if (fileName.endsWith(pattern.slice(1))) return true;
    } else if (fileName === pattern) {
      return true;
    }
  }

  // Gitignore patterns (simplified matching)
  for (const pattern of patterns) {
    if (pattern.startsWith('*.')) {
      if (fileName.endsWith(pattern.slice(1))) return true;
    } else if (filePath.includes(path.sep + pattern + path.sep) || fileName === pattern || filePath.endsWith(path.sep + pattern)) {
      return true;
    }
  }

  return false;
}

async function sanitizeEnv(srcPath, destPath) {
  const content = await fs.readFile(srcPath, 'utf8');
  const sanitizedLines = content.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) return line;
    const key = line.substring(0, eqIndex);
    return `${key}=`;
  });
  await fs.writeFile(destPath, sanitizedLines.join('\n'));
}

async function copyRecursive(src, dest, patterns, options) {
  const stats = await fs.stat(src);
  const isDirectory = stats.isDirectory();

  if (shouldExclude(src, patterns)) {
    if (options.preview) console.log(`[SKIP] ${src}`);
    return;
  }

  if (isDirectory) {
    if (options.preview) {
      console.log(`[DIR]  ${src} -> ${dest}`);
    } else {
      await fs.mkdir(dest, { recursive: true });
    }
    
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      await copyRecursive(
        path.join(src, entry),
        path.join(dest, entry),
        patterns,
        options
      );
    }
  } else {
    const fileName = path.basename(src);
    if (options.preview) {
      console.log(`[FILE] ${src} -> ${dest}`);
    } else {
      if (fileName === '.env') {
        await sanitizeEnv(src, dest);
        console.log(`[SAFE] Sanitized .env -> ${dest}`);
      } else {
        await fs.copyFile(src, dest);
        console.log(`[COPY] ${src} -> ${dest}`);
      }
    }
  }
}

async function run() {
  const args = process.argv.slice(2);
  const src = args[0] ? path.resolve(args[0]) : process.cwd();
  const dest = args[1] ? path.resolve(args[1]) : path.join(process.cwd(), '../' + path.basename(src) + '-clean');
  const preview = args.includes('--preview');

  console.log(`Sanitize Clone Tool`);
  console.log(`Source: ${src}`);
  console.log(`Dest:   ${dest}`);
  console.log(`Mode:   ${preview ? 'PREVIEW (DRY RUN)' : 'REAL DUPLICATION'}\n`);

  const gitignorePatterns = await getGitignorePatterns(src);
  const totalPatterns = [...new Set([...DEFAULT_EXCLUSIONS, ...gitignorePatterns])];

  try {
    if (!preview && (await fs.stat(dest).catch(() => null))) {
      console.error(`Error: Destination already exists: ${dest}`);
      console.error(`Please remove it or specify a different location.`);
      process.exit(1);
    }

    await copyRecursive(src, dest, totalPatterns, { preview });
    console.log(`\nOperation complete! ${preview ? '(Preview Only)' : ''}`);
  } catch (err) {
    console.error(`\nError during duplication:`, err);
    process.exit(1);
  }
}

run();
