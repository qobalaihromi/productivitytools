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
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" padding="$4" minHeight="100vh">
        <YStack
          maxWidth={420}
          width="100%"
          gap="$5"
          alignItems="center"
        >
          {/* Logo / Brand */}
          <YStack alignItems="center" gap="$2">
            <XStack
              backgroundColor="$blue6"
              width={56}
              height={56}
              borderRadius="$6"
              alignItems="center"
              justifyContent="center"
            >
              <Check size={28} color="white" strokeWidth={3} />
            </XStack>
            <H1 size="$9" fontWeight="800" color="$color12" letterSpacing={-1}>
              Tasktik
            </H1>
            <Paragraph color="$color10" size="$4" textAlign="center">
              All-in-one productivity app for focused work
            </Paragraph>
          </YStack>

          {/* Feature pills */}
          <XStack flexWrap="wrap" gap="$2" justifyContent="center">
            {[
              { icon: Timer, label: 'Timer' },
              { icon: LayoutGrid, label: 'Kanban' },
              { icon: CalendarDays, label: 'Timeline' },
              { icon: Brain, label: 'Smart Plan' },
            ].map(({ icon: Icon, label }) => (
              <XStack
                key={label}
                backgroundColor="$color3"
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius="$10"
                alignItems="center"
                gap="$1.5"
              >
                <Icon size={14} color="$color11" />
                <Text color="$color11" fontSize="$2" fontWeight="500">
                  {label}
                </Text>
              </XStack>
            ))}
          </XStack>

          <Separator width="60%" />

          {/* Login Card */}
          <Card
            width="100%"
            padding="$5"
            borderRadius="$6"
            elevation="$2"
            size="$4"
            borderWidth={1}
            borderColor="$color4"
          >
            {sent ? (
              <YStack alignItems="center" gap="$4" paddingVertical="$4">
                <XStack
                  backgroundColor="$green4"
                  width={64}
                  height={64}
                  borderRadius="$10"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Mail size={28} color="$green10" />
                </XStack>
                <H3 size="$6" textAlign="center" fontWeight="700" color="$color12">
                  Check your email
                </H3>
                <Paragraph color="$color10" size="$3" textAlign="center" maxWidth={280}>
                  We sent a magic link to{' '}
                  <Text fontWeight="600" color="$color12">
                    {email}
                  </Text>
                  . Click the link to sign in.
                </Paragraph>
                <Button
                  size="$3"
                  chromeless
                  onPress={() => { setSent(false); setEmail('') }}
                >
                  <Button.Text color="$blue10">Use a different email</Button.Text>
                </Button>
              </YStack>
            ) : (
              <YStack gap="$4">
                <YStack gap="$1">
                  <Text fontSize="$6" fontWeight="700" color="$color12">
                    Sign in
                  </Text>
                  <Text fontSize="$3" color="$color10">
                    Enter your email to receive a magic link
                  </Text>
                </YStack>

                {error && (
                  <XStack backgroundColor="$red3" paddingHorizontal="$3" paddingVertical="$2" borderRadius="$4">
                    <Text color="$red10" fontSize="$2">
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
                  backgroundColor="$blue9"
                  onPress={handleSubmit}
                  disabled={loading || !email.trim()}
                  opacity={loading || !email.trim() ? 0.6 : 1}
                  iconAfter={loading ? undefined : ArrowRight}
                  pressStyle={{ backgroundColor: '$blue10' }}
                >
                  <Button.Text color="white" fontWeight="600">
                    {loading ? 'Sending...' : 'Send Magic Link'}
                  </Button.Text>
                </Button>
              </YStack>
            )}
          </Card>

          <Paragraph color="$color8" size="$2" textAlign="center">
            No password needed. We'll send you a secure link.
          </Paragraph>
        </YStack>
      </YStack>
    </Theme>
  )
}
