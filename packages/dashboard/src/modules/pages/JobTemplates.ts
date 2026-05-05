/**
 * Predefined job templates for common automation scenarios
 */

export interface JobTemplate {
  name: string;
  type: 'cleanup-approvals' | 'cleanup-specs' | 'cleanup-archived-specs';
  daysOld: number;
  schedule: string;
  description: string;
}

export const JOB_TEMPLATES: Record<string, JobTemplate> = {
  // Approval cleanup templates
  'cleanup-approvals-monthly': {
    name: 'Monthly Approval Cleanup',
    type: 'cleanup-approvals',
    daysOld: 90,
    schedule: '0 2 1 * *', // First day of month at 2 AM
    description: 'Delete approval records older than 90 days, runs monthly'
  },
  'cleanup-approvals-weekly': {
    name: 'Weekly Approval Cleanup',
    type: 'cleanup-approvals',
    daysOld: 30,
    schedule: '0 2 ? * SUN', // Every Sunday at 2 AM
    description: 'Delete approval records older than 30 days, runs weekly'
  },
  'cleanup-approvals-daily': {
    name: 'Daily Approval Cleanup',
    type: 'cleanup-approvals',
    daysOld: 7,
    schedule: '0 2 * * *', // Every day at 2 AM
    description: 'Delete approval records older than 7 days, runs daily'
  },

  // Spec cleanup templates
  'cleanup-specs-quarterly': {
    name: 'Quarterly Spec Cleanup',
    type: 'cleanup-specs',
    daysOld: 180,
    schedule: '0 3 1 1,4,7,10 *', // First day of Q1, Q2, Q3, Q4 at 3 AM
    description: 'Delete specs older than 180 days, runs quarterly'
  },
  'cleanup-specs-monthly': {
    name: 'Monthly Spec Cleanup',
    type: 'cleanup-specs',
    daysOld: 120,
    schedule: '0 3 1 * *', // First day of month at 3 AM
    description: 'Delete specs older than 120 days, runs monthly'
  },
  'cleanup-specs-weekly': {
    name: 'Weekly Spec Cleanup',
    type: 'cleanup-specs',
    daysOld: 60,
    schedule: '0 3 ? * SUN', // Every Sunday at 3 AM
    description: 'Delete specs older than 60 days, runs weekly'
  },

  // Archived specs cleanup templates
  'cleanup-archived-specs-semi-annual': {
    name: 'Semi-Annual Archived Spec Cleanup',
    type: 'cleanup-archived-specs',
    daysOld: 365,
    schedule: '0 4 1 1,7 *', // January 1st and July 1st at 4 AM
    description: 'Delete archived specs older than 1 year, runs twice yearly'
  },
  'cleanup-archived-specs-annual': {
    name: 'Annual Archived Spec Cleanup',
    type: 'cleanup-archived-specs',
    daysOld: 730,
    schedule: '0 4 1 1 *', // January 1st at 4 AM
    description: 'Delete archived specs older than 2 years, runs annually'
  },
  'cleanup-archived-specs-monthly': {
    name: 'Monthly Archived Spec Cleanup',
    type: 'cleanup-archived-specs',
    daysOld: 180,
    schedule: '0 4 1 * *', // First day of month at 4 AM
    description: 'Delete archived specs older than 180 days, runs monthly'
  }
};

/**
 * Get templates by job type
 */
export function getTemplatesByType(
  type: 'cleanup-approvals' | 'cleanup-specs' | 'cleanup-archived-specs'
): JobTemplate[] {
  return Object.values(JOB_TEMPLATES).filter(template => template.type === type);
}

/**
 * Get a template by key
 */
export function getTemplate(key: string): JobTemplate | undefined {
  return JOB_TEMPLATES[key];
}

/**
 * Get all available templates
 */
export function getAllTemplates(): JobTemplate[] {
  return Object.values(JOB_TEMPLATES);
}
