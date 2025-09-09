#!/usr/bin/env node

import { promises as fs, existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract Mustache template variables from a string
function extractMustacheVariables(str) {
  const regex = /{{\\s*([^}]+)\\s*}}/g;
  const variables = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    variables.push(match[1].trim());
  }
  return variables;
}

// Recursively extract variables from nested objects
function extractVariablesFromObject(obj, parentKey = '') {
  const results = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    
    if (typeof value === 'string') {
      const vars = extractMustacheVariables(value);
      if (vars.length > 0) {
        results[fullKey] = vars;
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(results, extractVariablesFromObject(value, fullKey));
    }
  }
  
  return results;
}

// Validate that all translations for a key have the same variables
function validateInterpolationConsistency(translations, context, errors) {
  const variablesByKey = {};
  const languages = Object.keys(translations);
  
  // Extract variables for each language
  languages.forEach(lang => {
    const langVars = extractVariablesFromObject(translations[lang]);
    
    Object.entries(langVars).forEach(([key, vars]) => {
      if (!variablesByKey[key]) {
        variablesByKey[key] = {};
      }
      variablesByKey[key][lang] = vars;
    });
  });
  
  // Check consistency across languages
  Object.entries(variablesByKey).forEach(([key, langVars]) => {
    const langs = Object.keys(langVars);
    if (langs.length > 1) {
      const referenceVars = langVars[langs[0]].sort();
      
      for (let i = 1; i < langs.length; i++) {
        const currentVars = langVars[langs[i]].sort();
        
        if (JSON.stringify(referenceVars) !== JSON.stringify(currentVars)) {
          errors.push(
            `${context} - Interpolation mismatch for key '${key}': ` +
            `${langs[0]} has [${referenceVars.join(', ')}], ` +
            `${langs[i]} has [${currentVars.join(', ')}]`
          );
        }
      }
    }
  });
}

// Validation script to ensure locale files exist and are valid
function validateI18nFiles() {
  console.log('🔍 Validating i18n files...');
  
  const errors = [];
  const warnings = [];
  
  // Get supported languages from environment variable or use defaults
  const supportedLanguages = process.env.SUPPORTED_LANGUAGES 
    ? process.env.SUPPORTED_LANGUAGES.split(',').map(lang => lang.trim())
    : ['en', 'ja', 'zh', 'es', 'pt', 'de', 'fr', 'ru', 'it', 'ko', 'ar'];
  
  console.log(`📌 Supported languages: ${supportedLanguages.join(', ')}`);
  
  // Check backend locale files
  const backendLocalesDir = path.resolve(__dirname, '../src/locales');
  const backendFiles = supportedLanguages.map(lang => `${lang}.json`);
  const backendTranslations = {};
  
  console.log(`📁 Checking backend locales in: ${backendLocalesDir}`);
  
  if (!existsSync(backendLocalesDir)) {
    errors.push(`Backend locales directory not found: ${backendLocalesDir}`);
  } else {
    for (const file of backendFiles) {
      const filePath = path.join(backendLocalesDir, file);
      
      if (!existsSync(filePath)) {
        warnings.push(`Backend locale file missing: ${file} (will use fallback)`);
      } else {
        try {
          const content = readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(content);
          const lang = file.replace('.json', '');
          backendTranslations[lang] = parsed;
          console.log(`✅ Backend ${file}: Valid JSON`);
        } catch (parseError) {
          errors.push(`Backend ${file}: Invalid JSON - ${parseError.message}`);
        }
      }
    }
  }
  
  // Validate backend interpolation consistency
  if (Object.keys(backendTranslations).length > 1) {
    console.log('🔍 Validating backend interpolation variables...');
    validateInterpolationConsistency(backendTranslations, 'Backend', errors);
  }
  
  // Check frontend locale files
  const frontendLocalesDir = path.resolve(__dirname, '../src/dashboard_frontend/src/locales');
  const frontendFiles = supportedLanguages.map(lang => `${lang}.json`);
  const frontendTranslations = {};
  
  console.log(`📁 Checking frontend locales in: ${frontendLocalesDir}`);
  
  if (!existsSync(frontendLocalesDir)) {
    errors.push(`Frontend locales directory not found: ${frontendLocalesDir}`);
  } else {
    for (const file of frontendFiles) {
      const filePath = path.join(frontendLocalesDir, file);
      
      if (!existsSync(filePath)) {
        warnings.push(`Frontend locale file missing: ${file} (will use fallback)`);
      } else {
        try {
          const content = readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(content);
          const lang = file.replace('.json', '');
          frontendTranslations[lang] = parsed;
          console.log(`✅ Frontend ${file}: Valid JSON`);
        } catch (parseError) {
          errors.push(`Frontend ${file}: Invalid JSON - ${parseError.message}`);
        }
      }
    }
  }
  
  // Validate frontend interpolation consistency
  if (Object.keys(frontendTranslations).length > 1) {
    console.log('🔍 Validating frontend interpolation variables...');
    validateInterpolationConsistency(frontendTranslations, 'Frontend', errors);
  }
  
  // Check VSCode extension locale files
  const vscodeLocalesDir = path.resolve(__dirname, '../vscode-extension/src/webview/locales');
  const vscodeFiles = supportedLanguages.map(lang => `${lang}.json`);
  const vscodeTranslations = {};
  
  console.log(`📁 Checking VSCode extension locales in: ${vscodeLocalesDir}`);
  
  if (!existsSync(vscodeLocalesDir)) {
    warnings.push(`VSCode extension locales directory not found: ${vscodeLocalesDir}`);
  } else {
    for (const file of vscodeFiles) {
      const filePath = path.join(vscodeLocalesDir, file);
      
      if (!existsSync(filePath)) {
        warnings.push(`VSCode extension locale file missing: ${file}`);
      } else {
        try {
          const content = readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(content);
          const lang = file.replace('.json', '');
          vscodeTranslations[lang] = parsed;
          console.log(`✅ VSCode ${file}: Valid JSON`);
        } catch (parseError) {
          errors.push(`VSCode ${file}: Invalid JSON - ${parseError.message}`);
        }
      }
    }
  }
  
  // Validate VSCode interpolation consistency
  if (Object.keys(vscodeTranslations).length > 1) {
    console.log('🔍 Validating VSCode interpolation variables...');
    validateInterpolationConsistency(vscodeTranslations, 'VSCode', errors);
  }
  
  // Report results
  console.log('\n📊 Validation Results:');
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('\n🚫 Build should not proceed with these i18n errors.');
    process.exit(1);
  } else {
    console.log('\n✅ All i18n files are valid!');
    if (warnings.length > 0) {
      console.log('⚠️  There are warnings, but the build can proceed with fallbacks.');
    }
    
    // Bundle size monitoring suggestion
    console.log('\n💡 Bundle Size Monitoring:');
    console.log('   Consider monitoring frontend bundle size impact of i18n files.');
    console.log('   For large applications, implement lazy loading of language packs.');
    console.log('   To enable dynamic imports: Set REACT_APP_I18N_DYNAMIC=true');
    console.log('   Current implementation: eager loading for better UX');
    
    // Interpolation validation info
    console.log('\n🔧 Interpolation Validation:');
    console.log('   All Mustache template variables are validated for consistency.');
    console.log('   Each translation key must use the same variables across all languages.');
  }
}

// Run validation
validateI18nFiles();

export { validateI18nFiles };