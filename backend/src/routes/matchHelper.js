const express = require('express');
const upload = require('../middleware/upload');
const { matchHelper } = require('../controllers/matchController');

const router = express.Router();

router.post('/', upload.single('audio'), matchHelper);

module.exports = router;
