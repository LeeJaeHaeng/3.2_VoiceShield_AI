# VoiceShield AI Backend Server

This is the Python backend server for the VoiceShield AI app. It hosts the deepfake detection model and exposes an API for the React Native app to analyze audio files.

## Setup

1.  **Install Python 3.8+**
2.  **Install Dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

    (Note: You might need to install `ffmpeg` for `librosa` to work with certain audio formats.)

3.  **Place Model File:**
    - You need the trained model file `best_model.h5`.
    - If you have run the Kaggle notebook, download the `best_model.h5` file.
    - Place it in this `backend` directory.

## Running the Server

Run the following command in this directory:

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /`: Check server status.
- `POST /analyze`: Upload an audio file for analysis.
  - Form Data: `file` (Audio file)
  - Returns: JSON with `isDeepfake`, `confidence`, `score`, and `details`.

## Connecting from App

The React Native app is configured to connect to `http://10.0.2.2:8000` by default (for Android Emulator).
If you are running on a physical device or iOS simulator, update `SERVER_URL` in `src/context/AppContext.js` with your computer's IP address.
