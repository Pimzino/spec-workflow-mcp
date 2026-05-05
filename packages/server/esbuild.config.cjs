const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const production = process.argv.includes('--production');

async function main() {
  // Build the server bundle — inlines @spec-workflow/shared so no runtime dep
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    external: [
      // Native Node.js modules
      'fs', 'fs/promises', 'path', 'os', 'child_process', 'crypto', 'url', 'stream',
      // Keep these as external (they're real npm deps users will install)
      '@modelcontextprotocol/sdk',
      'fastify',
      '@fastify/*',
      'chokidar',
      'ws',
      'open',
      'simple-git',
      'toml',
      'ajv',
      'ajv-formats',
      'diff',
      'markdown-it',
      'node-cron',
      'howler',
      'zod',
      '@toon-format/toon',
    ],
    minify: production,
    sourcemap: !production,
    metafile: true,
  });

  // Copy markdown templates (needed at runtime)
  const markdownSrc = path.join(__dirname, 'src', 'markdown');
  const markdownDest = path.join(__dirname, 'dist', 'markdown');
  if (fs.existsSync(markdownSrc)) {
    fs.cpSync(markdownSrc, markdownDest, { recursive: true });
    console.log('✓ Copied markdown templates');
  }

  // Copy locales
  const localesSrc = path.join(__dirname, 'src', 'locales');
  const localesDest = path.join(__dirname, 'dist', 'locales');
  if (fs.existsSync(localesSrc)) {
    fs.cpSync(localesSrc, localesDest, { recursive: true });
    console.log('✓ Copied locale files');
  }

  // Copy dashboard public icons
  const iconsSrc = path.join(__dirname, 'src', 'dashboard', 'public');
  const publicDest = path.join(__dirname, 'dist', 'dashboard', 'public');
  if (fs.existsSync(iconsSrc)) {
    fs.mkdirSync(publicDest, { recursive: true });
    const iconFiles = ['claude-icon.svg', 'claude-icon-dark.svg'];
    for (const iconFile of iconFiles) {
      const srcPath = path.join(iconsSrc, iconFile);
      const destPath = path.join(publicDest, iconFile);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    console.log('✓ Copied dashboard icons');
  }

  console.log('Server build complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
