const fetch = require('node-fetch');

async function sendToSlack(webhookUrl, digest) {
  if (!webhookUrl) {
    throw new Error('No Slack webhook URL configured');
  }

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 Weekly Standup Digest',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: digest.summary.substring(0, 2900)
      }
    }
  ];

  if (digest.blockerHighlights && digest.blockerHighlights.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Blockers:*\n${digest.blockerHighlights.map((b) => `• ${b}`).join('\n')}`
      }
    });
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks })
  });

  const text = await response.text();
  if (text !== 'ok') {
    throw new Error(`Slack returned: ${text}`);
  }

  return true;
}

module.exports = { sendToSlack };
