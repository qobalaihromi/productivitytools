'use client'

import { useState } from 'react'
import {
  YStack,
  XStack,
  H1,
  H3,
  Paragraph,
  Input,
  Button,
  Text,
  Separator,
  Theme,
  Card,
} from 'tamagui'
import { Check, Mail, ArrowRight, Timer, LayoutGrid, CalendarDays, Brain } from '@tamagui/lucide-icons'
import { useAuth } from 'app/provider/auth'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithMagicLink } = useAuth()

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const { error } = await signInWithMagicLink(email.trim())
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <Theme name="light">
      <YStack f={1} bg="$background" ai="center" jc="center" p="$4" minHeight="100vh">
        <YStack
          maxWidth={420}
          width="100%"
          gap="$5"
          ai="center"
        >
          {/* Logo / Brand */}
          <YStack ai="center" gap="$2">
            <XStack
              bg="$blue6"
              w={56}
              h={56}
              br="$6"
              ai="center"
              jc="center"
            >
              <Check size={28} color="white" strokeWidth={3} />
            </XStack>
            <H1 size="$9" fontWeight="800" color="$color12" letterSpacing={-1}>
              Tasktik
            </H1>
            <Paragraph color="$color10" size="$4" ta="center">
              All-in-one productivity app for focused work
            </Paragraph>
          </YStack>

          {/* Feature pills */}
          <XStack flexWrap="wrap" gap="$2" jc="center">
            {[
              { icon: Timer, label: 'Timer' },
              { icon: LayoutGrid, label: 'Kanban' },
              { icon: CalendarDays, label: 'Timeline' },
              { icon: Brain, label: 'Smart Plan' },
            ].map(({ icon: Icon, label }) => (
              <XStack
                key={label}
                bg="$color3"
                px="$3"
                py="$1.5"
                br="$10"
                ai="center"
                gap="$1.5"
              >
                <Icon size={14} color="$color11" />
                <Text color="$color11" size="$2" fontWeight="500">
                  {label}
                </Text>
              </XStack>
            ))}
          </XStack>

          <Separator width="60%" />

          {/* Login Card */}
          <Card
            width="100%"
            bordered
            p="$5"
            br="$6"
            elevate
            size="$4"
          >
            {sent ? (
              <YStack ai="center" gap="$4" py="$4">
                <XStack
                  bg="$green4"
                  w={64}
                  h={64}
                  br="$10"
                  ai="center"
                  jc="center"
                >
                  <Mail size={28} color="$green10" />
                </XStack>
                <H3 size="$6" ta="center" fontWeight="700" color="$color12">
                  Check your email
                </H3>
                <Paragraph color="$color10" size="$3" ta="center" maxWidth={280}>
                  We sent a magic link to{' '}
                  <Text fontWeight="600" color="$color12">
                    {email}
                  </Text>
                  . Click the link to sign in.
                </Paragraph>
                <Button
                  size="$3"
                  chromeless
                  color="$blue10"
                  onPress={() => { setSent(false); setEmail('') }}
                >
                  Use a different email
                </Button>
              </YStack>
            ) : (
              <YStack gap="$4">
                <YStack gap="$1">
                  <Text size="$6" fontWeight="700" color="$color12">
                    Sign in
                  </Text>
                  <Text size="$3" color="$color10">
                    Enter your email to receive a magic link
                  </Text>
                </YStack>

                {error && (
                  <XStack bg="$red3" px="$3" py="$2" br="$4">
                    <Text color="$red10" size="$2">
                      {error}
                    </Text>
                  </XStack>
                )}

                <Input
                  size="$4"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={handleSubmit}
                  borderWidth={1}
                  borderColor="$color6"
                  focusStyle={{ borderColor: '$blue8' }}
                />

                <Button
                  size="$4"
                  bg="$blue9"
                  color="white"
                  fontWeight="600"
                  onPress={handleSubmit}
                  disabled={loading || !email.trim()}
                  opacity={loading || !email.trim() ? 0.6 : 1}
                  iconAfter={loading ? undefined : ArrowRight}
                  pressStyle={{ bg: '$blue10' }}
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </YStack>
            )}
          </Card>

          <Paragraph color="$color8" size="$2" ta="center">
            No password needed. We'll send you a secure link.
          </Paragraph>
        </YStack>
      </YStack>
    </Theme>
  )
}
