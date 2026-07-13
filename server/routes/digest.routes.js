const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const digestController = require('../controllers/digest.controller');

router.post('/generate', authMiddleware, digestController.generateDigest);
router.post('/send', authMiddleware, digestController.sendDigest);
router.get('/', authMiddleware, digestController.getDigests);

module.exports = router;
