import admin from 'firebase-admin';

if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error(
    'The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.'
  );
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const adminDb = admin.firestore();

export { adminDb }; 