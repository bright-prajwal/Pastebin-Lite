/**
 * Health check route
 */
const express = require('express');
const router = express.Router();
const { healthCheck } = require('../lib/db');

/**
 * GET /api/healthz
 * Health check endpoint - verifies database connectivity
 */
router.get('/', async (req, res, next) => {
  try {
    const isHealthy = await healthCheck();
    res.status(200).json({ ok: isHealthy });
  } catch (error) {
    // Even if there's an error, return 200 with ok: false
    res.status(200).json({ ok: false });
  }
});

module.exports = router;

