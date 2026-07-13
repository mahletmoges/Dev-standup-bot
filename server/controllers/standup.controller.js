const { Standup, User, Workspace } = require('../models');
const { formatDate, getWeekBounds } = require('../utils/date');

exports.submitStandup = async (req, res) => {
  try {
    const { did, doing, blockers, date } = req.body;
    const user = req.user;

    if (!user.workspaceId) {
      return res.status(400).json({ message: 'User is not in a workspace' });
    }

    const standupDate = date || formatDate(new Date());

    const standup = await Standup.findOneAndUpdate(
      { userId: user._id, date: standupDate },
      {
        workspaceId: user.workspaceId,
        did,
        doing,
        blockers: blockers || ''
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(standup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodayStandup = async (req, res) => {
  try {
    const today = formatDate(new Date());
    const standup = await Standup.findOne({ userId: req.user._id, date: today });
    res.json(standup || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkspaceStandups = async (req, res) => {
  try {
    const user = req.user;
    if (!user.workspaceId) {
      return res.status(400).json({ message: 'User is not in a workspace' });
    }

    const { weekStart, weekEnd } = getWeekBounds(new Date());
    const standups = await Standup.find({
      workspaceId: user.workspaceId,
      date: { $gte: weekStart, $lte: weekEnd }
    })
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.json(standups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyHistory = async (req, res) => {
  try {
    const standups = await Standup.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(50);
    res.json(standups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
