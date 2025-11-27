#!/usr/bin/env node

/**
 * Sync Claude plugin version with package.json
 *
 * This script ensures that all Claude plugin configuration files
 * have the same version as the main package.json.
 *
 * Usage:
 *   node scripts/sync-plugin-version.js        # Sync versions
 *   node scripts/sync-plugin-version.js --check # Check if versions are in sync (CI mode)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that contain version fields to sync
const PLUGIN_FILES = [
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  '.claude-plugin/with-dashboard/plugin.json',
];

function getPackageVersion() {
  const packagePath = path.resolve(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

function updatePluginFile(filePath, targetVersion, checkOnly = false) {
  const fullPath = path.resolve(__dirname, '..', filePath);

  if (!existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${filePath} (file not found)`);
    return { skipped: true };
  }

  const content = JSON.parse(readFileSync(fullPath, 'utf8'));
  let updated = false;
  let mismatches = [];

  // Update top-level version if present
  if (content.version && content.version !== targetVersion) {
    mismatches.push({ field: 'version', current: content.version });
    if (!checkOnly) {
      content.version = targetVersion;
      updated = true;
    }
  }

  // Update plugins array versions if present (for marketplace.json)
  if (content.plugins && Array.isArray(content.plugins)) {
    content.plugins.forEach((plugin, index) => {
      if (plugin.version && plugin.version !== targetVersion) {
        mismatches.push({ field: `plugins[${index}].version`, current: plugin.version });
        if (!checkOnly) {
          plugin.version = targetVersion;
          updated = true;
        }
      }
    });
  }

  if (updated) {
    writeFileSync(fullPath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  }

  return { updated, mismatches };
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');

  console.log('🔄 Claude Plugin Version Sync');
  console.log('━'.repeat(40));

  const targetVersion = getPackageVersion();
  console.log(`📦 Package version: ${targetVersion}`);
  console.log(`🔍 Mode: ${checkOnly ? 'Check only (CI)' : 'Sync'}\n`);

  let hasErrors = false;
  let updatedCount = 0;

  for (const filePath of PLUGIN_FILES) {
    const result = updatePluginFile(filePath, targetVersion, checkOnly);

    if (result.skipped) {
      continue;
    }

    if (result.mismatches && result.mismatches.length > 0) {
      if (checkOnly) {
        console.log(`❌ ${filePath}`);
        result.mismatches.forEach(m => {
          console.log(`   └─ ${m.field}: ${m.current} → ${targetVersion}`);
        });
        hasErrors = true;
      } else {
        console.log(`✅ ${filePath} (updated)`);
        result.mismatches.forEach(m => {
          console.log(`   └─ ${m.field}: ${m.current} → ${targetVersion}`);
        });
        updatedCount++;
      }
    } else {
      console.log(`✅ ${filePath} (already at ${targetVersion})`);
    }
  }

  console.log('\n' + '━'.repeat(40));

  if (checkOnly && hasErrors) {
    console.log('❌ Version mismatch detected!');
    console.log('   Run "npm run sync:plugin-version" to fix.');
    process.exit(1);
  } else if (checkOnly) {
    console.log('✅ All plugin versions are in sync!');
  } else if (updatedCount > 0) {
    console.log(`✅ Updated ${updatedCount} file(s) to version ${targetVersion}`);
  } else {
    console.log('✅ All plugin versions already in sync!');
  }
}

main();

export { getPackageVersion, updatePluginFile };

