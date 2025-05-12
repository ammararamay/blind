
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, Frame } from 'react-native-vision-camera';
import Tts from 'react-native-tts';
import { loadTensorflowModel } from 'react-native-fast-tflite';

const App = () => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [detectedObjects, setDetectedObjects] = useState<string>('');
  const [model, setModel] = useState<any>(null);

  // Initialize TTS
  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.addEventListener('tts-start', () => console.log('TTS started'));
    Tts.addEventListener('tts-finish', () => console.log('TTS finished'));

    return () => {
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
    };
  }, []);

  // Load TensorFlow Lite model
  useEffect(() => {
    (async () => {
      try {
        const loadedModel = await loadTensorflowModel(require('./assets/my_model.tflite'), 'android-gpu');
        setModel(loadedModel);
        Tts.speak('Model loaded successfully');
      } catch (error) {
        console.error('Error loading model:', error);
        Tts.speak('Failed to load model');
      }
    })();
  }, []);

  // Request camera permission
  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        const status = await requestPermission();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Denied',
            'Please enable camera access in settings to use this app.',
          );
        }
      }
    })();
  }, [hasPermission, requestPermission]);

  // Frame processor for real-time object detection
  const frameProcessor = useRef((frame: Frame) => {
    if (!model) return;

    try {
      const imageData = frame.toRGB(); // Adjust based on model input (e.g., resize if needed)
      const results = model.run(imageData); // Run inference

      // Log results to debug
      console.log('Model inference results:', results);

      // Parse results (adjust based on your model's output format)
      const objects = results
        .filter((result: any) => result.confidence > 0.5) // Example: Filter by confidence
        .map((result: any) => result.label)
        .join(', ');

      if (objects && objects !== detectedObjects) {
        setDetectedObjects(objects);
        Tts.speak(`Detected: ${objects}`); // Use backticks for template literal
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }).current;

  if (!device || !hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {hasPermission ? 'Loading camera...' : 'No camera access'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          {detectedObjects || 'Scanning...'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;