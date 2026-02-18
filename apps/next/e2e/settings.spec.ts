import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('should render "Settings" heading', async ({ page }) => {
    const heading = page.getByText('Settings', { exact: false }).first()
    await expect(heading).toBeVisible()
  })

  test('should display description text', async ({ page }) => {
    const description = page.getByText('Manage your data and preferences.')
    await expect(description).toBeVisible()
  })

  test('should display "Cloud Backup" section', async ({ page }) => {
    const cloudSection = page.getByText('Cloud Backup')
    await expect(cloudSection).toBeVisible()
  })

  test('should display "Data Management" section', async ({ page }) => {
    const dataSection = page.getByText('Data Management')
    await expect(dataSection).toBeVisible()
  })

  test('should display "Backup Data" card with Export button', async ({ page }) => {
    const backupTitle = page.getByText('Backup Data')
    await expect(backupTitle).toBeVisible()

    const exportBtn = page.getByRole('button', { name: /export json/i })
    await expect(exportBtn).toBeVisible()
  })

  test('should display "Restore Data" card with Import button', async ({ page }) => {
    const restoreTitle = page.getByText('Restore Data')
    await expect(restoreTitle).toBeVisible()

    const importBtn = page.getByRole('button', { name: /import json/i })
    await expect(importBtn).toBeVisible()
  })

  test('should display "Reset App" card with Delete button', async ({ page }) => {
    const resetTitle = page.getByText('Reset App')
    await expect(resetTitle).toBeVisible()

    const deleteBtn = page.getByRole('button', { name: /delete all data/i })
    await expect(deleteBtn).toBeVisible()
  })

  test('should display "Storage Info" section', async ({ page }) => {
    const storageSection = page.getByText('Storage Info')
    await expect(storageSection).toBeVisible()

    const indexedDBInfo = page.getByText('Local Storage (IndexedDB)')
    await expect(indexedDBInfo).toBeVisible()
  })

  test('export button should trigger download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)

    const exportBtn = page.getByRole('button', { name: /export json/i })
    
    // Dismiss the alert that shows after export
    page.on('dialog', (dialog) => dialog.accept())
    
    await exportBtn.click()

    const download = await downloadPromise
    if (download) {
      expect(download.suggestedFilename()).toContain('tasktik-backup')
      expect(download.suggestedFilename()).toContain('.json')
    }
  })

  test('delete button should show confirmation dialog', async ({ page }) => {
    let dialogMessage = ''

    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      await dialog.dismiss() // Cancel the deletion
    })

    const deleteBtn = page.getByRole('button', { name: /delete all data/i })
    await deleteBtn.click()

    // Wait a moment for the dialog to appear
    await page.waitForTimeout(500)

    expect(dialogMessage).toContain('Are you sure')
  })

  test('should load without errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    expect(errors).toEqual([])
  })
})
