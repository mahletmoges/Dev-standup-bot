const mongoose = require('mongoose');

const weeklyDigestSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    weekStart: { type: String, required: true }, // YYYY-MM-DD
    weekEnd: { type: String, required: true }, // YYYY-MM-DD
    summary: { type: String, required: true },
    blockerHighlights: [{ type: String }],
    sentAt: { type: Date, default: null },
    sentVia: { type: String, enum: ['slack', 'email', 'both'], default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeeklyDigest', weeklyDigestSchema);
