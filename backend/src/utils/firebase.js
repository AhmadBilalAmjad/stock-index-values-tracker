const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
// In a production app, we would use environment variables or a service account JSON file
// For demo purposes, we'll check if serviceAccount info is available
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  try {
    // Check if we have Firebase credentials in environment variables
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });

      console.log('Firebase Admin SDK initialized with environment variables');
      firebaseInitialized = true;
    } else {
      console.log('Firebase credentials not found. Authentication features will not work.');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
};

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  if (!firebaseInitialized) {
    // For demo purposes, we'll allow requests without authentication
    req.user = { uid: 'demo-user', email: 'demo@example.com' };
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Missing or invalid authorization header.'
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Invalid token.'
    });
  }
};

module.exports = {
  initializeFirebase,
  verifyFirebaseToken
}; 