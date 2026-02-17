export interface DriveFile {
  id: string
  name: string
  mimeType: string
  createdTime?: string
  modifiedTime?: string
  parents?: string[]
}

export interface DriveUser {
  displayName: string
  emailAddress: string
  photoLink?: string
}

export interface DriveAuthState {
  isAuthenticated: boolean
  user: DriveUser | null
  loading: boolean
  error: string | null
}
