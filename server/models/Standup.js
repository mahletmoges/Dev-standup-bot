const mongoose = require('mongoose');

const standupSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    did: { type: String, required: true },
    doing: { type: String, required: true },
    blockers: { type: String, default: '' }
  },
  { timestamps: true }
);

standupSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Standup', standupSchema);
