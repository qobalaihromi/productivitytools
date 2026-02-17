'use client'

import { useState, useEffect } from 'react'
import { YStack, XStack, H4, Paragraph, Button, Card, Separator, Avatar, Text, Spinner, Switch, Label } from 'tamagui'
import { Cloud, Check, X, RefreshCw, UploadCloud, DownloadCloud, AlertTriangle } from '@tamagui/lucide-icons'
import { useGoogleAuth } from 'app/lib/drive/google-auth'
import { GoogleDriveService } from 'app/lib/drive/drive-service'
import { formatDistanceToNow } from 'date-fns'

type DriveFile = {
    id: string
    name: string
    createdTime?: string
    size?: string
}

export function DriveSettings() {
    const { isAuthenticated, user, loading: authLoading, signIn, signOut, error: authError } = useGoogleAuth()
    const [backups, setBackups] = useState<DriveFile[]>([])
    const [loadingBackups, setLoadingBackups] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [restoring, setRestoring] = useState<string | null>(null)
    const [autoBackup, setAutoBackup] = useState(false)

    const driveService = GoogleDriveService.getInstance()

    const loadBackups = async () => {
        if (!isAuthenticated) return
        setLoadingBackups(true)
        try {
            const files = await driveService.listBackups()
            setBackups(files as DriveFile[])
        } catch (error) {
            console.error('Failed to list backups', error)
        } finally {
            setLoadingBackups(false)
        }
    }

    const handleBackup = async () => {
        setUploading(true)
        try {
            await driveService.uploadBackup()
            await loadBackups()
        } catch (error) {
            console.error('Backup failed', error)
            alert('Backup failed')
        } finally {
            setUploading(false)
        }
    }

    const handleRestore = async (fileId: string) => {
        if (!confirm('This will replace all current data. Continue?')) return
        setRestoring(fileId)
        try {
            await driveService.restoreBackup(fileId)
            alert('Restore successful! Reloading app...')
            window.location.reload()
        } catch (error) {
            console.error('Restore failed', error)
            alert('Restore failed')
        } finally {
            setRestoring(null)
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            loadBackups()
        } else {
            setBackups([])
        }
    }, [isAuthenticated])

    // Auto-backup simulation (would typically be a worker)
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isAuthenticated && autoBackup) {
            interval = setInterval(() => {
                console.log('Auto-backup triggered')
                handleBackup()
            }, 15 * 60 * 1000) // 15 minutes
        }
        return () => clearInterval(interval)
    }, [isAuthenticated, autoBackup])

    if (authLoading) {
        return <Spinner size="large" />
    }

    return (
        <Card borderWidth={1} borderColor="$borderColor" padding="$4" gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <XStack gap="$3" alignItems="center">
                    <Avatar circular size="$4">
                        <Avatar.Image src={user?.photoLink || ''} />
                        <Avatar.Fallback backgroundColor="$blue5" alignItems="center" justifyContent="center">
                            <Cloud color="$blue10" />
                        </Avatar.Fallback>
                    </Avatar>
                    <YStack>
                        <H4>Google Drive Backup</H4>
                        <Paragraph size="$2" color="$color10">
                            {isAuthenticated && user
                                ? `Connected as ${user.emailAddress}`
                                : 'Connect your account to save backups to the cloud.'}
                        </Paragraph>
                        {authError && (
                             <XStack gap="$1" alignItems="center">
                                <AlertTriangle size={12} color="$red10" />
                                <Text color="$red10" fontSize="$2">{authError}</Text>
                             </XStack>
                        )}
                    </YStack>
                </XStack>
                <Button
                    size="$3"
                    theme={isAuthenticated ? 'red' : 'blue'}
                    onPress={isAuthenticated ? signOut : signIn}
                >
                    {isAuthenticated ? 'Disconnect' : 'Connect Drive'}
                </Button>
            </XStack>

            {isAuthenticated && (
                <>
                    <Separator />
                    
                    <XStack justifyContent="space-between" alignItems="center">
                        <XStack gap="$2" alignItems="center">
                            <Label htmlFor="auto-backup">Auto-backup (every 15m)</Label>
                            <Switch id="auto-backup" size="$2" checked={autoBackup} onCheckedChange={setAutoBackup}>
                                <Switch.Thumb animation="quick" />
                            </Switch>
                        </XStack>
                        
                        <Button
                            size="$3"
                            icon={uploading ? <Spinner /> : UploadCloud}
                            onPress={handleBackup}
                            disabled={uploading}
                        >
                            Backup Now
                        </Button>
                    </XStack>

                    <Separator />

                    <YStack gap="$3">
                        <XStack justifyContent="space-between" alignItems="center">
                            <H4 size="$3" color="$color11">Recent Backups</H4>
                            <Button size="$2" chromeless icon={RefreshCw} onPress={loadBackups} />
                        </XStack>
                        
                        {loadingBackups ? (
                            <Spinner />
                        ) : backups.length === 0 ? (
                            <Paragraph color="$color10" size="$3">No backups found.</Paragraph>
                        ) : (
                            <YStack gap="$2">
                                {backups.map(file => (
                                    <XStack key={file.id} justifyContent="space-between" alignItems="center" padding="$2" hoverStyle={{ backgroundColor: '$color2' }} borderRadius="$3">
                                        <YStack>
                                            <Text fontWeight="600">{file.name}</Text>
                                            <Text fontSize="$2" color="$color10">
                                                {file.createdTime && formatDistanceToNow(new Date(file.createdTime), { addSuffix: true })}
                                            </Text>
                                        </YStack>
                                        <Button
                                            size="$2"
                                            icon={restoring === file.id ? <Spinner /> : DownloadCloud}
                                            onPress={() => handleRestore(file.id)}
                                            disabled={!!restoring}
                                        >
                                            Restore
                                        </Button>
                                    </XStack>
                                ))}
                            </YStack>
                        )}
                    </YStack>
                </>
            )}
        </Card>
    )
}
