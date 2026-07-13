const { Workspace, User } = require('../models');

exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const workspace = new Workspace({ name: name.trim(), members: [req.user._id] });
    await workspace.save();

    await User.findByIdAndUpdate(req.user._id, {
      workspaceId: workspace._id,
      role: 'admin'
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinWorkspace = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required' });
    }

    const workspace = await Workspace.findOne({ inviteCode: inviteCode.toUpperCase().trim() });
    if (!workspace) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    if (!workspace.members.includes(req.user._id)) {
      workspace.members.push(req.user._id);
      await workspace.save();
    }

    await User.findByIdAndUpdate(req.user._id, { workspaceId: workspace._id });

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members', 'name email role')
      .lean();

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (!workspace.members.some((m) => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { slackWebhookUrl, notificationEmail } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.members.map((m) => m.toString()).indexOf(req.user._id.toString()) === -1) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    workspace.slackWebhookUrl = slackWebhookUrl || workspace.slackWebhookUrl;
    workspace.notificationEmail = notificationEmail || workspace.notificationEmail;
    await workspace.save();

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
