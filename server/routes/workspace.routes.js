const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const workspaceController = require('../controllers/workspace.controller');

router.post('/', authMiddleware, workspaceController.createWorkspace);
router.post('/join', authMiddleware, workspaceController.joinWorkspace);
router.get('/:id', authMiddleware, workspaceController.getWorkspace);
router.put('/:id/settings', authMiddleware, workspaceController.updateSettings);

module.exports = router;
