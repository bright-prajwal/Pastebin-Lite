
const express = require('express');
const router = express.Router();
const { healthCheck } = require('../lib/db');

router.get('/', async (req, res, next) => {
  try {
    const isHealthy = await healthCheck();
    res.status(200).json({ ok: isHealthy });
  } catch (error) {
    res.status(200).json({ ok: false });
  }
});

module.exports = router;

