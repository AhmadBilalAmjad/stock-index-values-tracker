const { verifyFirebaseToken } = require('../utils/firebase');

// Export the Firebase token verification middleware
module.exports = {
  authenticate: verifyFirebaseToken
}; 