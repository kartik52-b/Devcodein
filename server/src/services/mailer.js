import nodemailer from 'nodemailer';

/**
 * Email delivery for OTP verification.
 *
 * Configuration is read from the environment (EMAIL_HOST / EMAIL_PORT /
 * EMAIL_USER / EMAIL_PASSWORD / EMAIL_FROM). No credentials are hard-coded.
 *
 * When email is not configured AND NODE_ENV !== 'production', the message is
 * not sent anywhere: the code is returned to the caller in a `devOtp` field so
 * the flow can be exercised locally. In production an unconfigured transport
 * throws, so the API reports a real error instead of pretending an email went
 * out.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER);

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: process.env.EMAIL_USER
      ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
      : undefined
  });

  return transporter;
};

/**
 * Welcome email sent exactly once, when an account is first created
 * (email/password registration or first-time Google sign-in).
 *
 * The caller is responsible for the once-only guarantee (`welcomeEmailSent`
 * on the user document) and for catching failures: a broken SMTP transport
 * must never block account creation or sign-in.
 */
export const renderWelcomeEmail = ({ name }) => ({
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'DevVerse <no-reply@devverse.local>',
  subject: 'Welcome to DevVerse 🎉',
  text: [
    `Hi ${there(name)},`,
    '',
    'Welcome to DevVerse! Your account has been successfully created, and we are excited to have you here.',
    '',
    'DevVerse helps you learn coding through challenges, roadmaps, DSA practice, AI mentorship, algorithm visualization, and gamified progress.',
    '',
    'You can now start learning and building your coding skills.',
    '',
    'Welcome aboard!',
    '— Team DevVerse'
  ].join('\n')
});

/**
 * @returns {Promise<{ delivered: boolean, skipped?: boolean, reason?: string }>}
 * Never throws: an unavailable mail transport is reported, not raised, so the
 * caller can log it and continue.
 */
export const sendWelcomeEmail = async ({ to, name }) => {
  if (!isEmailConfigured()) {
    if (isProduction) {
      console.warn(`[mailer] welcome email not sent to ${to}: email is not configured`);
      return { delivered: false, skipped: true, reason: 'email-not-configured' };
    }
    console.warn(`[mailer] welcome email suppressed (no SMTP configured) for ${to}`);
    return { delivered: false, skipped: true, reason: 'email-not-configured' };
  }

  try {
    const info = await getTransporter().sendMail({
      ...renderWelcomeEmail({ name }),
      to
    });
    return { delivered: true, messageId: info.messageId };
  } catch (error) {
    // Failure is logged server-side only; authentication continues normally.
    console.warn(`[mailer] welcome email failed for ${to}: ${error.message}`);
    return { delivered: false, reason: error.message };
  }
};

export const renderOtpEmail = ({ name, code, expiresInMinutes }) => ({
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'DevVerse <no-reply@devverse.local>',
  to: undefined, // set by the caller
  subject: `Your DevVerse verification code: ${code}`,
  text: [
    `Hi ${there(name)},`,
    '',
    `Your DevVerse verification code is: ${code}`,
    `It expires in ${inMinutes(expiresInMinutes)}.`,
    '',
    'If you did not request this code you can safely ignore this email.'
  ].join('\n')
});

const there = (name) => (name ? name.split(' ')[0] : 'there');
const inMinutes = (value) => `${value} minute${value === 1 ? '' : 's'}`;

/**
 * @returns {Promise<{ delivered: boolean, devOtp?: string, reason?: string }>}
 */
export const sendOtpEmail = async ({ to, name, code, expiresInMinutes }) => {
  if (isEmailConfigured()) {
    const info = await getTransporter().sendMail({
      ...renderOtpEmail({ name, code, expiresInMinutes }),
      to
    });
    return { delivered: true, messageId: info.messageId };
  }

  if (isProduction) {
    const error = new Error('Email delivery is not configured on this server.');
    error.status = 503;
    throw error;
  }

  // Development: never pretend the email was sent to a real inbox.
  console.warn(`[mailer] email is not configured — OTP for ${to} is ${code}`);
  return { delivered: false, devOtp: code, reason: 'email-not-configured' };
};
