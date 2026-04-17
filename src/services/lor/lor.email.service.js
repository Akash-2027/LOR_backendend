import { Resend } from 'resend';
import Faculty from '../../models/user.faculty.model.js';
import LorRequest from '../../models/lor.request.model.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

/**
 * Returns true if the monthly email cap has been reached.
 * Counts LOR requests where emailSentAt falls in the current calendar month.
 */
export const isMonthlyCapReached = async () => {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const count = await LorRequest.countDocuments({ emailSentAt: { $gte: startOfMonth } });
  return count >= env.emailMonthlyCap;
};

/**
 * Sends a notification email to the faculty member when a new LOR request is submitted.
 * Fire-and-forget: never throws, logs warnings on failure.
 */
export const sendFacultyNotificationEmail = async (request) => {
  if (!env.resendApiKey) {
    logger.warn('[lor-email] RESEND_API_KEY not configured — skipping notification');
    return;
  }

  if (await isMonthlyCapReached()) {
    logger.warn({ requestId: request._id }, '[lor-email] Monthly email cap reached — skipping notification');
    return;
  }

  const faculty = await Faculty.findById(request.facultyId).select('name email collegeEmail').lean();
  if (!faculty) {
    logger.warn({ requestId: request._id, facultyId: request.facultyId }, '[lor-email] Faculty not found — skipping notification');
    return;
  }

  const toAddress = faculty.collegeEmail || faculty.email;
  if (!toAddress) {
    logger.warn({ requestId: request._id }, '[lor-email] Faculty has no email address — skipping notification');
    return;
  }

  const resend = new Resend(env.resendApiKey);

  const dueDateStr = request.dueDate
    ? new Date(request.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#003366;padding:20px 32px;">
          <p style="margin:0;color:#c5a059;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;">Government Engineering College, Modasa</p>
          <h2 style="margin:6px 0 0;color:#ffffff;font-size:18px;">New LOR Request</h2>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;color:#374151;font-size:14px;">Dear Prof. <strong>${faculty.name}</strong>,</p>
          <p style="margin:0 0 20px;color:#374151;font-size:14px;">A new Letter of Recommendation request has been submitted and is awaiting your review.</p>
          <!-- Details table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:6px;padding:0;margin-bottom:24px;">
            <tr><td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;">
              <span style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;">Program</span><br>
              <strong style="color:#111827;font-size:13px;">${request.program}</strong>
            </td></tr>
            <tr><td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;">
              <span style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;">Target University</span><br>
              <strong style="color:#111827;font-size:13px;">${request.targetUniversity}</strong>
            </td></tr>
            <tr><td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;">
              <span style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;">Purpose</span><br>
              <strong style="color:#111827;font-size:13px;">${request.purpose}</strong>
            </td></tr>
            <tr><td style="padding:14px 18px;">
              <span style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;">Due Date</span><br>
              <strong style="color:#111827;font-size:13px;">${dueDateStr}</strong>
            </td></tr>
          </table>
          <!-- CTA -->
          <table cellpadding="0" cellspacing="0"><tr><td>
            <a href="${env.clientBaseUrl}/faculty" style="display:inline-block;background:#003366;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;font-weight:bold;">View Request on Dashboard</a>
          </td></tr></table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:11px;">This is an automated notification from the GEC Modasa LOR Portal. Do not reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: env.resendFrom,
    to: toAddress,
    subject: `New LOR Request — ${request.targetUniversity}`,
    html: htmlBody
  });

  if (error) {
    logger.warn({ error, requestId: request._id }, '[lor-email] Resend API returned error');
    return;
  }

  await LorRequest.findByIdAndUpdate(request._id, { emailSentAt: new Date() });
  logger.info({ requestId: request._id, to: toAddress }, '[lor-email] Faculty notification sent');
};
