import { expect, Page, test } from '@playwright/test';
import { mkdir, rm } from 'fs/promises';
import { RegisteredProject, WorktreeHarness } from './helpers/worktree-harness';

const DASHBOARD_API_BASE_URL = 'http://127.0.0.1:5084';

function getProjectByPathSuffix(projects: RegisteredProject[], suffix: string): RegisteredProject {
  const project = projects.find((entry) => entry.projectPath.endsWith(`/${suffix}`) || entry.projectPath.endsWith(`\\${suffix}`));
  if (!project) {
    throw new Error(`Project with path suffix "${suffix}" was not found in: ${JSON.stringify(projects, null, 2)}`);
  }
  return project;
}

async function selectProject(page: Page, projectId: string): Promise<void> {
  const toggle = page.getByTestId('project-dropdown-toggle');
  await toggle.click();
  await expect(page.getByTestId('project-dropdown-menu')).toBeVisible();

  await page.getByTestId(`project-dropdown-item-${projectId}`).click();
  await expect(page.getByTestId('project-dropdown-menu')).toBeHidden();
}

test.describe.serial('No-shared worktree dashboard separation', () => {
  test.setTimeout(180000);

  let harness: WorktreeHarness;
  let registeredProjects: RegisteredProject[];

  test.beforeAll(async ({}, testInfo) => {
    testInfo.setTimeout(180000);

    const specWorkflowHome = process.env.SPEC_WORKFLOW_HOME;
    if (!specWorkflowHome) {
      throw new Error('SPEC_WORKFLOW_HOME must be set by playwright.worktree.config.ts');
    }

    await rm(specWorkflowHome, { recursive: true, force: true });
    await mkdir(specWorkflowHome, { recursive: true });

    harness = new WorktreeHarness({
      serverRoot: process.cwd(),
      dashboardApiBaseUrl: DASHBOARD_API_BASE_URL,
      specWorkflowHome
    });

    await harness.setup();
    await harness.startMcpServers();
    registeredProjects = await harness.waitForProjects(2, 90000);
  });

  test.afterAll(async () => {
    if (harness) {
      await harness.cleanup();
    }
  });

  test('shows separate worktree projects in dropdown without aggregated main project', async ({ page }) => {
    const projectA = getProjectByPathSuffix(registeredProjects, 'wt-a');
    const projectB = getProjectByPathSuffix(registeredProjects, 'wt-b');

    await page.goto('/');
    await expect(page.getByTestId('project-dropdown-toggle')).toBeVisible();

    await page.getByTestId('project-dropdown-toggle').click();
    await expect(page.getByTestId('project-dropdown-menu')).toBeVisible();

    await expect(page.getByTestId(`project-dropdown-item-${projectA.projectId}`)).toBeVisible();
    await expect(page.getByTestId(`project-dropdown-item-${projectB.projectId}`)).toBeVisible();

    const dropdownItems = page.locator('[data-testid^="project-dropdown-item-"]');
    await expect(dropdownItems).toHaveCount(2);
    await expect(page.getByText(/\(\d+\s+instances\)/i)).toHaveCount(0);
  });

  test('isolates specs by selected worktree project', async ({ page }) => {
    const projectA = getProjectByPathSuffix(registeredProjects, 'wt-a');
    const projectB = getProjectByPathSuffix(registeredProjects, 'wt-b');

    await page.goto('/');
    await expect(page.getByTestId('project-dropdown-toggle')).toBeVisible();

    await selectProject(page, projectA.projectId);
    await page.getByRole('link', { name: /^Specs$/i }).click();
    await expect(page.getByTestId('spec-table-row-spec-a')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('spec-table-row-spec-b')).toHaveCount(0);

    await selectProject(page, projectB.projectId);
    await expect(page.getByTestId('spec-table-row-spec-b')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('spec-table-row-spec-a')).toHaveCount(0);
  });

  test('isolates approval content by selected worktree project', async ({ page }) => {
    const projectA = getProjectByPathSuffix(registeredProjects, 'wt-a');
    const projectB = getProjectByPathSuffix(registeredProjects, 'wt-b');

    await page.goto('/');
    await expect(page.getByTestId('project-dropdown-toggle')).toBeVisible();

    await selectProject(page, projectA.projectId);
    await page.getByRole('link', { name: /^Approvals$/i }).click();
    await expect(page.getByTestId('approval-item-approval-wt-a')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('approval-item-approval-wt-b')).toHaveCount(0);
    await page.getByTestId('approval-item-approval-wt-a').getByRole('button', { name: /review/i }).first().click();
    await expect(page.getByText(/source\s*=\s*"wt-a"/i)).toBeVisible({ timeout: 15000 });

    await selectProject(page, projectB.projectId);
    await expect(page.getByTestId('approval-item-approval-wt-b')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('approval-item-approval-wt-a')).toHaveCount(0);
    await page.getByTestId('approval-item-approval-wt-b').getByRole('button', { name: /review/i }).first().click();
    await expect(page.getByText(/source\s*=\s*"wt-b"/i)).toBeVisible({ timeout: 15000 });
  });
});
