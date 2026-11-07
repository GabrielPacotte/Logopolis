import app from '@adonisjs/core/services/app'
import { appUrl } from '#config/app'
import env from '#start/env'
import { Resend } from 'resend'

export type IdentityMail = {
  recipient: string
  subject: string
  text: string
}

const testOutbox: IdentityMail[] = []

/**
 * {test delivery has been used} => {removes all captured transactional messages}
 *
 * Effects: clears process-local test state only.
 * Invariants: this helper never contacts an external provider.
 */
export function clearTestOutbox(): void {
  testOutbox.splice(0)
}

/**
 * {the API runs in its test environment} => {returns a snapshot of messages captured in memory}
 *
 * Refus: non-test callers receive no captured delivery data.
 * Invariants: returned messages contain test-only raw tokens and must not be logged.
 */
export function getTestOutbox(): readonly IdentityMail[] {
  if (!app.inTest) throw new Error('The test outbox is only available in the test environment.')
  return [...testOutbox]
}

/**
 * {message contains a recipient, subject and text without sensitive logging} => {the configured mail adapter receives one transactional message}
 *
 * Effects: delegates delivery to the configured Adonis mailer.
 * Invariants: this adapter never writes message content or tokens to application logs.
 */
export async function deliverIdentityMail(message: IdentityMail): Promise<void> {
  if (!app.inProduction) {
    testOutbox.push(message)
    return
  }

  const apiKey = env.get('RESEND_API_KEY')
  if (!apiKey) throw new Error('RESEND_API_KEY is required for transactional mail in production.')

  const resend = new Resend(apiKey)
  const result = await resend.emails.send({
    from: `${env.get('MAIL_FROM_NAME')} <${env.get('MAIL_FROM_ADDRESS')}>`,
    to: [message.recipient],
    subject: message.subject,
    text: message.text,
  })
  if (result.error) throw new Error('The transactional email provider rejected the message.')
}

/**
 * {recipient is normalized and token is an unexpired raw verification secret} => {returns an email payload containing one verification URL}
 *
 * Effects: none.
 * Invariants: the raw token exists only in the returned message and is not persisted by this function.
 */
export function verificationEmail(recipient: string, token: string): IdentityMail {
  const url = new URL('/auth/verify-email', appUrl)
  url.searchParams.set('token', token)

  return {
    recipient,
    subject: 'Vérifiez votre adresse e-mail Logopolis',
    text: `Confirmez votre adresse e-mail : ${url.toString()}`,
  }
}

/**
 * {recipient is normalized and token is an unexpired raw reset secret} => {returns an email payload containing one password-reset URL}
 *
 * Effects: none.
 * Invariants: the raw token exists only in the returned message and is not persisted by this function.
 */
export function passwordResetEmail(recipient: string, token: string): IdentityMail {
  const url = new URL('/auth/password-reset/confirm', appUrl)
  url.searchParams.set('token', token)

  return {
    recipient,
    subject: 'Réinitialisez votre mot de passe Logopolis',
    text: `Choisissez un nouveau mot de passe : ${url.toString()}`,
  }
}
