const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { savePrediction } = require('./predictionService');
const { db } = require('./firebase');
const tf = require('@tensorflow/tfjs-node');
const axios = require('axios');
const path = require('path');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // Max file size 1MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .png and .jpeg are allowed!'));
    }
    cb(null, true);
  },
});

// Load model from Cloud Storage
const MODEL_URL = 'https://storage.googleapis.com/mlgc-andre-bucket/model/model.json';
let model;

(async () => {
  model = await tf.loadGraphModel(MODEL_URL);
  console.log('Model loaded successfully!');
})();

// POST /predict
app.post('/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Terjadi kesalahan dalam melakukan prediksi',
      });
    }

    // Menggunakan sharp untuk memeriksa format gambar
    const image = sharp(req.file.buffer);
    const metadata = await image.metadata();

    // Cek apakah gambar memiliki 3 saluran warna (RGB)
    if (metadata.channels !== 3) {
      return res.status(400).json({
        status: 'fail',
        message: 'Terjadi kesalahan dalam melakukan prediksi',
      });
    }

    // Preprocess image
    const imageBuffer = req.file.buffer;
    decodedImage = tf.node.decodeImage(imageBuffer, 3);

    // Resize dan buat tensor input untuk model
    const resizedImage = tf.image.resizeBilinear(decodedImage, [224, 224]);
    const inputTensor = resizedImage.expandDims(0).div(255.0);

    // Predict
    const prediction = await model.predict(inputTensor).data();
    const isCancer = prediction[0] > 0.58;

    // Response message
    const result = isCancer ? 'Cancer' : 'Non-cancer';
    const suggestion = isCancer
      ? 'Segera periksa ke dokter!'
      : 'Penyakit kanker tidak terdeteksi.';

    // Save to Firestore
    const docRef = await savePrediction(null, result, suggestion, prediction[0]);

    res.status(201).json({
      status: 'success',
      message: 'Model is predicted successfully',
      data: {
        id: docRef.id,
        result,
        suggestion,
        createdAt: new Date().toISOString(), // Tambahkan field createdAt
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi',
    });
  }
});

// Handle file size error
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      status: 'fail',
      message: 'Payload content length greater than maximum allowed: 1000000',
    });
  }
  next(err);
});

// GET /predict/histories
app.get('/predict/histories', async (req, res) => {
  try {
    const snapshot = await db.collection('predictions').get();
    const histories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Mengirimkan respons dengan status dan data yang benar
    res.status(200).json({
      status: 'success', // Menambahkan status 'success'
      data: histories,   // Mengirimkan array riwayat prediksi dalam 'data'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'fail',     // Status fail jika ada error dalam mengambil data
      message: 'Failed to fetch histories!',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
