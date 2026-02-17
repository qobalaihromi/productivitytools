import { useState, useEffect, useCallback } from 'react'
import { DriveAuthState, DriveUser } from './types'

const GSI_CLIENT_URL = 'https://accounts.google.com/gsi/client'
const SCOPES = 'https://www.googleapis.com/auth/drive.file'

let tokenClient: google.accounts.oauth2.TokenClient | null = null
let gapiLoaded = false
let gisLoaded = false

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<DriveAuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const loadScripts = async () => {
      try {
        await Promise.all([
          loadScript(GSI_CLIENT_URL, () => { gisLoaded = true }),
          // gapi is loaded by drive-service, but we need to wait for it for some ops
        ])
        
        if (window.google?.accounts?.oauth2) {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
                scope: SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse.access_token) {
                        // Token received, now fetch user info to confirm
                        fetchUserInfo(tokenResponse.access_token)
                    }
                },
            })
        }
        
        // Check if we have a stored token
        const storedToken = localStorage.getItem('google_access_token')
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
            localStorage.setItem('google_access_token', accessToken)
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
            localStorage.removeItem('google_access_token')
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
    const token = localStorage.getItem('google_access_token')
    if (token && window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(token, () => {
            console.log('Token revoked')
        })
    }
    localStorage.removeItem('google_access_token')
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
