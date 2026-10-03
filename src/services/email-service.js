// TODO: replace with real email provider (SendGrid, SES, etc.)

/**
 * @description Stub that logs an email instead of sending it.
 * @param {Object} message - Email details.
 * @param {string} message.to - Recipient address.
 * @param {string} message.subject - Subject line.
 * @param {string} message.body - Email body.
 * @returns {Promise<{sent: boolean, to: string, subject: string}>} Resolves with a confirmation object.
 */
function sendEmail({ to, subject, body }) {
  console.log('[EMAIL] Sending to:', to, '| Subject:', subject);
  return Promise.resolve({ sent: true, to, subject });
}

module.exports = { sendEmail };
