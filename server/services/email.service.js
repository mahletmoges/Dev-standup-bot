const { Resend } = require('resend');

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

function buildEmailHtml(workspaceName, digest) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>📋 Weekly Standup Digest — ${workspaceName}</h2>
      <p><strong>Week:</strong> ${digest.weekStart} to ${digest.weekEnd}</p>
      <div style="white-space: pre-line; margin-bottom: 24px;">${digest.summary.replace(/\n/g, '<br/>')}</div>
      ${
        digest.blockerHighlights && digest.blockerHighlights.length > 0
          ? `<h3>Blockers</h3><ul>${digest.blockerHighlights
              .map((b) => `<li>${b}</li>`)
              .join('')}</ul>`
          : ''
      }
    </div>
  `;
}

async function sendEmail(to, workspaceName, digest) {
  if (!resend) {
    throw new Error('Resend API key is not configured');
  }
  if (!to) {
    throw new Error('No notification email provided');
  }

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'digest@example.com',
    to,
    subject: `Weekly Standup Digest — ${workspaceName}`,
    html: buildEmailHtml(workspaceName, digest)
  });

  return true;
}

module.exports = { sendEmail };
