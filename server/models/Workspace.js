const mongoose = require('mongoose');

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    inviteCode: { type: String, required: true, unique: true, default: generateInviteCode },
    slackWebhookUrl: { type: String, default: '' },
    notificationEmail: { type: String, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workspace', workspaceSchema);
