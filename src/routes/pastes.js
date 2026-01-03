/**
 * Paste routes
 */
const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const { createPasteValidation } = require('../lib/validation');
const {
  createPasteHandler,
  getPasteHandler,
  viewPasteHandler
} = require('../controllers/pasteController');

/**
 * Validation middleware
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg
    });
  }
  next();
}

/**
 * POST /api/pastes
 * Create a new paste
 */
router.post('/', createPasteValidation, validateRequest, createPasteHandler);

/**
 * GET /api/pastes/:id
 * Get paste by ID (API endpoint)
 */
router.get('/:id', getPasteHandler);

/**
 * GET /p/:id
 * View paste (HTML endpoint)
 * Note: This route is registered separately in app.js
 */
// This is handled by viewPasteHandler, but registered at app level

module.exports = router;

