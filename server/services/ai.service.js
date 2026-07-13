const fetch = require('node-fetch');

function formatStandups(standups) {
  return standups
    .map((s) => {
      return `**${s.userId?.name || 'Team Member'}** (${s.date}):
- Did: ${s.did}
- Doing: ${s.doing}
- Blockers: ${s.blockers || 'None'}`;
    })
    .join('\n\n');
}

function buildPrompt(workspaceName, weekStart, weekEnd, standups) {
  const data = formatStandups(standups);
  return `You are a technical team assistant. Below are the daily standup logs for the week of ${weekStart} to ${weekEnd} for the "${workspaceName}" team.

${data}

Please generate:
1. A concise paragraph summary of what the team accomplished this week
2. A bullet list of ongoing blockers that appeared more than once
3. Any patterns or concerns worth flagging to the team lead

Keep the tone professional and brief. Output as plain text.`;
}

async function callAnthropic(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');
  return data.content[0].text;
}

async function callOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
  return data.choices[0].message.content;
}

function fallbackSummary(workspaceName, weekStart, weekEnd, standups) {
  const members = [...new Set(standups.map((s) => s.userId?.name || 'Team Member'))];
  const blockers = standups
    .map((s) => s.blockers)
    .filter((b) => b && b.trim().length > 0);

  return `Weekly Summary for ${workspaceName} (${weekStart} to ${weekEnd})

This week, ${members.join(', ')} logged ${standups.length} standup update(s). The team has been tracking progress, priorities, and blockers across the week.

Ongoing Blockers:
${blockers.length > 0 ? blockers.map((b) => `- ${b}`).join('\n') : '- None reported'}

Note: This is a fallback summary generated because no AI API key was configured. Add an ANTHROPIC_API_KEY or OPENAI_API_KEY to your .env file to enable AI-generated summaries.`;
}

async function generateDigest(workspaceName, weekStart, weekEnd, standups) {
  const prompt = buildPrompt(workspaceName, weekStart, weekEnd, standups);

  try {
    if (process.env.ANTHROPIC_API_KEY) {
      return await callAnthropic(prompt);
    }
    if (process.env.OPENAI_API_KEY) {
      return await callOpenAI(prompt);
    }
    return fallbackSummary(workspaceName, weekStart, weekEnd, standups);
  } catch (error) {
    console.error('AI generation failed:', error.message);
    return fallbackSummary(workspaceName, weekStart, weekEnd, standups);
  }
}

module.exports = { generateDigest };
