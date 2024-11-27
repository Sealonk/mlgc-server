const { db } = require('./firebase'); // Pastikan Anda sudah mengkonfigurasi Firebase di sini

/**
 * Fungsi untuk menyimpan prediksi ke Firestore.
 * @param {string|null} id - ID dokumen prediksi (biarkan null untuk auto-generate)
 * @param {string} result - Hasil prediksi ('cancer' atau 'non-cancer')
 * @param {string} suggestion - Saran berdasarkan hasil prediksi
 * @param {number} confidence - Nilai confidence model (misalnya 0-1)
 * @returns {Promise<Object>} - Objek dokumen yang disimpan
 */
async function savePrediction(id, result, suggestion, confidence) {
  try {
    const predictionData = {
      id,
      result,
      suggestion,
      confidence,
      createdAt: new Date().toISOString(),
    };

    // Jika id tidak diberikan, buat dokumen baru dengan auto-generated ID
    let docRef;
    if (!id) {
      docRef = await db.collection('predictions').add(predictionData);
      // Update the document with the generated id
      await docRef.update({ id: docRef.id });
    } else {
      docRef = db.collection('predictions').doc(id);
      await docRef.set(predictionData);
    }

    return docRef; // Kembalikan referensi dokumen yang disimpan
  } catch (error) {
    console.error('Error saving prediction:', error);
    throw new Error('Failed to save prediction');
  }
}

module.exports = { savePrediction };
