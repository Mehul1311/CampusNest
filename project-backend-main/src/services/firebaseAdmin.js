const admin = require('firebase-admin');

let firebaseApp = null;

function initFirebase() {
  if (firebaseApp) return firebaseApp;

  const credBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const cred = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  // Prefer base64: no escaping or newline issues in .env
  if (credBase64) {
    try {
      const jsonStr = Buffer.from(credBase64.trim(), 'base64').toString('utf8');
      const parsed = JSON.parse(jsonStr);
      firebaseApp = admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (e) {
      console.warn('Firebase: Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64', e.message);
    }
  } else if (cred) {
    try {
      let jsonStr = typeof cred === 'string' ? cred.trim() : cred;
      if (typeof jsonStr === 'string' && (jsonStr.startsWith("'") || jsonStr.startsWith('"'))) {
        jsonStr = jsonStr.slice(1, -1);
      }
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      firebaseApp = admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (e) {
      console.warn('Firebase: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON', e.message);
    }
  } else if (credPath) {
    firebaseApp = admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else {
    console.warn('Firebase: No credentials. Set FIREBASE_SERVICE_ACCOUNT_BASE64, FIREBASE_SERVICE_ACCOUNT_JSON, or GOOGLE_APPLICATION_CREDENTIALS');
  }

  return firebaseApp;
}

async function verifyIdToken(idToken) {
  initFirebase();
  if (!firebaseApp) throw new Error('Firebase not configured');
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded;
}

module.exports = { initFirebase, verifyIdToken };
