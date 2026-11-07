import mail from '@adonisjs/mail/services/main'
import { appUrl } from '#config/app'

export type IdentityMail = {
  recipient: string
  subject: string
  text: string
}

/**
 * {message contains a recipient, subject and text without sensitive logging} => {the configured mail adapter receives one transactional message}
 *
 * Effects: delegates delivery to the configured Adonis mailer.
 * Invariants: this adapter never writes message content or tokens to application logs.
 */
export async function deliverIdentityMail(message: IdentityMail): Promise<void> {
  await mail.send((mailMessage) => {
    mailMessage.to(message.recipient).subject(message.subject).text(message.text)
  })
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
