const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const standupController = require('../controllers/standup.controller');

router.post('/', authMiddleware, standupController.submitStandup);
router.get('/today', authMiddleware, standupController.getTodayStandup);
router.get('/workspace', authMiddleware, standupController.getWorkspaceStandups);
router.get('/history', authMiddleware, standupController.getMyHistory);

module.exports = router;
