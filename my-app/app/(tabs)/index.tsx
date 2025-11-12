import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Camera as CameraModule, CameraView } from 'expo-camera';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isTaking, setIsTaking] = useState(false);
  const cameraRef = useRef<any | null>(null);

  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await CameraModule.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (e) {
        console.error('Permission request error', e);
        setHasPermission(false);
      }
    })();
  }, []);

  // When permission is granted, take a picture automatically after a short delay
  // No auto-capture: user will tap the Take picture button to capture

  const takePicture = async () => {
    if (!cameraRef.current || isTaking) return;
    try {
  setIsTaking(true);
  const options = { quality: 0.7, skipProcessing: true };
  const photo: any = await cameraRef.current.takePictureAsync(options as any);
  setPhotoUri(photo.uri);
    } catch (e) {
      console.error('Failed to take picture', e);
      Alert.alert('Error', 'Failed to take picture.');
    } finally {
      setIsTaking(false);
    }
  };

  const handleRetake = () => {
    // Clear preview and return to camera view; do not auto-capture.
    setPhotoUri(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <ThemedText>Requesting camera permission...</ThemedText>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <ThemedText>Camera permission denied.</ThemedText>
        <TouchableOpacity
          style={[styles.button, { marginTop: 12 }]}
          onPress={async () => {
            const { status } = await CameraModule.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}>
          <ThemedText style={styles.buttonText}>Allow camera</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* If we have a photo, show preview with Retake button */}
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.modernButton, styles.retakeButton]} onPress={handleRetake} activeOpacity={0.85}>
              <ThemedText style={styles.retakeButtonText}>Retake</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modernButton, styles.analyzeButton]}
              onPress={async () => {
                if (!photoUri) return;
                try {
                  const response = await fetch(photoUri);
                  const blob = await response.blob();
                  // Replace the URL below with your backend endpoint
                  const uploadResponse = await fetch('https://your-backend.com/api/analyze', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/octet-stream',
                    },
                    body: blob,
                  });
                  if (uploadResponse.ok) {
                    alert('Image sent for analysis!');
                  } else {
                    alert('Failed to send image.');
                  }
                } catch (e) {
                  alert('Error sending image: ' + e);
                }
              }}
              activeOpacity={0.85}
            >
              <ThemedText style={styles.analyzeButtonText}>Analyze</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.cameraBox}>
            <CameraView ref={cameraRef} style={styles.camera} />
          </View>
          <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={takePicture}>
            <ThemedText style={styles.buttonText}>Take picture</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  preview: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBox: {
    width: '85%',
    height: 540,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  modernButton: {
    flex: 1,
    minWidth: 120,
    marginHorizontal: 4,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  retakeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  analyzeButton: {
    backgroundColor: '#2563eb',
    borderWidth: 0,
  },
  retakeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#2563eb',
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#fff',
  },
  // ...existing code...
});
