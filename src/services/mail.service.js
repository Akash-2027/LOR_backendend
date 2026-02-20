import nodemailer from 'nodemailer';
import env from '../config/env.js';

let cachedTransportPromise;
let cachedMode;

const createTransport = async () => {
  const hasSmtpConfig = Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass);

  if (hasSmtpConfig) {
    cachedMode = 'smtp';
    return nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  cachedMode = 'ethereal';
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const getTransport = async () => {
  if (!cachedTransportPromise) {
    cachedTransportPromise = createTransport();
  }
  return cachedTransportPromise;
};

export const sendMail = async ({ to, subject, text, html }) => {
  const transporter = await getTransport();

  const info = await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
    html
  });

  const previewUrl = cachedMode === 'ethereal' ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) {
    console.log(`[mail][ethereal] preview: ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
    mode: cachedMode
  };
};
