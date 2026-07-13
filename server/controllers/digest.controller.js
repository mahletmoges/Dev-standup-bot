const { Standup, Workspace, WeeklyDigest } = require('../models');
const { generateDigest } = require('../services/ai.service');
const { sendToSlack } = require('../services/slack.service');
const { sendEmail } = require('../services/email.service');
const { getWeekBounds } = require('../utils/date');

exports.generateDigest = async (req, res) => {
  try {
    const user = req.user;
    if (!user.workspaceId) {
      return res.status(400).json({ message: 'User is not in a workspace' });
    }

    const workspace = await Workspace.findById(user.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const { weekStart, weekEnd } = getWeekBounds(new Date());

    const existingDigest = await WeeklyDigest.findOne({ workspaceId: workspace._id, weekStart, weekEnd });
    if (existingDigest) {
      return res.json(existingDigest);
    }

    const standups = await Standup.find({
      workspaceId: workspace._id,
      date: { $gte: weekStart, $lte: weekEnd }
    }).populate('userId', 'name email');

    if (standups.length === 0) {
      return res.status(400).json({ message: 'No standups found for this week' });
    }

    const summary = await generateDigest(workspace.name, weekStart, weekEnd, standups);

    const blockerSet = new Set();
    standups.forEach((s) => {
      if (s.blockers && s.blockers.trim().length > 0) {
        blockerSet.add(s.blockers.trim());
      }
    });
    const blockerHighlights = Array.from(blockerSet);

    const digest = new WeeklyDigest({
      workspaceId: workspace._id,
      weekStart,
      weekEnd,
      summary,
      blockerHighlights
    });

    await digest.save();
    res.json(digest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDigests = async (req, res) => {
  try {
    const user = req.user;
    if (!user.workspaceId) {
      return res.status(400).json({ message: 'User is not in a workspace' });
    }

    const digests = await WeeklyDigest.find({ workspaceId: user.workspaceId }).sort({ createdAt: -1 }).limit(20);
    res.json(digests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendDigest = async (req, res) => {
  try {
    const { digestId, via } = req.body; // via: 'slack' | 'email' | 'both'
    const user = req.user;

    if (!user.workspaceId) {
      return res.status(400).json({ message: 'User is not in a workspace' });
    }

    const workspace = await Workspace.findById(user.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const digest = await WeeklyDigest.findById(digestId);
    if (!digest) {
      return res.status(404).json({ message: 'Digest not found' });
    }

    if (digest.workspaceId.toString() !== workspace._id.toString()) {
      return res.status(403).json({ message: 'Digest does not belong to your workspace' });
    }

    const results = [];

    if (via === 'slack' || via === 'both') {
      await sendToSlack(workspace.slackWebhookUrl, digest);
      results.push('slack');
    }

    if (via === 'email' || via === 'both') {
      await sendEmail(workspace.notificationEmail, workspace.name, digest);
      results.push('email');
    }

    digest.sentAt = new Date();
    digest.sentVia = via;
    await digest.save();

    res.json({ message: `Digest sent via ${results.join(' and ')}`, digest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
