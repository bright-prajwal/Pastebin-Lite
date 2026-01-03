
const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const { createPasteValidation } = require('../lib/validation');
const {
  createPasteHandler,
  getPasteHandler,
  viewPasteHandler
} = require('../controllers/pasteController');


function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg
    });
  }
  next();
}

router.post('/', createPasteValidation, validateRequest, createPasteHandler);

router.get('/:id', getPasteHandler);


module.exports = router;

