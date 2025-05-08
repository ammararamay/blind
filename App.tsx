import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

const App = () => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

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

  useEffect(() => {
    if (!hasPermission || !device) return;

    const interval = setInterval(async () => {
      if (camera.current) {
        try {
          const photo = await camera.current.takePhoto({});
          console.log('Photo captured:', photo.path);
        } catch (error) {
          console.error('Error capturing photo:', error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [hasPermission, device]);

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
        photo={true}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Scanning objects...</Text>
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