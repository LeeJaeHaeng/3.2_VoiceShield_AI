import os
from contextlib import asynccontextmanager
import numpy as np
import librosa
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import tempfile
import speech_recognition as sr
from scipy.spatial.distance import cosine
import json
from fastapi import Form, Depends
from PIL import Image, ImageChops, ImageEnhance, ImageStat
from sqlalchemy.orm import Session
from database import init_db, get_db, Voice, AnalysisLog
import datetime
from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch
import torchaudio

# Patch for speechbrain compatibility with newer torchaudio
if not hasattr(torchaudio, 'list_audio_backends'):
    torchaudio.list_audio_backends = lambda: ['soundfile']

import torch.nn.functional as F
import cv2
from speechbrain.inference.classifiers import EncoderClassifier
from sklearn.cluster import AgglomerativeClustering

MODEL_PATH = "best_model.h5"
model = None

# Secondary audio deepfake detection using transformers
AUDIO_HF_MODEL_NAME = "Andyrasika/deepfake_voice_recognition"  # Example model
audio_hf_model = None
audio_hf_processor = None

# AI Image Detection Models (Ensemble)
AI_MODEL_NAMES = [
    "umm-maybe/AI-image-detector",
    "Organika/sdxl-detector",  # Better SDXL detection
]
ai_models = []
ai_models = []
ai_processors = []

# Age/Gender Recognition Model
AGE_GENDER_MODEL_NAME = "audeering/wav2vec2-large-robust-24-ft-age-gender"
age_gender_model = None
age_gender_processor = None

# Summarization Model
SUMMARIZATION_MODEL_NAME = "sshleifer/distilbart-cnn-12-6"
summarization_pipeline = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"✅ Audio Model loaded from {MODEL_PATH}")
        except Exception as e:
            print(f"❌ Failed to load audio model: {e}")
    else:
        print(f"⚠️ Audio Model file not found at {MODEL_PATH}. Prediction will fail.")

def load_audio_hf_model():
    """Load secondary Hugging Face audio model for ensemble"""
    global audio_hf_model, audio_hf_processor
    try:
        print(f"⏳ Loading HF Audio Model: {AUDIO_HF_MODEL_NAME}...")
        from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
        audio_hf_processor = AutoFeatureExtractor.from_pretrained(AUDIO_HF_MODEL_NAME)
        audio_hf_model = AutoModelForAudioClassification.from_pretrained(AUDIO_HF_MODEL_NAME)
        print(f"✅ HF Audio Model loaded: {AUDIO_HF_MODEL_NAME}")
    except Exception as e:
        print(f"⚠️ Failed to load HF audio model: {e}")
        # Continue without secondary model

def load_ai_model():
    global ai_models, ai_processors
    for model_name in AI_MODEL_NAMES:
        try:
            print(f"⏳ Loading AI Image Detection Model: {model_name}...")
            processor = AutoImageProcessor.from_pretrained(model_name)
            model = AutoModelForImageClassification.from_pretrained(model_name)
            ai_processors.append(processor)
            ai_models.append(model)
            print(f"✅ AI Image Model loaded: {model_name}")
        except Exception as e:
            print(f"⚠️ Failed to load {model_name}: {e}")
            print(f"⚠️ Failed to load {model_name}: {e}")
            # Continue loading other models even if one fails

def load_age_gender_model():
    global age_gender_model, age_gender_processor
    try:
        print(f"⏳ Loading Age/Gender Model: {AGE_GENDER_MODEL_NAME}...")
        from transformers import Wav2Vec2Processor, AutoModelForAudioClassification
        age_gender_processor = Wav2Vec2Processor.from_pretrained(AGE_GENDER_MODEL_NAME)
        age_gender_model = AutoModelForAudioClassification.from_pretrained(AGE_GENDER_MODEL_NAME)
        print(f"✅ Age/Gender Model loaded: {AGE_GENDER_MODEL_NAME}")
    except Exception as e:
        print(f"⚠️ Failed to load Age/Gender model: {e}")

def load_summarization_model():
    global summarization_pipeline
    try:
        print(f"⏳ Loading Summarization Model: {SUMMARIZATION_MODEL_NAME}...")
        from transformers import pipeline
        summarization_pipeline = pipeline("summarization", model=SUMMARIZATION_MODEL_NAME)
        print(f"✅ Summarization Model loaded: {SUMMARIZATION_MODEL_NAME}")
    except Exception as e:
        print(f"⚠️ Failed to load Summarization model: {e}")

# Speaker Recognition Model (for Diarization)
SPEAKER_MODEL_NAME = "speechbrain/spkrec-ecapa-voxceleb"
speaker_recognition_model = None

def load_speaker_recognition_model():
    global speaker_recognition_model
    try:
        print(f"⏳ Loading Speaker Recognition Model: {SPEAKER_MODEL_NAME}...")
        speaker_recognition_model = EncoderClassifier.from_hparams(source=SPEAKER_MODEL_NAME, savedir="tmp_model")
        print(f"✅ Speaker Recognition Model loaded: {SPEAKER_MODEL_NAME}")
    except Exception as e:
        print(f"⚠️ Failed to load Speaker Recognition model: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    load_audio_hf_model()  # Load secondary audio model
    load_model()
    load_audio_hf_model()  # Load secondary audio model
    load_ai_model()
    load_age_gender_model()
    load_summarization_model()
    load_speaker_recognition_model()
    init_db()
    init_db()
    print("✅ Database initialized.")
    yield

app = FastAPI(lifespan=lifespan)

# Allow CORS for React Native app (especially if running on web or different ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import av

def load_audio_with_av(file_path, sr=16000, duration=3):
    try:
        container = av.open(file_path)
        audio_stream = next(s for s in container.streams if s.type == 'audio')
        
        # Resample to target sample rate
        resampler = av.audio.resampler.AudioResampler(format='flt', layout='mono', rate=sr)
        
        audio_data = []
        for frame in container.decode(audio_stream):
            # Resample frame
            resampled_frames = resampler.resample(frame)
            for resampled_frame in resampled_frames:
                # Flatten to 1D array immediately to avoid shape mismatch during concatenation
                # (1, samples) -> (samples,)
                audio_data.append(resampled_frame.to_ndarray().flatten())
        
        # Concatenate all frames
        if not audio_data:
            return None, None
            
        audio = np.concatenate(audio_data)
        
        # Flatten if necessary (should be 1D array for mono)
        if audio.ndim > 1:
            audio = audio.flatten()
            
        # Handle duration limit
        if duration is not None:
            target_length = int(sr * duration)
            if len(audio) > target_length:
                audio = audio[:target_length]
            
        return audio, sr
    except Exception as e:
        print(f"PyAV loading error: {e}")
        return None, None

def extract_mel_spectrogram(file_path, sr=16000, n_mels=128, duration=3):
    """
    Replicated from Kaggle Notebook
    """
    try:
        # Load audio using PyAV (more robust for m4a/aac)
        audio, _ = load_audio_with_av(file_path, sr=sr, duration=duration)
        
        if audio is None:
            # Fallback to librosa if PyAV fails (though unlikely for m4a)
            print("PyAV failed, trying librosa...")
            audio, _ = librosa.load(file_path, sr=sr, duration=duration)
        
        # Length normalization (3 seconds)
        target_length = sr * duration
        if len(audio) < target_length:
            audio = np.pad(audio, (0, target_length - len(audio)))
        else:
            audio = audio[:target_length]
        
        # Mel-spectrogram calculation
        mel = librosa.feature.melspectrogram(
            y=audio,
            sr=sr,
            n_mels=n_mels,
            n_fft=2048,
            hop_length=512,
            fmax=8000
        )
        
        # dB scale conversion
        mel_db = librosa.power_to_db(mel, ref=np.max)
        
        # Normalization (mean 0, std 1)
        mel_db = (mel_db - mel_db.mean()) / (mel_db.std() + 1e-6)
        
        return mel_db
    
    except Exception as e:
        print(f"Error extracting features: {e}")
        return None

import io
import base64

def analyze_image_combined(file_path):
    try:
        img = Image.open(file_path)
        img = img.convert('RGB')
        
        # --- 1. Heuristic Analysis (ELA) ---
        ela_score = 0
        is_ela_suspicious = False
        ela_image_base64 = None
        suspicious_regions = []  # Initialize here to ensure it's always defined

        tmp_filename = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                img.save(tmp, 'JPEG', quality=90)
                tmp_filename = tmp.name
            
            resaved = Image.open(tmp_filename)
            try:
                ela = ImageChops.difference(img, resaved)
                extrema = ela.getextrema()
                max_diff = max([ex[1] for ex in extrema])
                if max_diff == 0:
                    max_diff = 1
                scale = 255.0 / max_diff
                ela = ImageEnhance.Brightness(ela).enhance(scale)
                
                # Convert ELA to base64 for visualization
                buffered = io.BytesIO()
                ela.save(buffered, format="JPEG")
                ela_image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
                
                stat = ImageStat.Stat(ela)
                ela_score = sum(stat.mean) / len(stat.mean)

                # --- Contour Detection for Red Line Visualization ---
                try:
                    # Convert ELA to grayscale numpy array
                    ela_np = np.array(ela.convert('L'))

                    # Threshold to find bright spots (suspicious areas)
                    # Using lower threshold for testing - can be adjusted later
                    threshold_value = 30  # Lowered for testing
                    _, thresh = cv2.threshold(ela_np, threshold_value, 255, cv2.THRESH_BINARY)

                    print(f"[CONTOUR] ELA threshold={threshold_value}, ELA score={ela_score:.2f}")

                    # Find contours
                    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

                    print(f"[CONTOUR] Found {len(contours)} total contours")

                    # Sort contours by area (largest first) and take top N
                    contour_areas = [(contour, cv2.contourArea(contour)) for contour in contours]
                    contour_areas.sort(key=lambda x: x[1], reverse=True)

                    # Take top 20 largest contours or those above min_area
                    min_area = 100  # Very low threshold
                    max_regions = 20  # Limit to prevent too many regions

                    for contour, area in contour_areas[:max_regions]:
                        if area > min_area:
                            # Simplify contour to reduce data size
                            epsilon = 0.005 * cv2.arcLength(contour, True)
                            approx = cv2.approxPolyDP(contour, epsilon, True)

                            # Convert to list of points [[x, y], ...]
                            points = approx.reshape(-1, 2).tolist()
                            suspicious_regions.append(points)
                            print(f"[CONTOUR] Added suspicious region #{len(suspicious_regions)} with area={area:.1f}, points={len(points)}")

                    print(f"[CONTOUR] Total suspicious regions after filtering: {len(suspicious_regions)}")

                    # --- Generate Visualized Image for Sharing ---
                    # Convert original PIL image to numpy array (RGB)
                    visualized_np = np.array(img)
                    # OpenCV uses BGR, but we are working with RGB from PIL. 
                    # If we use cv2.polylines on RGB array, we need to specify color as (R, G, B).
                    # Red color in RGB is (255, 0, 0).
                    
                    # Draw contours
                    for region in suspicious_regions:
                        # Convert list of lists to numpy array of points (int32)
                        pts = np.array(region, np.int32)
                        pts = pts.reshape((-1, 1, 2))
                        cv2.polylines(visualized_np, [pts], True, (255, 0, 0), 3) # Red color, thickness 3
                    
                    # Convert back to PIL Image
                    visualized_img = Image.fromarray(visualized_np)
                    
                    # Convert to base64
                    buffered_vis = io.BytesIO()
                    visualized_img.save(buffered_vis, format="JPEG", quality=85)
                    visualized_image_base64 = base64.b64encode(buffered_vis.getvalue()).decode('utf-8')

                except Exception as e:
                    print(f"Contour detection/visualization error: {e}")
                    import traceback
                    traceback.print_exc()
                    visualized_image_base64 = None

            finally:
                resaved.close()
                
            if tmp_filename and os.path.exists(tmp_filename):
                os.remove(tmp_filename)
                
        except Exception as e:
            print(f"ELA error: {e}")
            if tmp_filename and os.path.exists(tmp_filename):
                try: os.remove(tmp_filename)
                except: pass
            visualized_image_base64 = None

        # Improved ELA threshold (more conservative)
        is_ela_suspicious = ela_score > 55  # Raised from 30 to 55

        # --- 2. AI Model Analysis (Ensemble) ---
        ai_probability = 0
        ai_verdict = "Unknown"
        model_predictions = []

        if len(ai_models) > 0 and len(ai_processors) > 0:
            for idx, (processor, model) in enumerate(zip(ai_processors, ai_models)):
                try:
                    inputs = processor(images=img, return_tensors="pt")
                    with torch.no_grad():
                        outputs = model(**inputs)
                        logits = outputs.logits
                        probs = F.softmax(logits, dim=-1)

                    # Check labels - handle different label configurations
                    id2label = model.config.id2label

                    # Try to identify which index is artificial/fake
                    artificial_idx = None
                    for label_idx, label_name in id2label.items():
                        if 'artificial' in label_name.lower() or 'fake' in label_name.lower() or 'ai' in label_name.lower():
                            artificial_idx = label_idx
                            break

                    # If not found, assume index 0 is artificial (common convention)
                    if artificial_idx is None:
                        artificial_idx = 0

                    artificial_prob = float(probs[0][artificial_idx]) * 100
                    human_prob = 100 - artificial_prob

                    model_predictions.append(artificial_prob)
                    print(f"Model {idx} ({AI_MODEL_NAMES[idx]}): Artificial={artificial_prob:.2f}%")

                except Exception as e:
                    print(f"AI Model {idx} error: {e}")

            # Ensemble: Use weighted average (more weight to models that agree)
            if len(model_predictions) > 0:
                # Simple average
                ai_probability = sum(model_predictions) / len(model_predictions)

                # Check agreement between models
                if len(model_predictions) > 1:
                    variance = np.var(model_predictions)
                    # If models disagree significantly, reduce confidence
                    if variance > 500:  # High disagreement
                        ai_probability = ai_probability * 0.85  # Reduce confidence

                ai_verdict = "Artificial" if ai_probability > 50 else "Human"
                print(f"Ensemble Result: Artificial={ai_probability:.2f}%, Verdict={ai_verdict}")
            else:
                print("⚠️ No AI models available for prediction")

        # --- 3. Improved Final Decision Logic ---
        # Use multi-factor weighted approach
        final_score = 0
        is_manipulated = False

        # Define confidence thresholds
        AI_HIGH_THRESHOLD = 75      # High confidence AI detection
        AI_MODERATE_THRESHOLD = 60  # Moderate confidence
        ELA_HIGH_THRESHOLD = 65     # High confidence ELA detection
        ELA_MODERATE_THRESHOLD = 50 # Moderate confidence

        if len(ai_models) > 0 and len(ai_processors) > 0:
            # Primary decision based on AI model (more reliable)
            if ai_probability >= AI_HIGH_THRESHOLD:
                # High confidence AI detection
                if ela_score >= ELA_MODERATE_THRESHOLD:
                    # Both AI and ELA agree - very high confidence
                    is_manipulated = True
                    final_score = min(ai_probability * 0.75 + ela_score * 0.25, 99)
                elif ela_score < 30:
                    # AI says fake but ELA is very low - reduce confidence
                    is_manipulated = ai_probability > 85
                    final_score = ai_probability * 0.85 if is_manipulated else (100 - ai_probability)
                else:
                    # AI confident, ELA neutral
                    is_manipulated = True
                    final_score = min(ai_probability * 0.9, 95)

            elif ai_probability >= AI_MODERATE_THRESHOLD:
                # Moderate AI confidence - need ELA support
                if ela_score >= ELA_HIGH_THRESHOLD:
                    # ELA strongly agrees
                    is_manipulated = True
                    final_score = min(ai_probability * 0.6 + ela_score * 0.4, 90)
                else:
                    # Not enough evidence
                    is_manipulated = False
                    final_score = (100 - ai_probability) * 0.8

            elif ela_score >= ELA_HIGH_THRESHOLD:
                # Low AI confidence but high ELA - likely edited/compressed
                is_manipulated = True
                final_score = min(ela_score * 1.2, 85)
            else:
                # Both low - likely genuine
                is_manipulated = False
                final_score = min((100 - ai_probability) * 0.95, 98)
        else:
            # Fallback to ELA only (very conservative)
            if ela_score >= 70:  # Very high threshold without AI
                is_manipulated = True
                final_score = min(ela_score * 1.1, 90)
            else:
                is_manipulated = False
                final_score = max(100 - ela_score, 50)
        
        result = {
            "is_manipulated": is_manipulated,
            "confidence": final_score,
            "ela_score": ela_score,
            "ai_probability": ai_probability,
            "verdict": ai_verdict,
            "ela_image": ela_image_base64,
            "visualized_image": visualized_image_base64,
            "suspicious_regions": suspicious_regions,
            "image_dimensions": {"width": img.width, "height": img.height}
        }

        print(f"[IMAGE ANALYSIS] is_manipulated={is_manipulated}, suspicious_regions_count={len(suspicious_regions)}, dimensions={img.width}x{img.height}")
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Image analysis error: {e}")
        return None

def convert_to_wav(input_path):
    """Convert any audio file to WAV format for SpeechRecognition"""
    try:
        # Load audio with PyAV (robust for m4a/aac) - read entire file (duration=None)
        audio, sr_rate = load_audio_with_av(input_path, sr=16000, duration=None)
        
        if audio is None:
             # Fallback to librosa
             audio, sr_rate = librosa.load(input_path, sr=16000, mono=True)

        # Create temporary WAV file
        import soundfile as sf
        wav_path = input_path.rsplit('.', 1)[0] + '_converted.wav'
        sf.write(wav_path, audio, sr_rate)

        return wav_path
    except Exception as e:
        print(f"Audio conversion error: {e}")
        return None

def extract_voice_fingerprint(file_path):
    try:
        # Use PyAV for robust loading
        y, sr = load_audio_with_av(file_path, sr=16000, duration=10)
        if y is None:
            y, sr = librosa.load(file_path, sr=16000, duration=10)
            
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        fingerprint = np.mean(mfcc, axis=1)
        return fingerprint
    except Exception as e:
        print(f"Fingerprint error: {e}")
        return None

def diarize_audio(file_path, num_speakers=None):
    """
    Perform speaker diarization:
    1. VAD (Voice Activity Detection) to find speech segments
    2. Extract embeddings for each segment
    3. Cluster embeddings to identify speakers
    """
    if speaker_recognition_model is None:
        print("Speaker recognition model not loaded.")
        return None

    try:
        # 1. Load Audio (16kHz mono)
        wav_path = convert_to_wav(file_path)
        if not wav_path:
            return None
        
        # Load using torchaudio for VAD compatibility
        import torchaudio
        wav, sr = torchaudio.load(wav_path)
        
        # Resample if needed (Silero VAD expects 16k or 8k)
        if sr != 16000:
            resampler = torchaudio.transforms.Resample(sr, 16000)
            wav = resampler(wav)
            sr = 16000

        # 2. VAD - Get speech timestamps
        model, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad', model='silero_vad', force_reload=False, trust_repo=True)
        (get_speech_timestamps, save_audio, read_audio, VADIterator, collect_chunks) = utils
        
        # Get speech timestamps
        speech_timestamps = get_speech_timestamps(wav, model, sampling_rate=sr)
        
        if not speech_timestamps:
            print("No speech detected.")
            return []

        # 3. Extract Embeddings for each segment
        embeddings = []
        segments = []
        
        for ts in speech_timestamps:
            start = ts['start']
            end = ts['end']
            
            # Extract segment (ensure min length for embedding)
            segment = wav[:, start:end]
            
            # Skip very short segments (< 0.5s)
            if segment.shape[1] < 8000: 
                continue
                
            # Extract embedding
            # EncoderClassifier expects (batch, time)
            embedding = speaker_recognition_model.encode_batch(segment)
            # Embedding shape: (batch, 1, emb_dim) -> flatten to (emb_dim,)
            embedding = embedding.squeeze().cpu().numpy()
            
            embeddings.append(embedding)
            segments.append({
                'start': start / sr,
                'end': end / sr,
                'audio': segment # Keep audio for gender analysis
            })

        if not embeddings:
            return []

        # 4. Clustering
        X = np.array(embeddings)
        
        # Determine number of clusters
        if num_speakers is None:
            # Simple heuristic: if < 5 segments, assume 1 speaker. Else try to find 2.
            # In real app, might use spectral clustering or user input.
            # For now, let's assume 2 speakers for phone calls if enough data, else 1.
            n_clusters = 2 if len(X) >= 4 else 1
        else:
            n_clusters = num_speakers
            
        if len(X) < n_clusters:
             n_clusters = len(X)

        clustering = AgglomerativeClustering(n_clusters=n_clusters).fit(X)
        labels = clustering.labels_
        
        # Group segments by speaker
        speakers = {}
        for i, label in enumerate(labels):
            speaker_id = f"Speaker {label + 1}"
            if speaker_id not in speakers:
                speakers[speaker_id] = {
                    'id': speaker_id,
                    'segments': [],
                    'total_duration': 0,
                    'audio_tensors': []
                }
            
            seg = segments[i]
            speakers[speaker_id]['segments'].append({
                'start': seg['start'],
                'end': seg['end']
            })
            speakers[speaker_id]['total_duration'] += (seg['end'] - seg['start'])
            speakers[speaker_id]['audio_tensors'].append(seg['audio'])

        # 5. Analyze each speaker (Age/Gender)
        diarization_result = []
        for spk_id, data in speakers.items():
            # Concatenate all audio segments for this speaker
            if data['audio_tensors']:
                combined_audio = torch.cat(data['audio_tensors'], dim=1)
                # Convert to numpy for predict_age_gender compatibility
                combined_audio_np = combined_audio.squeeze().numpy()
                
                # Analyze demographics
                demographics = predict_age_gender(None, audio_data=combined_audio_np)
                
                diarization_result.append({
                    'id': spk_id,
                    'duration': data['total_duration'],
                    'demographics': demographics,
                    'segments': data['segments'] # Optional: return all segments
                })
        
        # Clean up
        if os.path.exists(wav_path) and wav_path != file_path: # Don't delete original if same
             try: os.remove(wav_path)
             except: pass
             
        return diarization_result

    except Exception as e:
        print(f"Diarization error: {e}")
        import traceback
        traceback.print_exc()
        return None

def predict_age_gender(file_path, audio_data=None):
    """Predict age and gender from audio file or raw audio data"""
    if age_gender_model is None or age_gender_processor is None:
        return None

    try:
        audio = None
        sr = 16000

        if audio_data is not None:
            # Use provided audio data (numpy array)
            audio = audio_data
        elif file_path:
            # Load audio (resample to 16k) using PyAV
            audio, sr = load_audio_with_av(file_path, sr=16000, duration=10) # Limit to 10s for efficiency
            if audio is None:
                 audio, sr = librosa.load(file_path, sr=16000, duration=10)
        
        if audio is None:
            return None
        
        # Process audio
        inputs = age_gender_processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
        
        with torch.no_grad():
            logits = age_gender_model(inputs.input_values, attention_mask=inputs.attention_mask).logits
            
        # Get prediction
        # The model outputs logits for: [female, male, child, etc.] - check config
        # Actually this specific model outputs a single label string usually?
        # Let's check the id2label mapping
        id2label = age_gender_model.config.id2label
        predicted_idx = torch.argmax(logits, dim=-1).item()
        predicted_label = id2label[predicted_idx]
        
        # Format: "female_20s", "male_60s", etc.
        # We want to parse this into { "gender": "Female", "age_group": "20s" }
        
        gender = "Unknown"
        age_group = "Unknown"
        
        if "female" in predicted_label:
            gender = "Female"
        elif "male" in predicted_label:
            gender = "Male"
        elif "child" in predicted_label:
            gender = "Child"
            
        # Extract age if present (e.g., "female_26")
        # The labels are often like 'female_child', 'female_teen', 'female_thirties', etc.
        # Or sometimes 'female:20-29'
        # Let's just return the raw label mapped to user friendly string
        
        return {
            "raw_label": predicted_label,
            "gender": gender,
            "age_group": predicted_label.replace(gender.lower() + '_', '') if gender != "Unknown" else predicted_label
        }

    except Exception as e:
        print(f"Age/Gender prediction error: {e}")
        return None

def analyze_context(file_path):
    r = sr.Recognizer()
    wav_path = None

    try:
        # Convert to WAV if not already
        if not file_path.lower().endswith('.wav'):
            wav_path = convert_to_wav(file_path)
            if wav_path is None:
                raise Exception("Failed to convert audio to WAV")
            file_to_analyze = wav_path
        else:
            file_to_analyze = file_path

        with sr.AudioFile(file_to_analyze) as source:
            audio_data = r.record(source)
            # Recognize (Korean)
            text = r.recognize_google(audio_data, language='ko-KR')
            
        keywords = {
            "검찰": 10, "송금": 10, "계좌": 5, "비밀번호": 8, "보안": 5,
            "대출": 5, "신용": 5, "가족": 3, "납치": 10, "사고": 5,
            "상품권": 8, "기프트카드": 8, "어플": 5, "설치": 5,
            "엄마": 2, "아빠": 2 # Contextual triggers
        }
        
        detected = []
        score = 0
        for word, weight in keywords.items():
            if word in text:
                detected.append(word)
                score += weight
        
        risk_score = min(score * 5, 100)
        
        # --- Summarization ---
        summary_text = ""
        if len(text) > 50 and summarization_pipeline is not None:
            try:
                # Summarize
                # Max length should be adaptive
                max_len = min(100, int(len(text) / 2))
                min_len = min(20, int(len(text) / 4))
                
                summary_result = summarization_pipeline(text, max_length=max_len, min_length=min_len, do_sample=False)
                summary_text = summary_result[0]['summary_text']
            except Exception as e:
                print(f"Summarization error: {e}")
                summary_text = text[:100] + "..." # Fallback
        else:
            summary_text = text # Too short to summarize

        return {
            "text": text,
            "summary": summary_text,
            "detected_keywords": detected,
            "risk_score": risk_score
        }
    except sr.UnknownValueError:
        return {"text": "(음성 인식 실패)", "summary": "", "detected_keywords": [], "risk_score": 0}
    except Exception as e:
        print(f"Context analysis error: {e}")
        return {"text": "(분석 오류)", "summary": "", "detected_keywords": [], "risk_score": 0}
    finally:
        # Clean up converted WAV file
        if wav_path and os.path.exists(wav_path):
            try:
                os.remove(wav_path)
            except:
                pass

@app.post("/register_voice")
async def register_voice(name: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        fingerprint = extract_voice_fingerprint(tmp_path)
        if fingerprint is None:
            raise HTTPException(status_code=400, detail="Could not extract voice fingerprint.")
        
        # Check if voice exists
        existing_voice = db.query(Voice).filter(Voice.name == name).first()
        if existing_voice:
             # Update existing
             existing_voice.fingerprint = fingerprint.tolist()
        else:
            # Create new
            new_voice = Voice(name=name, fingerprint=fingerprint.tolist())
            db.add(new_voice)
        
        db.commit()
        return {"status": "success", "message": f"Voice registered for {name}"}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/verify_voice")
async def verify_voice(target_name: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    target_voice = db.query(Voice).filter(Voice.name == target_name).first()
    if not target_voice:
        raise HTTPException(status_code=404, detail="Target voice not found.")
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        fingerprint = extract_voice_fingerprint(tmp_path)
        if fingerprint is None:
            raise HTTPException(status_code=400, detail="Could not extract voice fingerprint.")
        
        target_fp = np.array(target_voice.fingerprint)
        # Cosine distance (0 = identical, 2 = opposite). Similarity = 1 - distance
        dist = cosine(fingerprint, target_fp)
        similarity = (1 - dist) * 100
        
        is_match = similarity > 80 # Threshold
        
        return {
            "target_name": target_name,
            "similarity": similarity,
            "is_match": is_match
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if model is None:
        # Fallback if model is missing: return a mock error or simulation
        # For now, let's return a 503 Service Unavailable
        raise HTTPException(status_code=503, detail="Model not loaded. Please place 'best_model.h5' in the backend directory.")

    # Save uploaded file to temp
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Preprocess
        mel_spec = extract_mel_spectrogram(tmp_path)
        
        if mel_spec is None:
            raise HTTPException(status_code=400, detail="Could not process audio file.")

        # Prepare for model (add batch and channel dimensions)
        # Shape: (1, 128, 94, 1)
        X = mel_spec[np.newaxis, ..., np.newaxis]

        # Predict with primary CNN-LSTM model
        prediction = model.predict(X)
        cnn_lstm_score = float(prediction[0][0]) # Probability of being FAKE (1)

        # Try secondary HF model for ensemble
        hf_score = None
        if audio_hf_model is not None and audio_hf_processor is not None:
            try:
                # Load audio for HF model
                audio_data, sr = librosa.load(tmp_path, sr=16000, mono=True)

                # Process for HF model
                inputs = audio_hf_processor(audio_data, sampling_rate=sr, return_tensors="pt")

                with torch.no_grad():
                    outputs = audio_hf_model(**inputs)
                    logits = outputs.logits
                    probs = F.softmax(logits, dim=-1)

                # Assume label 1 is fake (check model config)
                hf_score = float(probs[0][1]) if probs.shape[1] > 1 else float(probs[0][0])
                print(f"HF Audio Model Score: {hf_score:.4f}")
            except Exception as e:
                print(f"HF Audio model prediction error: {e}")

        # Ensemble: Weighted average if both models available
        if hf_score is not None:
            # Weight: 70% CNN-LSTM (more trained), 30% HF model
            score = cnn_lstm_score * 0.7 + hf_score * 0.3
            print(f"Ensemble Score: CNN-LSTM={cnn_lstm_score:.4f}, HF={hf_score:.4f}, Final={score:.4f}")
        else:
            score = cnn_lstm_score

        # Improved Thresholding with confidence zones
        THRESHOLD_HIGH_CONFIDENCE = 0.70  # High confidence deepfake
        THRESHOLD_MODERATE = 0.55          # Moderate confidence deepfake
        THRESHOLD_LOW_CONFIDENCE = 0.30    # High confidence real

        if score >= THRESHOLD_HIGH_CONFIDENCE:
            # High confidence deepfake
            is_deepfake = True
            confidence = min(score * 100, 99)
        elif score >= THRESHOLD_MODERATE:
            # Moderate confidence deepfake
            is_deepfake = True
            confidence = score * 85  # Reduced confidence for moderate zone
        elif score > THRESHOLD_LOW_CONFIDENCE:
            # Uncertain zone - use stricter threshold
            is_deepfake = score > 0.50
            # Penalize confidence in uncertain zone
            confidence = max(score, 1 - score) * 70
        else:
            # High confidence real
            is_deepfake = False
            confidence = min((1 - score) * 100, 99)

        # Real feature-based analysis
        # Analyze spectral characteristics
        mel_mean = np.mean(mel_spec)
        mel_std = np.std(mel_spec)
        mel_max = np.max(mel_spec)
        mel_min = np.min(mel_spec)

        # Frequency analysis - check for unnatural frequency patterns
        freq_range = mel_max - mel_min
        freq_variance = np.var(mel_spec)
        frequency_score = min(int((freq_variance / (freq_range + 1e-6)) * 100), 100)

        # Temporal pattern - check consistency over time
        temporal_variance = np.var(np.mean(mel_spec, axis=0))
        temporal_score = min(int(temporal_variance * 50), 100)

        # Acoustic feature - based on model score
        acoustic_score = int(score * 100)

        details = {
            "frequencyAnalysis": frequency_score,
            "temporalPattern": temporal_score,
            "acousticFeature": acoustic_score
        }

        # Context Analysis
        context_result = analyze_context(tmp_path)
        
        # Speaker Diarization & Age/Gender Analysis
        diarization_result = diarize_audio(tmp_path)
        speaker_demographics = None
        
        if diarization_result and len(diarization_result) > 0:
            # Use the primary speaker (longest duration) for the main display
            primary_speaker = max(diarization_result, key=lambda x: x['duration'])
            speaker_demographics = primary_speaker['demographics']
        else:
            # Fallback to single-speaker analysis
            speaker_demographics = predict_age_gender(tmp_path)

        # Voice ID (Identify speaker)
        fingerprint = extract_voice_fingerprint(tmp_path)
        speaker_id = "Unknown"
        max_similarity = 0
        
        if fingerprint is not None:
            voices = db.query(Voice).all()
            for voice in voices:
                fp = np.array(voice.fingerprint)
                dist = cosine(fingerprint, fp)
                sim = (1 - dist) * 100
                if sim > max_similarity:
                    max_similarity = sim
                    speaker_id = voice.name
            
            if max_similarity < 70: # Threshold for identification
                speaker_id = "Unknown"

        analysis_result = {
            "isDeepfake": is_deepfake,
            "confidence": confidence,
            "score": score,
            "details": details,
            "context": context_result,
            "speaker": {
                "id": speaker_id,
                "similarity": max_similarity,
                "demographics": speaker_demographics,
                "diarization": diarization_result
            }
        }

        # Save to DB
        log = AnalysisLog(filename=file.filename, result=analysis_result)
        db.add(log)
        db.commit()

        return analysis_result

    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file (retry on Windows PermissionError)
        if os.path.exists(tmp_path):
            import time
            for attempt in range(3):
                try:
                    os.remove(tmp_path)
                    break
                except PermissionError:
                    if attempt < 2:
                        time.sleep(0.1)
                    else:
                        print(f"Warning: Could not delete temp file: {tmp_path}")
                except Exception as cleanup_error:
                    print(f"Cleanup error: {cleanup_error}")
                    break

@app.get("/list_voices")
def list_voices(db: Session = Depends(get_db)):
    voices = db.query(Voice).all()
    return {"voices": [v.name for v in voices]}

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    logs = db.query(AnalysisLog).order_by(AnalysisLog.created_at.desc()).limit(50).all()
    return {"history": logs}

@app.post("/analyze_image")
async def analyze_image(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = analyze_image_combined(tmp_path)
        
        if result is None:
             raise HTTPException(status_code=400, detail="Could not analyze image.")
             
        return result
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.get("/")
def read_root():
    return {"status": "VoiceShield AI Backend Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
