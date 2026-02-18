import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import { DriveAuthState, DriveUser } from './types'

declare const google: any;

const GSI_CLIENT_URL = 'https://accounts.google.com/gsi/client'
const SCOPES = 'https://www.googleapis.com/auth/drive.file'

let tokenClient: any = null
let gapiLoaded = false
let gisLoaded = false

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<DriveAuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  })

  // Start with loading: false on native since it's not supported
  if (Platform.OS !== 'web') {
     return {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Google Drive backup is available on Web only.',
        signIn: () => alert('Google Drive backup is currently Web-only.'),
        signOut: () => {}
     }
  }

  useEffect(() => {
    const loadScripts = async () => {
      try {
        await Promise.all([
          loadScript(GSI_CLIENT_URL, () => { gisLoaded = true }),
          // gapi is loaded by drive-service, but we need to wait for it for some ops
        ])
        
        if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
            tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
                scope: SCOPES,
                callback: (tokenResponse: any) => {
                    if (tokenResponse.access_token) {
                        // Token received, now fetch user info to confirm
                        fetchUserInfo(tokenResponse.access_token)
                    }
                },
            })
        }
        
        // Check if we have a stored token
        const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('google_access_token') : null
        if (storedToken) {
            fetchUserInfo(storedToken)
        } else {
            setAuthState(prev => ({ ...prev, loading: false }))
        }

      } catch (err) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to load Google scripts' }))
      }
    }

    loadScripts()
  }, [])

  const fetchUserInfo = async (accessToken: string) => {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        
        if (response.ok) {
            const user = await response.json()
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('google_access_token', accessToken)
            }
            setAuthState({
                isAuthenticated: true,
                user: {
                    displayName: user.name,
                    emailAddress: user.email,
                    photoLink: user.picture
                },
                loading: false,
                error: null
            })
        } else {
            // Token invalid
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('google_access_token')
            }
            setAuthState(prev => ({ ...prev, isAuthenticated: false, user: null, loading: false }))
        }
    } catch (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to fetch user info' }))
    }
  }

  const signIn = useCallback(() => {
    if (tokenClient) {
        // Request authorization
        tokenClient.requestAccessToken()
    } else {
        console.error('Token client not initialized')
    }
  }, [])

  const signOut = useCallback(() => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('google_access_token') : null
    if (token && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
        (window as any).google.accounts.oauth2.revoke(token, () => {
            console.log('Token revoked')
        })
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('google_access_token')
    }
    setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
    })
  }, [])

  return {
    ...authState,
    signIn,
    signOut
  }
}

// Helper to load scripts
function loadScript(src: string, onLoad: () => void): Promise<void> {
    if (typeof document === 'undefined') return Promise.resolve()
    
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            onLoad()
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.defer = true
        script.onload = () => {
            onLoad()
            resolve()
        }
        script.onerror = reject
        document.body.appendChild(script)
    })
}
