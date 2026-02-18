import { exportData, importData, type BackupData } from 'app/lib/backup'

const GAPI_CLIENT_URL = 'https://apis.google.com/js/api.js'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'

let gapiInited = false

declare const gapi: any;

export class GoogleDriveService {
    private static instance: GoogleDriveService
    
    private constructor() {}

    static getInstance(): GoogleDriveService {
        if (!GoogleDriveService.instance) {
            GoogleDriveService.instance = new GoogleDriveService()
        }
        return GoogleDriveService.instance
    }

    async init() {
        if (gapiInited) return

        await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = GAPI_CLIENT_URL
            script.onload = () => {
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            discoveryDocs: [DISCOVERY_DOC],
                        })
                        gapiInited = true
                        resolve()
                    } catch (err) {
                        reject(err)
                    }
                })
            }
            script.onerror = reject
            document.body.appendChild(script)
        })
    }

    private getAccessToken(): string | null {
        return localStorage.getItem('google_access_token')
    }

    private async setToken() {
        const token = this.getAccessToken()
        if (!token) throw new Error('Not authenticated')
        gapi.client.setToken({ access_token: token })
    }

    async listBackups() {
        await this.init()
        await this.setToken()

        const response = await gapi.client.drive.files.list({
            q: "name contains 'tasktik_backup_' and mimeType = 'application/json' and trashed = false",
            fields: 'files(id, name, createdTime, size)',
            orderBy: 'createdTime desc',
            pageSize: 10
        })

        return response.result.files || []
    }

    async uploadBackup() {
        const data = await exportData()
        const fileName = `tasktik_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
        const fileContent = JSON.stringify(data)
        const file = new Blob([fileContent], { type: 'application/json' })
        const metadata = {
            name: fileName,
            mimeType: 'application/json',
            // parents: ['appDataFolder'] // Optional: Use appDataFolder or root
        }

        const accessToken = this.getAccessToken()
        if (!accessToken) throw new Error('Not authenticated')

        const form = new FormData()
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
        form.append('file', file)

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form
        })
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
        }
        
        return await response.json()
    }

    async restoreBackup(fileId: string) {
        await this.init()
        await this.setToken()

        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        })

        // response.body is the JSON content because of alt=media
        const backupData = response.result as unknown as BackupData
        return await importData(backupData)
    }
}
