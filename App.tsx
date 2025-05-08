import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Tts from 'react-native-tts';

// Custom type declaration to fix runOnJS (if needed later)
declare global {
  function runOnJS<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => void;
}

const App = () => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [objectCount, setObjectCount] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const lastSpokenRef = useRef<number>(Date.now()); // Track last spoken time to avoid overlap

  // Initialize Text-to-Speech with error handling
  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.5);
        Tts.addEventListener('tts-finish', () => {
          // Optional: Handle when speech finishes
        });
        console.log('TTS initialized successfully');
      } catch (error) {
        console.error('Failed to initialize TTS:', error);
        Alert.alert('TTS Error', 'Failed to initialize text-to-speech.');
      }
    };

    initTts();

    return () => {
      Tts.stop();
      Tts.removeAllListeners('tts-finish');
    };
  }, []);

  // Request camera permissions
  useEffect(() => {
    if (!hasPermission) {
      requestPermission().then((granted) => {
        if (!granted) {
          Alert.alert('Camera Permission', 'Camera access is required to use this app.');
        }
      });
    }
  }, [hasPermission, requestPermission]);

  // Simulate object count update (without frame processor for now)
  useEffect(() => {
    if (isCameraReady) {
      const interval = setInterval(() => {
        const simulatedObjectCount = Math.floor(Math.random() * 5); // Simulate 0-4 objects
        setObjectCount(simulatedObjectCount);
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isCameraReady]);

  // Speak the object count when it changes
  useEffect(() => {
    const now = Date.now();
    if (now - lastSpokenRef.current >= 2000) { // Speak every 2 seconds
      lastSpokenRef.current = now;
      const message = objectCount === 0 ? 'No objects detected.' : `${objectCount} object${objectCount === 1 ? '' : 's'} detected.`;
      Tts.speak(message).catch((error) => {
        console.error('TTS speak error:', error);
      });
    }
  }, [objectCount]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Camera permission is required to use this feature.</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text>No camera device found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        onInitialized={() => {
          console.log('Camera initialized');
          setIsCameraReady(true);
        }}
        onError={(error) => {
          console.log('Camera error:', error);
          Alert.alert('Camera Error', error.message);
        }}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          {objectCount === 0 ? 'No objects detected.' : `${objectCount} object${objectCount === 1 ? '' : 's'} detected.`}
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
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default App;