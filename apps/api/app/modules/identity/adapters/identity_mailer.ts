import app from '@adonisjs/core/services/app'
import { webUrl } from '#config/app'
import env from '#start/env'
import { Resend } from 'resend'
import { Socket } from 'node:net'
import type { IdentityMailer as IdentityMailerPort } from '../application/ports.js'

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
  if (app.inTest) {
    testOutbox.push(message)
    return
  }

  if (!app.inProduction) {
    return deliverToMailpit(message)
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
 * {development Mailpit is reachable on the configured loopback host and port} => {delivers one plain-text identity email without logging its content}
 *
 * Errors: rejects when the development SMTP service cannot be reached or refuses a command.
 * Effects: opens one SMTP connection to Mailpit only outside test and production.
 * Invariants: production never invokes this adapter; token-bearing text is never logged.
 */
async function deliverToMailpit(message: IdentityMail): Promise<void> {
  const host = env.get('MAILPIT_HOST') ?? '127.0.0.1'
  const port = env.get('MAILPIT_PORT') ?? 1025
  const socket = new Socket()
  const responses: number[] = []
  let wake: ((code: number) => void) | undefined
  socket.setEncoding('utf8')
  socket.on('data', (chunk: string) => {
    for (const line of chunk.split('\r\n')) {
      if (!/^\d{3} /.test(line)) continue
      const code = Number(line.slice(0, 3))
      if (wake) {
        const resolve = wake
        wake = undefined
        resolve(code)
      } else responses.push(code)
    }
  })
  const nextResponse = () =>
    new Promise<number>((resolve, reject) => {
      const received = responses.shift()
      if (received !== undefined) {
        resolve(received)
        return
      }
      const timeout = setTimeout(
        () => reject(new Error('Local SMTP service did not respond.')),
        5_000
      )
      wake = (code) => {
        clearTimeout(timeout)
        resolve(code)
      }
      socket.once('error', reject)
    })
  const waitFor = async (expected: number) => {
    const actual = await nextResponse()
    if (actual !== expected) throw new Error('Local SMTP service rejected the message.')
  }
  const command = async (line: string, expected: number) => {
    socket.write(`${line}\r\n`)
    await waitFor(expected)
  }
  try {
    const greeting = waitFor(220)
    await new Promise<void>((resolve, reject) =>
      socket.connect(port, host, resolve).once('error', reject)
    )
    await greeting
    await command('EHLO logopolis.local', 250)
    await command(`MAIL FROM:<${env.get('MAIL_FROM_ADDRESS')}>`, 250)
    await command(`RCPT TO:<${message.recipient}>`, 250)
    await command('DATA', 354)
    await command(
      `From: ${env.get('MAIL_FROM_NAME')} <${env.get('MAIL_FROM_ADDRESS')}>\r\nTo: ${message.recipient}\r\nSubject: ${message.subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${message.text}\r\n.`,
      250
    )
    socket.end('QUIT\r\n')
  } catch {
    socket.destroy()
    throw new Error('The local development mail service is unavailable.')
  }
}

/**
 * {recipient is normalized and token is an unexpired raw verification secret} => {returns an email payload containing one verification URL}
 *
 * Effects: none.
 * Invariants: the raw token exists only in the returned message and is not persisted by this function.
 */
export function verificationEmail(recipient: string, token: string): IdentityMail {
  const url = new URL('/auth/verification-email', webUrl)
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
  const url = new URL('/auth/password-reset/confirm', webUrl)
  url.searchParams.set('token', token)

  return {
    recipient,
    subject: 'Réinitialisez votre mot de passe Logopolis',
    text: `Choisissez un nouveau mot de passe : ${url.toString()}`,
  }
}

/**
 * {the application requests a transactional identity message} => {delegates delivery without exposing Resend or URL construction to a use case}
 *
 * Effects: sends or captures exactly one message.
 * Invariants: raw tokens are only present in the outgoing message body.
 */
export const identityMailer: IdentityMailerPort = {
  sendVerification: async (recipient, token) =>
    deliverIdentityMail(verificationEmail(recipient, token)),
  sendPasswordReset: async (recipient, token) =>
    deliverIdentityMail(passwordResetEmail(recipient, token)),
}
