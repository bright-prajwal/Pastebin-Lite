//  Validation rules using express-validator
 
const { body } = require('express-validator');


//  * Validation rules for creating a paste

const createPasteValidation = [
  body('content')
    .notEmpty()
    .withMessage('content is required and must be a non-empty string')
    .isString()
    .withMessage('content must be a string')
    .trim()
    .notEmpty()
    .withMessage('content cannot be empty'),
  
  body('ttl_seconds')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ttl_seconds must be an integer >= 1'),
  
  body('max_views')
    .optional()
    .isInt({ min: 1 })
    .withMessage('max_views must be an integer >= 1')
];

module.exports = {
  createPasteValidation
};

