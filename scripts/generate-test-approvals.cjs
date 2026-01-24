#!/usr/bin/env node
/**
 * Generate Test Approvals Script
 *
 * Creates test approval requests for manual testing of the batch approval feature.
 *
 * Usage:
 *   node scripts/generate-test-approvals.js [count] [--clean]
 *
 * Options:
 *   count   - Number of approvals to generate (default: 7)
 *   --clean - Remove existing test approvals before generating new ones
 *
 * Examples:
 *   node scripts/generate-test-approvals.js          # Generate 7 test approvals
 *   node scripts/generate-test-approvals.js 10       # Generate 10 test approvals
 *   node scripts/generate-test-approvals.js --clean  # Clean and generate 7
 *   node scripts/generate-test-approvals.js 5 --clean # Clean and generate 5
 */

const fs = require('fs').promises;
const path = require('path');

// Test approval templates
const approvalTemplates = [
  {
    title: 'User Authentication Flow Specification',
    fileName: 'auth-flow.md',
    content: `# User Authentication Flow Specification

## Overview
This document outlines the authentication flow for the application.

## Authentication Methods
1. Email/Password authentication
2. OAuth 2.0 (Google, GitHub)
3. Two-factor authentication (optional)

## Flow Diagram
1. User submits credentials
2. Server validates credentials
3. JWT token is generated
4. Token is returned to client
5. Client stores token securely

## Security Considerations
- Passwords must be hashed using bcrypt
- Tokens expire after 24 hours
- Refresh tokens valid for 30 days`,
    priority: 'high'
  },
  {
    title: 'API Endpoint Design Document',
    fileName: 'api-design.md',
    content: `# API Endpoint Design Document

## REST API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- POST /api/auth/logout

### Users
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

### Approvals
- GET /api/approvals
- POST /api/approvals/:id/approve
- POST /api/approvals/:id/reject
- POST /api/approvals/batch`,
    priority: 'medium'
  },
  {
    title: 'Database Schema Migration Plan',
    fileName: 'db-migration.md',
    content: `# Database Schema Migration Plan

## Current Schema
- Users table
- Approvals table
- Sessions table

## Proposed Changes
1. Add batch_operations table
2. Add approval_history table
3. Add indexes for performance
4. Add foreign key constraints

## Migration Steps
1. Backup current database
2. Run migration scripts
3. Verify data integrity
4. Update application code`,
    priority: 'high'
  },
  {
    title: 'Frontend Component Library Standards',
    fileName: 'component-standards.md',
    content: `# Frontend Component Library Standards

## Component Structure
- Use functional components with hooks
- TypeScript for all components
- Props interface definitions
- Proper error boundaries

## Styling
- Tailwind CSS utility classes
- Dark mode support
- Responsive design
- Accessibility (WCAG 2.1 AA)

## Testing
- Unit tests for all components
- Integration tests for complex interactions
- Storybook for component documentation`,
    priority: 'low'
  },
  {
    title: 'Security Best Practices Guide',
    fileName: 'security-practices.md',
    content: `# Security Best Practices Guide

## Authentication Security
- Strong password requirements
- Rate limiting on login attempts
- Session management
- CSRF protection

## Data Security
- Encryption at rest
- Encryption in transit (TLS)
- Input validation
- SQL injection prevention

## API Security
- API key authentication
- Request signing
- Rate limiting
- CORS configuration`,
    priority: 'high'
  },
  {
    title: 'Testing Strategy Documentation',
    fileName: 'testing-strategy.md',
    content: `# Testing Strategy Documentation

## Unit Testing
- Jest/Vitest for JavaScript/TypeScript
- 80% code coverage minimum
- Mock external dependencies

## Integration Testing
- Test API endpoints
- Test database interactions
- Test authentication flows

## End-to-End Testing
- Playwright for browser testing
- Critical user journeys
- Cross-browser compatibility`,
    priority: 'medium'
  },
  {
    title: 'Deployment Pipeline Configuration',
    fileName: 'deployment-pipeline.md',
    content: `# Deployment Pipeline Configuration

## CI/CD Pipeline
1. Code commit triggers pipeline
2. Run tests and linting
3. Build application
4. Deploy to staging
5. Run smoke tests
6. Deploy to production

## Deployment Environments
- Development: Auto-deploy on merge to dev
- Staging: Auto-deploy on merge to main
- Production: Manual approval required

## Rollback Strategy
- Keep last 3 deployments
- One-click rollback capability
- Database migration rollback procedures`,
    priority: 'high'
  },
  {
    title: 'Performance Optimization Guide',
    fileName: 'performance-optimization.md',
    content: `# Performance Optimization Guide

## Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies

## Backend Optimization
- Database query optimization
- Connection pooling
- Caching layers (Redis)
- Load balancing

## Monitoring
- Performance metrics
- Error tracking
- User analytics`,
    priority: 'medium'
  },
  {
    title: 'Internationalization (i18n) Implementation',
    fileName: 'i18n-implementation.md',
    content: `# Internationalization Implementation

## Supported Languages
- English (en)
- Japanese (ja)
- Chinese (zh)
- Spanish (es)
- Portuguese (pt)
- German (de)
- French (fr)

## Implementation
- React-i18next for frontend
- Translation key structure
- Language detection
- Fallback strategies`,
    priority: 'low'
  },
  {
    title: 'Monitoring and Observability Setup',
    fileName: 'monitoring-setup.md',
    content: `# Monitoring and Observability Setup

## Metrics Collection
- Application performance metrics
- Infrastructure metrics
- Business metrics

## Logging
- Structured logging
- Log aggregation
- Log retention policies

## Alerting
- Error rate thresholds
- Performance degradation
- System health checks`,
    priority: 'medium'
  }
];

async function cleanTestApprovals(approvalsDir, docsDir) {
  console.log('🧹 Cleaning existing test approvals...');

  try {
    // Remove test approval JSON files
    const files = await fs.readdir(approvalsDir);
    const testFiles = files.filter(f => f.startsWith('test-approval-'));

    for (const file of testFiles) {
      await fs.unlink(path.join(approvalsDir, file));
    }

    console.log(`   Removed ${testFiles.length} test approval files`);

    // Remove test document files
    const docFiles = await fs.readdir(docsDir);
    for (const file of docFiles) {
      if (file.endsWith('.md')) {
        await fs.unlink(path.join(docsDir, file));
      }
    }

    console.log(`   Removed ${docFiles.length} test document files`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('   Warning:', error.message);
    }
  }
}

async function generateTestApprovals(count) {
  const projectRoot = path.resolve(__dirname, '..');
  const approvalsDir = path.join(projectRoot, '.spec-workflow', 'approvals', 'spec');
  const docsDir = path.join(projectRoot, '.spec-workflow', 'docs');

  // Parse arguments
  const args = process.argv.slice(2);
  const shouldClean = args.includes('--clean');
  const numApprovals = args.find(arg => !arg.startsWith('--')) ? parseInt(args.find(arg => !arg.startsWith('--'))) : count;

  console.log('🎯 Test Approval Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📝 Generating ${numApprovals} test approvals...`);
  console.log('');

  // Create directories
  await fs.mkdir(approvalsDir, { recursive: true });
  await fs.mkdir(docsDir, { recursive: true });

  // Clean if requested
  if (shouldClean) {
    await cleanTestApprovals(approvalsDir, docsDir);
    console.log('');
  }

  const now = new Date();
  const approvals = [];

  for (let i = 0; i < numApprovals; i++) {
    const template = approvalTemplates[i % approvalTemplates.length];
    const approvalId = `test-approval-${i + 1}`;
    const timestamp = new Date(now.getTime() + (i * 15 * 60 * 1000)); // 15 minutes apart

    // Create approval JSON
    const approval = {
      id: approvalId,
      title: template.title,
      filePath: `.spec-workflow/docs/${template.fileName}`,
      type: 'document',
      status: 'pending',
      createdAt: timestamp.toISOString(),
      category: 'spec',
      categoryName: 'spec',
      metadata: {
        priority: template.priority,
        reviewer: 'team',
        testData: true
      }
    };

    const approvalPath = path.join(approvalsDir, `${approvalId}.json`);
    await fs.writeFile(approvalPath, JSON.stringify(approval, null, 2));

    // Create document file
    const docPath = path.join(docsDir, template.fileName);
    await fs.writeFile(docPath, template.content);

    approvals.push(approval);
    console.log(`✅ Created: ${approval.title}`);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✨ Successfully generated ${approvals.length} test approvals!`);
  console.log('');
  console.log('📂 Files created:');
  console.log(`   Approvals: ${approvalsDir}`);
  console.log(`   Documents: ${docsDir}`);
  console.log('');
  console.log('🧪 Testing Instructions:');
  console.log('   1. Refresh your dashboard at http://localhost:5173/');
  console.log('   2. Navigate to Approvals page');
  console.log('   3. Test batch selection feature:');
  console.log('      - Select 3-5 items (no confirmation)');
  console.log('      - Select 6+ items (requires confirmation)');
  console.log('      - Test batch reject (always requires feedback)');
  console.log('      - Test undo operation (30-second window)');
  console.log('');
  console.log('🔄 To regenerate test data:');
  console.log(`   node scripts/generate-test-approvals.js ${numApprovals} --clean`);
  console.log('');
}

// Run the generator
const defaultCount = 7;
generateTestApprovals(defaultCount).catch(error => {
  console.error('❌ Error generating test approvals:', error);
  process.exit(1);
});
