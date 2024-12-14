# mlgc-bserver - Skin Cancer Detection API

This repository provides a backend server for skin cancer detection using machine learning. It uses TensorFlow.js to load a pre-trained model, processes image uploads, and returns predictions (Cancer or Non-cancer). The predictions are then stored in Firebase Firestore for later access.

## Features

- **Image Upload**: Users can upload an image for prediction.
- **Prediction**: The server uses a pre-trained TensorFlow.js model to classify images as either "Cancer" or "Non-cancer".
- **Prediction History**: The server stores predictions in Firebase Firestore, and users can retrieve a list of all past predictions.

## Technologies Used

- [Express.js](https://expressjs.com/): Web framework for building the API.
- [TensorFlow.js](https://www.tensorflow.org/js): JavaScript library for machine learning.
- [Firebase](https://firebase.google.com/): Used for storing prediction data in Firestore.
- [Multer](https://www.npmjs.com/package/multer): Middleware for handling file uploads.
- [Sharp](https://sharp.pixelplumbing.com/): Image processing library for image validation and resizing.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/mlgc-bserver.git
```

### 2. Install dependencies

```bash
cd mlgc-bserver
npm install
```

### 3. Firebase Setup

- You need a Firebase project. Create a new project or use an existing one.
- Create a service account in the Firebase Console, download the service account key, and place it in the root directory as `serviceAccountKey.json`.

### 4. Set up model

- The model used for predictions is hosted on Google Cloud Storage. You can specify the model URL in `index.js` under the `MODEL_URL` constant.

### 5. Run the application

```bash
npm run start
```

The server will start running at http://localhost:8080.

### 6. Use the Prediction API

#### `POST /predict`

Send an image to the `/predict` endpoint to get a prediction.

##### Request:
```bash
curl -X POST http://localhost:8080/predict -F "image=@path/to/your/image.jpg"
```

##### Response:
```json
{
  "status": "success",
  "message": "Model is predicted successfully",
  "data": {
    "id": "prediction_id",
    "result": "Cancer",
    "suggestion": "Segera periksa ke dokter!",
    "createdAt": "2024-12-14T12:00:00Z"
  }
}
```

#### `GET /predict/histories`

To fetch all prediction histories:
```bash
curl -X GET http://localhost:8080/predict/histories
```

##### Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": "prediction_id",
      "result": "Non-cancer",
      "suggestion": "Penyakit kanker tidak terdeteksi.",
      "confidence": 0.75,
      "createdAt": "2024-12-14T12:00:00Z"
    },
    ...
  ]
}
```

## Folder Structure

```bash
- src/
  - firebase.js             # Firebase initialization and Firestore setup
  - index.js                # Express server and prediction logic
  - predictionService.js    # Logic for saving predictions to Firestore
- .gitignore                # Git ignore file
- package.json              # Project metadata and dependencies
- README.md                 # Project documentation
- serviceAccountKey.json    # Firebase service account key (not to be shared publicly)
```
