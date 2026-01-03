/**
 * Time utility for deterministic time handling
 * Supports TEST_MODE with x-test-now-ms header
 */

/**
 * Get current time in milliseconds
 * If TEST_MODE is enabled and x-test-now-ms header is present, use that value
 * Otherwise, use Date.now()
 * 
 * @param {Object} req - Express request object
 * @returns {number} Current time in milliseconds
 */
function getCurrentTime(req) {
  if (process.env.TEST_MODE === '1' && req && req.headers && req.headers['x-test-now-ms']) {
    const testMs = parseInt(req.headers['x-test-now-ms'], 10);
    if (!isNaN(testMs)) {
      return testMs;
    }
  }
  return Date.now();
}

/**
 * Get current Date object
 * @param {Object} req - Express request object
 * @returns {Date} Current date
 */
function getCurrentDate(req) {
  return new Date(getCurrentTime(req));
}

module.exports = {
  getCurrentTime,
  getCurrentDate
};

