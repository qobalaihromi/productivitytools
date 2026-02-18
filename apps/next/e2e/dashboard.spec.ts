import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should render welcome heading', async ({ page }) => {
    const heading = page.getByText('Welcome back')
    await expect(heading).toBeVisible()
  })

  test('should render productivity overview text', async ({ page }) => {
    const subtitle = page.getByText("Here's your productivity overview.")
    await expect(subtitle).toBeVisible()
  })

  test('should display stats cards', async ({ page }) => {
    // Wait for loading to finish (spinner disappears)
    await page.waitForFunction(() => {
      return !document.querySelector('[role="progressbar"]')
    }, { timeout: 10000 }).catch(() => {
      // Spinner may already be gone
    })

    // Check for stats card labels
    const expectedCards = ['Tasks Today', 'Focus Today', 'Tasks Week', 'Focus Week']
    for (const cardTitle of expectedCards) {
      const card = page.getByText(cardTitle, { exact: false }).first()
      await expect(card).toBeVisible()
    }
  })

  test('should display "On the Horizon" section', async ({ page }) => {
    await page.waitForFunction(() => {
      return !document.querySelector('[role="progressbar"]')
    }, { timeout: 10000 }).catch(() => {})

    const horizonSection = page.getByText('On the Horizon')
    await expect(horizonSection).toBeVisible()
  })

  test('should display "Recent Wins" section', async ({ page }) => {
    await page.waitForFunction(() => {
      return !document.querySelector('[role="progressbar"]')
    }, { timeout: 10000 }).catch(() => {})

    const winsSection = page.getByText('Recent Wins')
    await expect(winsSection).toBeVisible()
  })

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Re-navigate to capture errors from initial load
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    expect(errors).toEqual([])
  })
})
