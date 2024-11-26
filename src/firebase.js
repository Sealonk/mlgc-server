const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Path ke file kunci akun layanan Firebase

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Menggunakan credential dari service account key
  databaseURL: 'https://submissionmlgc-andre-442908.firebaseio.com'
});

// Inisialisasi Firestore
const db = admin.firestore();

// Ekspor objek db untuk digunakan di file lain
module.exports = { db };
