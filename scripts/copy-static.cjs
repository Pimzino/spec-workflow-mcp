#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 复制目录
 * @param src 源目录
 * @param dest 目标目录
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) { // 如果目标目录不存在，创建它
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true }); // 读取源目录中的所有文件和目录

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name); // 源路径
    const destPath = path.join(dest, entry.name); // 目标路径

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath); // 如果entry是目录，递归复制
    } else {
      fs.copyFileSync(srcPath, destPath); // 如果entry是文件，复制文件
    }
  }
}

// Copy markdown directory
const markdownSrc = path.join(__dirname, '..', 'src', 'markdown'); // 源目录
const markdownDest = path.join(__dirname, '..', 'dist', 'markdown'); // 目标目录

if (fs.existsSync(markdownSrc)) {
  copyDir(markdownSrc, markdownDest); // 复制markdown文件
  console.log('✓ Copied markdown files'); // 复制markdown文件
}

// Copy locales directory
const localesSrc = path.join(__dirname, '..', 'src', 'locales'); 
const localesDest = path.join(__dirname, '..', 'dist', 'locales');

if (fs.existsSync(localesSrc)) {
  copyDir(localesSrc, localesDest);
  console.log('✓ Copied locale files');
}

// Copy icons from old dashboard (we still need these)
const iconsSrc = path.join(__dirname, '..', 'src', 'dashboard', 'public');
const publicDest = path.join(__dirname, '..', 'dist', 'dashboard', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDest)) {
  fs.mkdirSync(publicDest, { recursive: true });
}

// Copy only the icon files from old dashboard
const iconFiles = ['claude-icon.svg', 'claude-icon-dark.svg'];
if (fs.existsSync(iconsSrc)) {
  for (const iconFile of iconFiles) {
    const srcPath = path.join(iconsSrc, iconFile);
    const destPath = path.join(publicDest, iconFile);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  console.log('✓ Copied dashboard icon files');
}

// Copy dashboard build as the main dashboard
const newDashSrc = path.join(__dirname, '..', 'src', 'dashboard_frontend', 'dist');

if (fs.existsSync(newDashSrc)) {
  // Copy all files from new dashboard to public root
  copyDir(newDashSrc, publicDest);
  console.log('✓ Copied dashboard as main dashboard');
}