'use client'

import { useState } from 'react'
import {
  YStack,
  XStack,
  H2,
  H4,
  Paragraph,
  Button,
  Card,
  Theme,
  Separator,
  Text,
  Spinner,
} from 'tamagui'
import { Download, Upload, Trash2, HardDrive } from '@tamagui/lucide-icons'
import { DriveSettings } from 'app/features/settings/drive-settings'
import { exportData, importData, type BackupData } from 'app/lib/backup'
import { db } from 'app/lib/db'

export function SettingsScreen() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const data = await exportData()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `tasktik-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert('Exported successfully')
    } catch (error) {
      console.error(error)
      alert('Export failed')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      setLoading(true)
      try {
        const text = await file.text()
        const json = JSON.parse(text) as BackupData
        const result = await importData(json)

        if (result.success) {
          alert('Import Successful: Your data has been restored. Reloading...')
          setTimeout(() => window.location.reload(), 1500)
        } else {
          throw new Error(result.error)
        }
      } catch (error: any) {
        console.error(error)
        alert('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    input.click()
  }

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      await Promise.all([
        db.projects.clear(),
        db.tasks.clear(),
        db.pomodoro_sessions.clear(),
        db.daily_plans.clear(),
        db.planned_tasks.clear(),
        db.work_settings.clear()
      ])
      alert('Data Cleared: All local data has been deleted.')
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      alert('Error: Could not clear data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Theme name="light">
      <YStack flex={1} padding="$4" gap="$6" maxWidth={800} width="100%" marginHorizontal="auto">
        <YStack gap="$2">
          <H2 size="$8" fontWeight="800">Settings</H2>
          <Paragraph color="$color10">Manage your data and preferences.</Paragraph>
        </YStack>

        <YStack gap="$4">
          <H4 color="$color11" textTransform="uppercase" size="$3" fontWeight="600" letterSpacing={1}>
            Cloud Backup
          </H4>
          <DriveSettings />
        </YStack>

        <YStack gap="$4">
          <H4 color="$color11" textTransform="uppercase" size="$3" fontWeight="600" letterSpacing={1}>
            Data Management
          </H4>
          
          <Card borderWidth={1} borderColor="$borderColor" padding="$4" gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$1" flex={1}>
                <XStack gap="$2" alignItems="center">
                  <Download size={20} color="$blue10" />
                  <H4 size="$5">Backup Data</H4>
                </XStack>
                <Paragraph size="$3" color="$color10">
                  Download a JSON file containing all your projects, tasks, and settings.
                </Paragraph>
              </YStack>
              <Button
                size="$3"
                theme="blue"
                icon={loading ? <Spinner /> : Download}
                onPress={handleExport}
                disabled={loading}
              >
                Export JSON
              </Button>
            </XStack>

            <Separator />

            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$1" flex={1}>
                <XStack gap="$2" alignItems="center">
                  <Upload size={20} color="$green10" />
                  <H4 size="$5">Restore Data</H4>
                </XStack>
                <Paragraph size="$3" color="$color10">
                  Import a previously exported JSON file. This will replace current data.
                </Paragraph>
              </YStack>
              <Button
                size="$3"
                icon={loading ? <Spinner /> : Upload}
                onPress={handleImport}
                disabled={loading}
              >
                Import JSON
              </Button>
            </XStack>
            
            <Separator />

             <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$1" flex={1}>
                <XStack gap="$2" alignItems="center">
                  <Trash2 size={20} color="$red10" />
                  <H4 size="$5" color="$red10">Reset App</H4>
                </XStack>
                <Paragraph size="$3" color="$color10">
                  Permanently delete all local data and reset the application.
                </Paragraph>
              </YStack>
              <Button
                size="$3"
                theme="red"
                icon={loading ? <Spinner /> : Trash2}
                onPress={handleClearData}
                disabled={loading}
              >
                Delete All Data
              </Button>
            </XStack>
          </Card>
        </YStack>

        <YStack gap="$4">
          <H4 color="$color11" textTransform="uppercase" size="$3" fontWeight="600" letterSpacing={1}>
            Storage Info
          </H4>
          <Card borderWidth={1} borderColor="$borderColor" padding="$4">
             <XStack gap="$3" alignItems="center">
                <HardDrive size={24} color="$color10" />
                <YStack>
                  <Text fontWeight="600">Local Storage (IndexedDB)</Text>
                  <Paragraph size="$3" color="$color10">
                    Your data is stored locally in your browser. Clearing browser data will delete it.
                  </Paragraph>
                </YStack>
             </XStack>
          </Card>
        </YStack>

      </YStack>
    </Theme>
  )
}
