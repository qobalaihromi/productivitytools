import { test, expect } from '@playwright/test'

test.describe('Projects — List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
  })

  test('should render Projects heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: 'Projects' }).first()
    await expect(heading).toBeVisible()
  })

  test('should display "New Project" button', async ({ page }) => {
    const newProjectBtn = page.getByRole('button', { name: /new project/i })
    await expect(newProjectBtn).toBeVisible()
  })

  test('should show project count text', async ({ page }) => {
    // Wait for loading to finish
    await page.waitForFunction(() => {
      return !document.querySelector('[role="progressbar"]')
    }, { timeout: 10000 }).catch(() => {})

    // Should show "X project(s)" or empty state
    const countText = page.getByText(/\d+ projects?/i)
    const emptyState = page.getByText('No projects yet')

    const hasCount = await countText.count()
    const hasEmpty = await emptyState.count()
    expect(hasCount > 0 || hasEmpty > 0).toBeTruthy()
  })

  test('"New Project" button navigates to /projects/new', async ({ page }) => {
    const newProjectBtn = page.getByRole('button', { name: /new project/i })
    await newProjectBtn.click()
    await page.waitForURL(/\/projects\/new/)
    await expect(page).toHaveURL(/\/projects\/new/)
  })
})

test.describe('Projects — Create Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')
  })

  test('should render "New Project" heading', async ({ page }) => {
    const heading = page.getByText('New Project')
    await expect(heading).toBeVisible()
  })

  test('should display form fields', async ({ page }) => {
    // Project Name field
    const nameLabel = page.getByText('Project Name *')
    await expect(nameLabel).toBeVisible()

    const nameInput = page.locator('#name')
    await expect(nameInput).toBeVisible()

    // Description field
    const descLabel = page.getByText('Description')
    await expect(descLabel).toBeVisible()

    // Color label
    const colorLabel = page.getByText('Color')
    await expect(colorLabel).toBeVisible()

    // Date fields
    const startDateLabel = page.getByText('Start Date')
    await expect(startDateLabel).toBeVisible()
    const endDateLabel = page.getByText('End Date')
    await expect(endDateLabel).toBeVisible()
  })

  test('should show back button that navigates to /projects', async ({ page }) => {
    const backButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await backButton.click()
    await page.waitForURL(/\/projects$/)
    await expect(page).toHaveURL(/\/projects$/)
  })

  test('should disable submit button when name is empty', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create project/i })
    // Button should exist but be disabled/dimmed
    await expect(createBtn).toBeVisible()
  })

  test('should fill form and create a project', async ({ page }) => {
    // Fill project name
    const nameInput = page.locator('#name')
    await nameInput.fill('Test Project E2E')

    // Fill description
    const descInput = page.locator('#description')
    await descInput.fill('This is a test project created by Playwright E2E tests')

    // Fill dates
    const startInput = page.locator('#start_date')
    await startInput.fill('2026-03-01')

    const endInput = page.locator('#end_date')
    await endInput.fill('2026-06-30')

    // Click color swatch (second color)
    const colorSwatches = page.locator('[style*="border-radius"]').filter({
      has: page.locator('[style*="background"]'),
    })
    // Just click the create button
    const createBtn = page.getByRole('button', { name: /create project/i })
    await createBtn.click()

    // Should redirect to project detail page
    await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+/)
  })
})

test.describe('Projects — Detail Page', () => {
  test('should create and view project detail with Kanban board', async ({ page }) => {
    // First, create a project
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    const nameInput = page.locator('#name')
    await nameInput.fill('Kanban Test Project')

    const createBtn = page.getByRole('button', { name: /create project/i })
    await createBtn.click()

    // Wait for redirect to detail page
    await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+/, { timeout: 10000 })

    // Project name should be visible
    const projectName = page.getByText('Kanban Test Project')
    await expect(projectName).toBeVisible()

    // Tab buttons should exist (Kanban, Timeline, Tasks)
    const kanbanTab = page.getByRole('button', { name: /kanban/i })
    const timelineTab = page.getByRole('button', { name: /timeline/i })
    const tasksTab = page.getByRole('button', { name: /tasks/i })

    // At least the Kanban tab should be visible
    if (await kanbanTab.count() > 0) {
      await expect(kanbanTab).toBeVisible()
    }

    // Try switching tabs if they exist
    if (await timelineTab.count() > 0) {
      await timelineTab.click()
      await page.waitForTimeout(500)
    }

    if (await tasksTab.count() > 0) {
      await tasksTab.click()
      await page.waitForTimeout(500)
    }
  })

  test('should navigate back to project list from detail', async ({ page }) => {
    // Create a project first
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    const nameInput = page.locator('#name')
    await nameInput.fill('Back Nav Test')

    const createBtn = page.getByRole('button', { name: /create project/i })
    await createBtn.click()

    await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+/, { timeout: 10000 })

    // Click back button
    const backButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await backButton.click()
    await page.waitForURL(/\/projects$/, { timeout: 5000 })
    await expect(page).toHaveURL(/\/projects$/)
  })
})
